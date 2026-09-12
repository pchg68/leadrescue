import {requestContext,requireId,pageLimit,type Principal} from './access';
import {apiError,ServiceError} from './errors';
export type DataAccess={
  list:(subject:string,organizationId:string,cursor:string|null,limit:number)=>Promise<Record<string,unknown>[]>;
  get:(subject:string,organizationId:string,id:string)=>Promise<Record<string,unknown>[]>;
};
export async function handleLeads(request:Request,principal:Principal|null,db:DataAccess,id?:string){
  const requestId=crypto.randomUUID();
  try{
    const context=requestContext(principal,request.headers.get('X-Organization-Id'));
    const url=new URL(request.url);
    const limit=pageLimit(url.searchParams.get('limit'));
    const cursor=url.searchParams.get('cursor');
    if(cursor){
      try{requireId(cursor);}catch{throw new ServiceError(400,'INVALID_CURSOR','Cursor inválido.');}
    }
    const rows=id?await db.get(context.subject,context.organizationId,requireId(id)):
      await db.list(context.subject,context.organizationId,cursor,limit+1);
    if(id&&!rows.length)throw new ServiceError(404,'NOT_FOUND','Recurso não encontrado.');
    const more=!id&&rows.length>limit;
    const items=id?rows[0]:{items:rows.slice(0,limit),nextCursor:more?String(rows[limit-1].id):null};
    return Response.json({data:items,meta:{requestId}},{headers:{'Cache-Control':'private, no-store','Vary':'Cookie, X-Organization-Id'}});
  }catch(error){return apiError(error,requestId);}
}
