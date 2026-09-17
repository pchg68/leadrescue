import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

test('Contract check accepts CRLF and rejects drift without rewriting files',()=>{
  const root=mkdtempSync(join(tmpdir(),'leadrescue-contracts-'));
  try{
    mkdirSync(join(root,'contracts'));
    const source=readFileSync('docs/LeadRescue-MVP-Build-Specification.md','utf8');
    writeFileSync(join(root,'spec.md'),source.replace(/\r?\n/g,'\r\n'));
    for(const file of ['schema.prisma','required-constraints.sql','types.ts','events.schema.json','fixtures.json']){
      writeFileSync(join(root,'contracts',file),readFileSync('contracts/'+file,'utf8').replace(/\r?\n/g,'\r\n'));
    }
    const run=()=>spawnSync(process.execPath,[resolve('scripts/extract-contracts.mjs'),'spec.md','--check'],{cwd:root,encoding:'utf8'});
    const valid=run();assert.equal(valid.status,0,valid.stderr);
    const target=join(root,'contracts','types.ts');
    const changed=readFileSync(target,'utf8')+'// unexpected drift\n';
    writeFileSync(target,changed);
    const invalid=run();assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Contract differs/);
    assert.equal(readFileSync(target,'utf8'),changed);
  }finally{rmSync(root,{recursive:true,force:true});}
});
