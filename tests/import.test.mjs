import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareImport} from '../lib/leadrescue/import.ts';
const input={csv:{headers:['Nome','Email','Telefone'],rows:[['Ana','ana@example.invalid','(41) 99876-5432 / (11) 99876-5432']],delimiter:';'},mapping:{name:0,email:1,phone:2},country:'BR'};
test('Servidor normaliza múltiplos telefones e preserva ausência de data',()=>{const r=prepareImport(input).rows[0];assert.equal(r.phones.length,2);assert.equal(r.errors.length,0);assert.equal(r.originalCreatedAt,null);assert.equal(r.phones[0].number,'+5541998765432');});
test('Servidor recusa estrutura, país e tamanho inválidos',()=>{for(const value of [null,{...input,country:'XX'},{...input,csv:{...input.csv,rows:Array(501).fill(input.csv.rows[0])}},{...input,mapping:{constructor:0}}])assert.throws(()=>prepareImport(value));});
test('Servidor recalcula erros; não aceita status de validação fornecido pelo cliente',()=>{const r=prepareImport({...input,csv:{...input.csv,rows:[['Ana','invalido','123']]},valid:true}).rows[0];assert.ok(r.errors.length>=2);});
