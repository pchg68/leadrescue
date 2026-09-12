import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
// Emit an operator-only SQL journal. Does not impersonate Prisma Migrate.
// Baselines 001–004 only after their schema has been verified; applies 005
// atomically with its checksum. Stop if recorded files have been modified.
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const statements=[`CREATE TABLE IF NOT EXISTS public._leadrescue_migrations (
 name text PRIMARY KEY, checksum text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now(),
 method text NOT NULL CHECK(method IN ('verified_baseline','applied_sql')),
 recorded_by text NOT NULL DEFAULT current_user);
 REVOKE ALL ON public._leadrescue_migrations FROM PUBLIC,leadrescue_app,leadrescue_identity;`];
for(const name of readdirSync('prisma/migrations').filter(n=>/^\d/.test(n)).sort()){
  const sql=readFileSync(`prisma/migrations/${name}/migration.sql`,'utf8');
  const hash=createHash('sha256').update(sql).digest('hex');
  const baseline=name<'202609110005';
  statements.push(`DO $journal$ BEGIN
 IF EXISTS(SELECT FROM public._leadrescue_migrations WHERE name=${quote(name)} AND checksum<>${quote(hash)}) THEN
 RAISE EXCEPTION 'Migration checksum mismatch'; END IF;
 IF NOT EXISTS(SELECT FROM public._leadrescue_migrations WHERE name=${quote(name)}) THEN
 ${baseline?'-- Already applied and verified on the parent branch.':sql}
 INSERT INTO public._leadrescue_migrations(name,checksum,method) VALUES(${quote(name)},${quote(hash)},${quote(baseline?'verified_baseline':'applied_sql')});
 END IF; END $journal$;`);
}
console.log(JSON.stringify(statements));
