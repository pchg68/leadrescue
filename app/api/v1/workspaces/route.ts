import {getChatGPTUser} from '@/app/chatgpt-auth';
import {workspaceQuery} from '@/lib/leadrescue/backend/neon';
import {apiError,ServiceError} from '@/lib/leadrescue/backend/errors';
export const dynamic='force-dynamic';
export async function GET(){
  const requestId=crypto.randomUUID();
  try{
    const user=await getChatGPTUser();
    if(!user)throw new ServiceError(401,'UNAUTHENTICATED','Entre para acessar sua imobiliária.');
    const items=await workspaceQuery('SELECT * FROM public.leadrescue_workspaces($1)', ['chatgpt:'+user.userId]);
    return Response.json({data:{items},meta:{requestId}},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return apiError(error,requestId);}
}
export async function POST(request:Request){
  const requestId=crypto.randomUUID();
  try{
    const user=await getChatGPTUser();
    if(!user)throw new ServiceError(401,'UNAUTHENTICATED','Entre para acessar sua imobiliária.');
    if(request.headers.get('origin')!==new URL(request.url).origin)
      throw new ServiceError(403,'INVALID_ORIGIN','Origem da solicitação inválida.');
    if(!request.headers.get('content-type')?.startsWith('application/json'))
      throw new ServiceError(415,'INVALID_CONTENT_TYPE','Envie os dados no formato esperado.');
    const raw=await request.text();
    if(raw.length>4096)throw new ServiceError(413,'TOO_LARGE','Solicitação muito grande.');
    let body;try{body=JSON.parse(raw);}catch{throw new ServiceError(400,'INVALID_JSON','Dados inválidos.');}
    if(!body||typeof body.name!=='string'||body.name.trim().length<2||body.name.trim().length>160)
      throw new ServiceError(400,'INVALID_NAME','Informe um nome entre 2 e 160 caracteres.');
    const rows=await workspaceQuery('SELECT public.leadrescue_create_workspace($1,$2,$3,$4) AS "organizationId"',
      ['chatgpt:'+user.userId,user.email,user.displayName,body.name.trim()]);
    return Response.json({data:rows[0],meta:{requestId}},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return apiError(error,requestId);}
}
