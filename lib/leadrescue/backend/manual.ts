import {requestContext,requireId,type Principal} from './access';
import {ServiceError,apiError} from './errors';
import {validateQualification} from '../qualification';
type Save=(subject:string,org:string,query:string,params:unknown[])=>Promise<Record<string,unknown>[]>;
export async function handleManual(request:Request,principal:Principal|null,save:Save,id?:string){
 const requestId=crypto.randomUUID();
 try{
  const context=requestContext(principal,request.headers.get('X-Organization-Id'));
  if(request.headers.get('origin')!==new URL(request.url).origin)throw new ServiceError(403,'INVALID_ORIGIN','Origem inválida.');
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new ServiceError(415,'INVALID_FORMAT','Formato inválido.');
  const reader=request.body?.getReader();if(!reader)throw new ServiceError(400,'INVALID_BODY','Dados ausentes.');
  let raw='',bytes=0;const decoder=new TextDecoder('utf-8',{fatal:true});
  try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>16384)throw new ServiceError(413,'TOO_LARGE','Ficha muito grande.');raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}finally{await reader.cancel();reader.releaseLock();}
  let data:ReturnType<typeof validateQualification>,mutation:string,version:number|null;
  try{
   const body=JSON.parse(raw);mutation=requireId(body.mutationId);
   version=id?body.version:null;
   if(id&&(!Number.isInteger(version)||Number(version)<0))throw new Error('Recarregue a ficha antes de editar.');
   data=validateQualification(body.data,!id);
  }catch(e){throw new ServiceError(400,'INVALID_DATA',e instanceof Error?e.message:'Dados inválidos.');}
  const rows=await save(context.subject,context.organizationId,'SELECT public.leadrescue_save_manual($1::uuid,$2::int,$3::uuid,$4::jsonb,$5) AS result',[id?requireId(id):null,version,mutation,JSON.stringify(data),requestId]);
  const result=rows[0].result as {error?:string};
  if(result.error==='DUPLICATE')throw new ServiceError(409,'DUPLICATE','Já existe um contato com este e-mail ou telefone. Confira os leads cadastrados.');
  if(result.error==='CONFLICT')throw new ServiceError(409,'CONFLICT','A ficha foi atualizada. Reabra o lead antes de salvar novamente.');
  if(result.error==='IDEMPOTENCY_CONFLICT')throw new ServiceError(409,'IDEMPOTENCY_CONFLICT','Esta solicitação já foi usada com outros dados. Reabra o formulário.');
  return Response.json({data:result},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return apiError(error,requestId);}
}
