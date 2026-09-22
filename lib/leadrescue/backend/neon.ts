import {neon} from '@neondatabase/serverless';
import {ServiceError} from './errors';
import {AUTHORIZE_SQL,LIST_LEADS_SQL,GET_LEAD_SQL} from './queries';

function connect(){
  if(process.env.ENABLE_COMMERCIAL_API!=='true'||!process.env.DATABASE_URL)
    throw new ServiceError(503,'DATABASE_NOT_CONFIGURED','A operação com banco de dados ainda não está ativada.');
  const connection=new URL(process.env.DATABASE_URL);
  if(!['postgres:','postgresql:'].includes(connection.protocol)||decodeURIComponent(connection.username)!=='leadrescue_app')
    throw new ServiceError(503,'DATABASE_CONFIGURATION_ERROR','A configuração do banco precisa ser revisada.');
  return neon(process.env.DATABASE_URL,{fetchOptions:{signal:AbortSignal.timeout(15000)}});
}
export async function run(subject:string,org:string,query:string,params:unknown[]){
  const sql=connect();
  // One HTTP transaction: role check, active membership resolution, scoped query.
  // set_config(..., true) in authorize expires on COMMIT/ROLLBACK.
  const result=await sql.transaction([
    sql.query('SELECT public.leadrescue_assert_runtime()'),
    sql.query(AUTHORIZE_SQL,[subject,org]),
    sql.query(query,params),
  ]);
  return result[2] as Record<string,unknown>[];
}
export const dataAccess={
  list:(subject:string,org:string,cursor:string|null,limit:number)=>run(subject,org,LIST_LEADS_SQL,[org,cursor,limit]),
  get:(subject:string,org:string,id:string)=>run(subject,org,GET_LEAD_SQL,[org,id]),
};

export async function workspaceQuery(query:string,params:unknown[]){
  const sql=connect();
  const results=await sql.transaction([
    sql.query('SELECT public.leadrescue_assert_runtime()'),
    sql.query(query,params),
  ]);
  return results[1] as Record<string,unknown>[];
}
