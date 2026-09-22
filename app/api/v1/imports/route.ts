import {getChatGPTUser} from '@/app/chatgpt-auth';
import {run} from '@/lib/leadrescue/backend/neon';
import {requestContext} from '@/lib/leadrescue/backend/access';
import {apiError,ServiceError} from '@/lib/leadrescue/backend/errors';
import {prepareImport} from '@/lib/leadrescue/import';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const requestId=crypto.randomUUID();
 try{
  const user=await getChatGPTUser();
  const context=requestContext(user?{subject:'chatgpt:'+user.userId}:null,request.headers.get('X-Organization-Id'));
  if(request.headers.get('origin')!==new URL(request.url).origin)throw new ServiceError(403,'INVALID_ORIGIN','Origem inválida.');
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new ServiceError(415,'INVALID_CONTENT_TYPE','Formato inválido.');
  const reader=request.body?.getReader();if(!reader)throw new ServiceError(400,'INVALID_BODY','Arquivo ausente.');
  let raw='',bytes=0;const decoder=new TextDecoder('utf-8',{fatal:true});
  try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>2*1024*1024)throw new ServiceError(413,'TOO_LARGE','O lote excede 2 MiB. Divida o arquivo.');raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}finally{await reader.cancel();reader.releaseLock();}
  let prepared;try{prepared=prepareImport(JSON.parse(raw));}catch(e){throw new ServiceError(400,'INVALID_IMPORT',e instanceof Error?e.message:'Arquivo inválido.');}
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(prepared)));
  const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const rows=await run(context.subject,context.organizationId,'SELECT public.leadrescue_import($1,$2::jsonb,$3::jsonb,$4) AS result',[key,JSON.stringify(prepared.rows),JSON.stringify({fields:prepared.mapping,country:prepared.country}),requestId]);
  return Response.json({data:rows[0].result},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return apiError(error,requestId);}
}
