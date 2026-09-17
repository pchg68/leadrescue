import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export function inspectLedger(rows,directory='prisma/migrations') {
  if(!Array.isArray(rows))throw new Error('Expected a JSON array from the migration ledger SELECT.');
  const recorded=new Map();
  for(const row of rows){
    if(!row||typeof row.name!=='string'||!/^\d{12,14}_[a-z0-9_]+$/.test(row.name)||
       typeof row.checksum!=='string'||! /^[a-f0-9]{64}$/.test(row.checksum)||
       !['verified_baseline','applied_sql'].includes(row.method)||recorded.has(row.name)){
      throw new Error('Invalid or duplicate migration ledger entry.');
    }
    recorded.set(row.name,row);
  }
  const local=new Map(readdirSync(directory,{withFileTypes:true})
    .filter(entry=>entry.isDirectory()).map(entry=>{
      // Git checkouts may use CRLF; the repository's SQL is canonical LF.
      const sql=readFileSync(join(directory,entry.name,'migration.sql'),'utf8').replace(/\r\n/g,'\n');
      return [entry.name,createHash('sha256').update(sql).digest('hex')];
    }));
  if(!local.size)throw new Error('No local migrations found.');
  const missingSources=[...recorded.keys()].filter(name=>!local.has(name)).sort();
  const changed=[...recorded.keys()].filter(name=>local.has(name)&&local.get(name)!==recorded.get(name).checksum).sort();
  const pending=[...local.keys()].filter(name=>!recorded.has(name)).sort();
  return {compatible:!missingSources.length&&!changed.length,missingSources,changed,pending,matched:recorded.size-missingSources.length-changed.length};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    if(!process.argv[2])throw new Error('Usage: node scripts/verify-migration-ledger.mjs <ledger.json>');
    const result=inspectLedger(JSON.parse(readFileSync(process.argv[2],'utf8')));
    console.log(JSON.stringify(result,null,2));
    if(!result.compatible)process.exitCode=1;
  }catch(error){console.error(error.message);process.exitCode=1;}
}
