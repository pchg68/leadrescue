import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {inspectLedger} from '../scripts/verify-migration-ledger.mjs';

const name='202609100001_initial';
const sql='SELECT 1;\n';
const row={name,checksum:createHash('sha256').update(sql).digest('hex'),method:'applied_sql'};
function fixture(fn){
  const root=mkdtempSync(join(tmpdir(),'leadrescue-ledger-'));
  try{mkdirSync(join(root,name));writeFileSync(join(root,name,'migration.sql'),sql.replace(/\n/g,'\r\n'));fn(root);}
  finally{rmSync(root,{recursive:true,force:true});}
}
test('Ledger recognizes LF hashes on Windows and reports unapplied migrations',()=>fixture(root=>{
  assert.deepEqual(inspectLedger([row],root),{compatible:true,missingSources:[],changed:[],pending:[],matched:1});
  assert.deepEqual(inspectLedger([],root).pending,[name]);
}));
test('Database ahead of source blocks reconciliation',()=>fixture(root=>{
  const result=inspectLedger([row,{...row,name:'202609120006_csv_import'}],root);
  assert.equal(result.compatible,false);assert.deepEqual(result.missingSources,['202609120006_csv_import']);
}));
test('Changed SQL blocks reconciliation',()=>fixture(root=>{
  writeFileSync(join(root,name,'migration.sql'),'SELECT 2;\n');
  assert.deepEqual(inspectLedger([row],root).changed,[name]);
  assert.equal(inspectLedger([row],root).compatible,false);
}));
test('Malformed and duplicate entries fail closed',()=>fixture(root=>{
  for(const rows of [{},[row,row],[{...row,checksum:'invalid'}],[{...row,method:'unknown'}],[{...row,name:'../outside'}]]){
    assert.throws(()=>inspectLedger(rows,root));
  }
}));
test('SQL generator requires evidence and emits no SQL without it',()=>{
  const result=spawnSync(process.execPath,['scripts/migration-ledger.mjs'],{encoding:'utf8'});
  assert.notEqual(result.status,0);assert.equal(result.stdout,'');assert.match(result.stderr,/fresh ledger JSON/);
});
