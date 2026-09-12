import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCsv,detectCsv,suggestMapping,validateCsv,safeCsvCell,CSV_LIMITS} from '../lib/leadrescue/csv.ts';
test('BOM, ponto e vírgula, escape e quebra dentro de aspas',async()=>{
  const c=await detectCsv(new Blob(['\uFEFFnome;email\r\n"Ana; ""Teste""\nSilva";ana@example.invalid\r\n']));
  assert.equal(c.delimiter,';');assert.equal(c.rows.length,1);assert.equal(c.rows[0][0],'Ana; "Teste"\nSilva');
});
test('Aspas atravessando chunks UTF-8',async()=>{
  const bytes=new TextEncoder().encode('nome,email\r\n"José ""Teste""",j@example.invalid');
  const blob={size:bytes.length,stream:()=>new ReadableStream({start(c){for(const b of bytes)c.enqueue(new Uint8Array([b]));c.close();}})};
  assert.equal((await readCsv(blob,',')).rows[0][0],'José "Teste"');
});
test('Recusa encoding inválido e aspas não fechadas',async()=>{
  await assert.rejects(()=>detectCsv(new Blob([new Uint8Array([255,254,1])])),/UTF-8/);
  await assert.rejects(()=>readCsv(new Blob(['nome\n"aberto']),','),/aspas/);
});
test('Identificação, avisos de data e duplicidade sem remover registros',async()=>{
  const c=await detectCsv(new Blob(['nome;email;id_externo;origem\nAna;a@example.invalid;;\nOutra;a@example.invalid;;\n;;id-3;CRM\nIncompleto;;;']));
  const r=validateCsv(c,suggestMapping(c.headers));assert.equal(r.length,4);assert.equal(r[0].errors.length,0);assert.equal(r[1].duplicate,true);assert.equal(r[2].errors.length,0);assert.ok(r[3].errors.length);assert.ok(r[0].warnings.length);
});
test('Não inventa DDI nem aceita datas ambíguas/impossíveis',async()=>{
  const c=await detectCsv(new Blob(['nome;email;telefone;data_criacao\nAna;a@example.invalid;41999999999;01/02/2026\nB;b@example.invalid;;2026-02-30T12:00:00Z']));
  const r=validateCsv(c,suggestMapping(c.headers));assert.equal(r[0].errors.length,2);assert.equal(r[1].errors.length,1);
});
test('Exportação neutraliza fórmulas e preserva aspas',()=>{for(const v of ['=SUM(A1)','+123','-1','@x','\tformula','  =1'])assert.ok(safeCsvCell(v).startsWith('"\''));assert.equal(safeCsvCell('Ana "A"'),'"Ana ""A"""');});
test('50.000 registros aceitos; limites excedidos recusados',async()=>{
  const prefix='nome,email\n',row='Ana,a@example.invalid\n';
  assert.equal((await detectCsv(new Blob([prefix,row.repeat(50000)]))).rows.length,50000);
  await assert.rejects(()=>detectCsv(new Blob([prefix,row.repeat(50001)])),/50.000/);
  await assert.rejects(()=>readCsv(new Blob(['h\n'+'x'.repeat(CSV_LIMITS.cellBytes+1)]),','),/16 KiB/);
});
