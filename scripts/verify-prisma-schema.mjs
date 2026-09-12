import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {PGlite} from '@electric-sql/pglite';

// Compare actual PostgreSQL catalogs, ignoring SQL whitespace/order/comments.
const cli=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','diff','--from-empty','--to-schema','contracts/schema.prisma','--script','--output','.sites-runtime/prisma-canonical.sql'],{
  env:{...process.env,CHECKPOINT_DISABLE:'1',PRISMA_HIDE_UPDATE_MESSAGE:'1'},stdio:'inherit',
});
if(cli.status!==0)process.exit(cli.status??1);
const catalog=`SELECT 'column' AS kind, table_name||'.'||column_name AS name,
 jsonb_build_object('type',udt_name,'nullable',is_nullable,'default',column_default,'length',character_maximum_length,'precision',numeric_precision,'scale',numeric_scale,'datetime',datetime_precision) AS definition
 FROM information_schema.columns WHERE table_schema='public'
 UNION ALL SELECT 'index',indexname,to_jsonb(indexdef) FROM pg_indexes WHERE schemaname='public'
 UNION ALL SELECT 'enum',t.typname,jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' GROUP BY t.typname
 ORDER BY kind,name`;
const databases=[];
try{
  const snapshots=[];
  for(const path of ['prisma/migrations/202609100001_initial/migration.sql','.sites-runtime/prisma-canonical.sql']){
    const db=new PGlite();databases.push(db);
    await db.exec(readFileSync(path,'utf8'));
    if(path.startsWith('prisma/'))await db.exec(readFileSync('prisma/migrations/202609110004_prisma_alignment/migration.sql','utf8'));
    snapshots.push((await db.query(catalog)).rows);
  }
  const differences=snapshots[0].flatMap((entry,i)=>isDeepStrictEqual(entry,snapshots[1][i])?[]:[{actual:entry,expected:snapshots[1][i]}]);
  if(differences.length)throw new Error(JSON.stringify(differences,null,2));
  mkdirSync('.sites-runtime',{recursive:true});
  writeFileSync('.sites-runtime/schema-catalog.json',JSON.stringify(snapshots[1]));
  writeFileSync('.sites-runtime/schema-catalog.sql',catalog);
  console.log(`Prisma 7.10.0: ${snapshots[0].length} catalog entries match the initial migration.`);
}finally{for(const db of databases)await db.close();}
