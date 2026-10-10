import fs from 'node:fs/promises';
import path from 'node:path';
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
const isEnglish = ['en','english','英文','英语'].includes(String(data.regulation.source_language).toLowerCase());
const displayLabel = (label, translations = true) => {
  if (!label || !text(label.original) || (translations && (!text(label.chinese) || (!isEnglish && !text(label.english))))) throw new Error('Record original and required translations of source labels');
  return [...new Set([label.original,label.english,label.chinese].filter(text))].join('\n');
};
const rows = data.units.map(u => {
  const row = u.values;
  if (!Array.isArray(row) || row.length !== 14) throw new Error('Need 14-column rows');
  const labels = u.source_labels;
  if (!labels || !Object.hasOwn(labels,'control_subdomain')) throw new Error('Record whether an actual source subheading exists');
  const expected = [displayLabel(labels.control_domain),displayLabel(labels.clause_number),labels.control_subdomain === null ? '/' : displayLabel(labels.control_subdomain,false)];
  if (expected.some((v,i)=>row[i+1] !== v)) throw new Error('Displayed labels differ from original/translated source labels: '+u.id);
  if (!['是','否'].includes(row[7])) throw new Error('H requires 是 or 否');
  return row;
});
if (!rows.length) throw new Error('Need nonempty rows');
if (data.inventory.join('\n') !== data.units.map(u => u.id).join('\n')) throw new Error('Source inventory and units differ');
if (rows.some(r => r.some(v => typeof v === 'string' && v.length > 32767))) throw new Error('Split oversized clauses by original subparagraph before authoring');
if (rows.some(r => r.some(v => typeof v === 'string' && v.startsWith('=')))) throw new Error('Handle leading = as literal text using the spreadsheet API documentation, then verify saved original text');
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(args.template));
const sheet = wb.worksheets.getItemAt(0);
const previous = Math.max(3,sheet.getUsedRange().values.length);
const last = rows.length + 2;
// Preserve existing body styles; extend the final body style only beyond the template's range.
sheet.getRange('A3:N' + Math.max(last,previous)).clear({applyTo:'contents'});
for (let row = previous + 1; row <= last; row++) sheet.getRange('A'+row+':N'+row).copyFrom(sheet.getRange('A'+previous+':N'+previous),'all');
sheet.getRange('A3:N' + last).values = rows;
sheet.getRange('H1').values = [['是否适用于'+target.name]];
sheet.getRange('E2').values = [[data.regulation.source_language+'版条款（原文）']];
sheet.getRange('F2').values = [['英文版条款（翻译）']];
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
wb.notes.add({
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
