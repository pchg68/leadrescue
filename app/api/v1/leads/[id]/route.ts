import {getChatGPTUser} from '@/app/chatgpt-auth';
import {handleLeads} from '@/lib/leadrescue/backend/handlers';
import {dataAccess} from '@/lib/leadrescue/backend/neon';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getChatGPTUser();
  return handleLeads(request,user?{subject:'chatgpt:'+user.userId}:null,dataAccess,(await params).id);
}
