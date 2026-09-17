import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {AUTHORIZE_SQL,LIST_LEADS_SQL,GET_LEAD_SQL} from '../.sites-runtime/backend-test/queries.mjs';
import {seed,id,A,B} from './fixtures/database-seed.mjs';

test('PostgreSQL embarcado: migrations, RLS e autorização real de SQL',async t=>{
  const db=new PGlite();
  try{
    await db.exec(readFileSync('prisma/bootstrap-roles.sql','utf8'));
    const migrations=readdirSync('prisma/migrations',{withFileTypes:true})
      .filter(entry=>entry.isDirectory()).map(entry=>entry.name).sort();
    assert.ok(migrations.length>0,'At least one migration must be tested');
    for(const dir of migrations)await db.exec(readFileSync('prisma/migrations/'+dir+'/migration.sql','utf8'));
    await seed(db);
    const asApp=fn=>db.transaction(async tx=>{await tx.exec('SET LOCAL ROLE leadrescue_app');return fn(tx);});
    const scoped=(subject,org,fn)=>asApp(async tx=>{await tx.query('SELECT public.leadrescue_assert_runtime()');await tx.query(AUTHORIZE_SQL,[subject,org]);return fn(tx);});
    const list=(subject,org)=>scoped(subject,org,tx=>tx.query(LIST_LEADS_SQL,[org,null,100]));
    const fails=(fn,code)=>assert.rejects(fn,error=>error.code===code);
    await t.test('Todas as 17 tabelas comerciais têm RLS obrigatório',async()=>{const r=await db.query("SELECT count(*)::int AS n FROM pg_class WHERE relrowsecurity AND relforcerowsecurity AND relnamespace='public'::regnamespace");assert.equal(r.rows[0].n,17);});
    await t.test('Runtime não é owner nem bypassrls',async()=>{await asApp(tx=>tx.query('SELECT public.leadrescue_assert_runtime()'));await fails(()=>db.query('SELECT public.leadrescue_assert_runtime()'),'42501');});
    await t.test('Sem contexto: zero leads e zero eventos',async()=>{const r=await asApp(async tx=>({leads:await tx.query('SELECT * FROM "Lead"'),events:await tx.query('SELECT * FROM "LeadEvent"')}));assert.equal(r.leads.rows.length,0);assert.equal(r.events.rows.length,0);});
    await t.test('Gestor A vê somente 3 leads de A',async()=>{assert.equal((await list('test:user1',A)).rows.length,3);});
    await t.test('Gestor B vê somente 1 lead de B',async()=>{assert.equal((await list('test:user4',B)).rows.length,1);});
    await t.test('Usuário A selecionando B é rejeitado',async()=>{await fails(()=>list('test:user1',B),'42501');});
    await t.test('Corretor vê apenas os próprios leads',async()=>{const r=await list('test:user2',A);assert.deepEqual(r.rows.map(x=>x.id),[id(401),id(402)]);});
    await t.test('Detalhe do colega e de outro tenant retornam zero',async()=>{for(const foreign of [id(403),id(404)])assert.equal((await scoped('test:user2',A,tx=>tx.query(GET_LEAD_SQL,[A,foreign]))).rows.length,0);});
    await t.test('Broker sem associação não recebe leads',async()=>{assert.equal((await list('test:user5',A)).rows.length,0);});
    await t.test('Associação inativa e platformAdmin sem vínculo não têm acesso',async()=>{for(const subject of ['test:user6','test:user7','test:unknown'])await fails(()=>list(subject,A),'42501');});
    await t.test('Revogação vale na próxima transação',async()=>{await db.query('UPDATE "Membership" SET active=false WHERE id=$1',[id(201)]);try{await fails(()=>list('test:user1',A),'42501');}finally{await db.query('UPDATE "Membership" SET active=true WHERE id=$1',[id(201)]);}});
    await t.test('Desativar organização impede nova leitura',async()=>{await db.query('UPDATE "Organization" SET active=false WHERE id=$1',[A]);try{await fails(()=>list('test:user1',A),'42501');}finally{await db.query('UPDATE "Organization" SET active=true WHERE id=$1',[A]);}});
    await t.test('Contexto não sobrevive ao commit nem rollback',async()=>{await list('test:user1',A);await fails(()=>list('bad',A),'42501');const r=await asApp(tx=>tx.query('SELECT * FROM "Lead"'));assert.equal(r.rows.length,0);});
    await t.test('FK rejeita lead A vinculado a corretor B',async()=>{await fails(()=>scoped('test:user1',A,tx=>tx.query('UPDATE "Lead" SET "brokerId"=$1 WHERE id=$2',[id(304),id(401)])),'23503');});
    await t.test('RLS rejeita escrita no outro tenant',async()=>{await fails(()=>scoped('test:user1',A,tx=>tx.query('INSERT INTO "Lead" (id,"organizationId",source,"dataQuality","updatedAt") VALUES ($1,$2,\'test\',\'{}\',now())',[id(499),B])),'42501');});
    await t.test('Evento é append-only para aplicação',async()=>{for(const sql of ['UPDATE "LeadEvent" SET type=\'invalid\'','DELETE FROM "LeadEvent"','TRUNCATE "LeadEvent"'])await fails(()=>scoped('test:user1',A,tx=>tx.exec(sql)),'42501');});
    await t.test('Runtime não lê User global nem altera Membership',async()=>{await fails(()=>asApp(tx=>tx.query('SELECT * FROM "User"')),'42501');await fails(()=>scoped('test:user1',A,tx=>tx.exec('UPDATE "Membership" SET role=\'ORGANIZATION_ADMIN\'')),'42501');});
    await t.test('Scores fora de 0–100 falham no banco',async()=>{await fails(()=>scoped('test:user1',A,tx=>tx.query('UPDATE "Lead" SET "leadScore"=101 WHERE id=$1',[id(401)])),'23514');});
    await t.test('L3 é rejeitado pela constraint do banco',async()=>{await fails(()=>scoped('test:user1',A,tx=>tx.query('INSERT INTO "Recommendation" (id,"organizationId","leadId","analysisRunId",type,level,priority,title,description,"evidenceEventIds",confidence,"generatedBy",fingerprint,"expiresAt","updatedAt") VALUES ($1,$2,$3,$4,\'CONTACT\',\'L3\',\'HIGH\',\'test\',\'test\',\'[]\',1,\'test\',\'test\',now(),now())',[id(801),A,id(401),id(701)])),'23514');});
    await t.test('Instalação mantém 4 leads e 1 evento sintéticos',async()=>{assert.equal((await db.query('SELECT count(*)::int AS n FROM "Lead"')).rows[0].n,4);assert.equal((await db.query('SELECT count(*)::int AS n FROM "LeadEvent"')).rows[0].n,1);});
    await t.test('Lista de imobiliárias depende de membership ativa',async()=>{
      const own=await asApp(tx=>tx.query('SELECT * FROM public.leadrescue_workspaces($1)',['test:user1']));
      assert.deepEqual(own.rows.map(x=>x.organizationId),[A]);
      assert.equal((await asApp(tx=>tx.query('SELECT * FROM public.leadrescue_workspaces($1)',['test:user6']))).rows.length,0);
    });
    await t.test('Primeiro acesso persiste organização; repetição não duplica nem eleva perfil existente',async()=>{
      const create=subject=>asApp(tx=>tx.query('SELECT public.leadrescue_create_workspace($1,$2,$3,$4) AS id',[subject,'new@example.invalid','Pessoa teste','Nova imobiliária teste']));
      const first=(await create('test:new')).rows[0].id;
      assert.equal((await create('test:new')).rows[0].id,first);
      assert.equal((await list('test:new',first)).rows.length,0);
      await fails(()=>list('test:new',A),'42501');
      assert.equal((await create('test:user2')).rows[0].id,A);
      const memberships=await asApp(tx=>tx.query('SELECT * FROM public.leadrescue_workspaces($1)',['test:user2']));
      assert.equal(memberships.rows[0].role,'BROKER');
      await fails(()=>create('test:user6'),'42501');
    });
  }finally{await db.close();}
});
