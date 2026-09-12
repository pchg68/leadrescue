import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhones,countries} from '../lib/leadrescue/phones.ts';
import {detectCsv,suggestMapping,validateCsv,errorReport} from '../lib/leadrescue/csv.ts';
test('Lista internacional e números nacionais de diferentes países',()=>{
  assert.ok(countries.length>200);
  for(const [country,input,expected] of [['BR','(11) 3333-3333','+551133333333'],['BR','(11) 99999-9999','+5511999999999'],['PT','212345678','+351212345678'],['US','2025550123','+12025550123'],['JP','0312345678','+81312345678']])assert.equal(normalizePhones(input,country)[0].number,expected);
});
test('Preserva DDI explícito e ramal; exige país para formato nacional',()=>{
  assert.equal(normalizePhones('+44 20 7946 0018','BR')[0].number,'+442079460018');
  assert.equal(normalizePhones('(11) 3333-3333 ramal 123','BR')[0].extension,'123');
  assert.ok(normalizePhones('1133333333')[0].error);
});
test('Separa listas sem inventar DDD ou nono dígito e preserva pendências',()=>{
  for(const sep of [' / ',';','|','\n',',',' e ']){
    const r=normalizePhones('(11) 3333-3333'+sep+'9999-9999','BR');
    assert.equal(r.length,2);assert.equal(r[0].number,'+551133333333');assert.ok(r[1].error);
  }
  assert.ok(normalizePhones('(11) 9999-9999','BR')[0].error);
  assert.ok(normalizePhones('///','BR')[0].error);
  assert.ok(normalizePhones(Array(21).fill('+551133333333').join('/'),'BR')[0].error);
});
test('Detecta duplicatas após normalização e exporta todos os originais',async()=>{
  const csv=await detectCsv(new Blob(['nome;telefone\nExemplo A;(11) 3333-3333 / (11) 99999-9999\nExemplo B;+55 11 99999-9999\nExemplo C;3333-3333']));
  const r=validateCsv(csv,suggestMapping(csv.headers),{country:'BR'});
  assert.equal(r[0].errors.length,0);assert.equal(r[1].duplicate,true);assert.ok(r[2].errors.length);
  const report=errorReport(r);assert.ok(report.includes('(11) 3333-3333 | (11) 99999-9999'));assert.ok(report.includes('+5511999999999'));assert.ok(report.includes('Exemplo C'));
});
