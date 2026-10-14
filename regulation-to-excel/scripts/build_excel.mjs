import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

// Copy this builder to a writable task directory with the platform's spreadsheet dependencies.
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  if (!process.argv[i].startsWith('--') || process.argv[i + 1] === undefined) throw new Error('Arguments require --name value');
  args[process.argv[i].slice(2)] = process.argv[i + 1];
}
for (const key of ['manifest', 'template', 'output', 'preview-dir']) if (!args[key]) throw new Error('Missing --' + key);
const data = JSON.parse((await fs.readFile(args.manifest, 'utf8')).replace(/^\uFEFF/, ''));
const text = value => typeof value === 'string' && value.trim().length > 0;
const target = data.target_environment;
if (!target || !text(target.name) || !text(target.business_context)) throw new Error('Record the user-provided target environment and business context');
const review = data.source_review;
if (!review || review.url_status !== 'matched' || typeof review.newer_version_found !== 'boolean') throw new Error('Complete URL and version review before authoring');
if (review.newer_version_found && (!text(review.confirmed_version) || review.confirmed_version !== data.regulation.version)) throw new Error('A newer version was found: obtain the user-selected version before authoring');
const colors = data.format?.applicability_colors ?? {'是':'#00B050','否':'#BFBFBF'};
if (['是','否'].some(v => !/^#[0-9a-f]{6}$/i.test(colors[v] ?? ''))) throw new Error('Applicability colors require two #RRGGBB values');
const language = data.language_plan;
if (!language || !text(language.local_language) || !text(language.local_source_search_note) || !['official_original','translated_from_english'].includes(language.local_text_kind)) throw new Error('Record the local language, official-source search, and local text provenance');
const fromEnglish = language.local_text_kind === 'translated_from_english';
const localIsEnglish = ['en','english','英文','英语'].includes(language.local_language.toLowerCase());
if (fromEnglish) {
  if (!['en','english','英文','英语'].includes(String(data.regulation.source_language).toLowerCase()) || !String(data.regulation.source_note).includes('非官方译文，译自英文')) throw new Error('English-based local translation requires an English source and explicit nonofficial attribution');
} else if (data.regulation.source_language !== language.local_language) throw new Error('Official local source language must match the recorded local language');
const sourceColumn = fromEnglish ? 5 : 4;
const sourceKey = fromEnglish ? 'english' : 'local';
const displayLabel = label => {
  if (!label || ['original','local','english','chinese'].some(k=>!text(label[k])) || label.original !== label[sourceKey]) throw new Error('Record three-language labels and preserve the actual source label');
  return [...new Set([label.local,label.english,label.chinese])].join('\n');
};
const rows = data.units.map(u => {
  const row = u.values;
  if (!Array.isArray(row) || row.length !== 14) throw new Error('Need 14-column rows');
  const labels = u.source_labels;
  if (!labels || !Object.hasOwn(labels,'control_subdomain')) throw new Error('Record whether an actual source subheading exists');
  const expected = [displayLabel(labels.control_domain),displayLabel(labels.clause_number),labels.control_subdomain === null ? '/' : displayLabel(labels.control_subdomain)];
  if (expected.some((v,i)=>row[i+1] !== v)) throw new Error('Displayed labels differ from original/translated source labels: '+u.id);
  if (!['是','否'].includes(row[7])) throw new Error('H requires 是 or 否');
  if ([4,5,6].some(c=>!text(row[c]))) throw new Error('Local, English, and Chinese text are all required: '+u.id);
  if (!text(u.original_text) || row[sourceColumn] !== u.original_text) throw new Error('Preserve the actual source text in its language column: '+u.id);
  if (localIsEnglish && row[4] !== row[5]) throw new Error('When the local language is English, E and F must both preserve the same English text');
  return row;
});
if (!rows.length) throw new Error('Need nonempty rows');
if (data.inventory.join('\n') !== data.units.map(u => u.id).join('\n')) throw new Error('Source inventory and units differ');
if (rows.some(r => r.some(v => typeof v === 'string' && v.length > 32767))) throw new Error('Split oversized clauses by original subparagraph before authoring');
if (rows.some(r => r.some(v => typeof v === 'string' && v.startsWith('=')))) throw new Error('Handle leading = as literal text using the spreadsheet API documentation, then verify saved original text');
// Updating imported notes is not exposed by the documented artifact API. Update
// only the existing note XML in a disposable template before importing it.
const temporary = await fs.mkdtemp(path.join(os.tmpdir(),'regulation-source-note-'));
let prepared, wb;
try {
  const helper = fileURLToPath(new URL('./prepare_source_note.py',import.meta.url));
  const { stdout } = await promisify(execFile)(args.python ?? 'python',[
    helper,'--template',args.template,'--manifest',args.manifest,
    '--output',path.join(temporary,'template.xlsx')
  ],{encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  prepared = JSON.parse(stdout);
  wb = await SpreadsheetFile.importXlsx(await FileBlob.load(prepared.template));
} finally {
  await fs.rm(temporary,{recursive:true,force:true});
}
const sheet = wb.worksheets.getItemAt(0);
const previous = Math.max(3,sheet.getUsedRange().values.length);
const last = rows.length + 2;
// Preserve existing body styles; extend the final body style only beyond the template's range.
sheet.getRange('A3:N' + Math.max(last,previous)).clear({applyTo:'contents'});
for (let row = previous + 1; row <= last; row++) sheet.getRange('A'+row+':N'+row).copyFrom(sheet.getRange('A'+previous+':N'+previous),'all');
sheet.getRange('A3:N' + last).values = rows;
sheet.getRange('H1').values = [['是否适用于'+target.name]];
sheet.getRange('E2').values = [[language.local_language+'版条款（'+(fromEnglish?'非官方译文，译自英文':'原文')+'）']];
sheet.getRange('F2').values = [['英文版条款（'+(fromEnglish || localIsEnglish?'原文':'翻译')+'）']];
sheet.getRange('G2').values = [['中文简体版条款（翻译）']];
const applicability = sheet.getRange('H3:H'+Math.max(last,previous));
applicability.conditionalFormats.deleteAll();
sheet.getRange('H3:H'+last).dataValidation = {rule:{type:'list',values:['是','否']}};
for (const value of ['是','否']) sheet.getRange('H3:H'+last).conditionalFormats.add('cellIs',{
  operator:'equal',formula:'"'+value+'"',format:{fill:colors[value]}
});
const widths = [];
for (let j = 0; j < 14; j++) widths.push(Number(sheet.getRange(String.fromCharCode(65+j)+'1').format.columnWidth) || 16);
const chars = t => [...t].reduce((n,c) => n + (c.codePointAt(0)>255?2:1),0);
const baseHeight = Math.min(107,Number(sheet.getRange('A3').format.rowHeight) || 107);
for (let i = 0; i < rows.length; i++) {
  let lines = 1;
  for (let j = 0; j < 14; j++) {
    if (j === 5) continue; // The bundled template hides F; adapt this for a reference with visible F.
    const count = String(rows[i][j] ?? '').split('\n').reduce((n,t) => n + Math.max(1,Math.ceil(chars(t)/Math.max(4,widths[j]-2))),0);
    lines = Math.max(lines,count);
  }
  sheet.getRange('A'+(i+3)+':N'+(i+3)).format.rowHeight = Math.min(409.5,Math.max(baseHeight,lines*16.5+8));
  sheet.getRange('H'+(i+3)).format.fill = colors[rows[i][7]];
}
if (!prepared.has_source_note) wb.notes.add({
  id:sheet.name+':E3',
  target:{cell:{sheetName:sheet.name,sheetId:sheet.sheetId,address:'E3'}},
  authorId:'',createdAt:'',body:{plainText:data.regulation.source_note}
});
wb.recalculate();
console.log((await wb.inspect({
  kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options:{useRegex:true,maxResults:10},maxChars:1000
})).ndjson);
await fs.mkdir(path.dirname(args.output),{recursive:true});
await (await SpreadsheetFile.exportXlsx(wb)).save(args.output);
await fs.mkdir(args['preview-dir'],{recursive:true});
const index = predicate => {const i=rows.findIndex(predicate);return i<0?null:i+3;};
const longest = rows.reduce((a,r,i)=>String(r[4]).length>String(rows[a][4]).length?i:a,0)+3;
const cases = [
  ['header','A1:I3'],
  ['long','C'+longest+':I'+longest],
  ['yes',index(r=>r[7]==='是'),'H','N'],
  ['no',index(r=>r[7]==='否'),'H','N'],
  ['last','C'+last+':I'+last]
];
for (const [tag,where,left,right] of cases) {
  if (where === null) continue;
  const range = typeof where==='number'?left+where+':'+right+where:where;
  const preview = await wb.render({sheetName:sheet.name,range,scale:1,format:'png'});
  await fs.writeFile(path.join(args['preview-dir'],tag+'.png'),new Uint8Array(await preview.arrayBuffer()));
}
console.log(JSON.stringify({output:args.output,rows:rows.length,target:target.name,previewDirectory:args['preview-dir']}));
