import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

// Copy this builder to the task directory with the spreadsheet skill's runtime dependencies.
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  if (!process.argv[i].startsWith('--') || process.argv[i + 1] === undefined) throw new Error('Arguments require --name value');
  args[process.argv[i].slice(2)] = process.argv[i + 1];
}
for (const key of ['manifest', 'template', 'output', 'preview-dir']) if (!args[key]) throw new Error('Missing --' + key);
const data = JSON.parse((await fs.readFile(args.manifest, 'utf8')).replace(/^\uFEFF/, ''));
const rows = data.units.map(u => u.values);
if (!rows.length || rows.some(r => !Array.isArray(r) || r.length !== 14)) throw new Error('Need nonempty 14-column rows');
if (data.inventory.join('\n') !== data.units.map(u => u.id).join('\n')) throw new Error('Source inventory and units differ');
if (rows.some(r => r.some(v => typeof v === 'string' && v.length > 32767))) throw new Error('Split oversized clauses by original subparagraph before authoring');
if (rows.some(r => r.some(v => typeof v === 'string' && v.startsWith('=')))) throw new Error('Handle leading = as literal text using the spreadsheet API documentation, then verify saved original text');
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(args.template));
const sheet = wb.worksheets.getItemAt(0);
console.log((await wb.inspect({kind:'workbook,sheet', maxChars:1000})).ndjson);
const previous = sheet.getUsedRange().values.length;
const last = rows.length + 2;
sheet.getRange('A3:N' + Math.max(last, previous, 3)).clear({applyTo:'contents'});
sheet.getRange('A3:N' + last).values = rows;
sheet.getRange('E2').values = [[data.regulation.source_language + '版条款（原文）']];
sheet.getRange('F2').values = [['英文版条款（翻译）']];
sheet.getRange('G2').values = [['中文简体版条款（翻译）']];
sheet.getRange('A3:N' + last).format = {
  font:{name:'微软雅黑',size:11,color:'#000000'},wrapText:true,
  verticalAlignment:'top',horizontalAlignment:'left',
  borders:{preset:'all',style:'thin',color:'#000000'}
};
sheet.getRange('A3:D' + last).format.horizontalAlignment = 'center';
sheet.getRange('H3:H' + last).format.horizontalAlignment = 'center';
sheet.getRange('H3:H' + last).dataValidation = {rule:{type:'list',values:['是','否']}};
const widths = [];
for (let j = 0; j < 14; j++) widths.push(Number(sheet.getRange(String.fromCharCode(65+j)+'1').format.columnWidth) || 16);
const chars = t => [...t].reduce((n,c) => n + (c.codePointAt(0)>255?2:1),0);
for (let i = 0; i < rows.length; i++) {
  let lines = 1;
  for (let j = 0; j < 14; j++) {
    if (j === 5) continue;
    const count = String(rows[i][j] ?? '').split('\n').reduce((n,t) => n + Math.max(1,Math.ceil(chars(t)/Math.max(4,widths[j]-2))),0);
    lines = Math.max(lines,count);
  }
  sheet.getRange('A'+(i+3)+':N'+(i+3)).format.rowHeight = Math.min(409.5,Math.max(102,lines*16.5+8));
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
const index = predicate => { const i=rows.findIndex(predicate); return i<0?null:i+3; };
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
console.log(JSON.stringify({output:args.output,rows:rows.length,previewDirectory:args['preview-dir']}));
