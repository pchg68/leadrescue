export class ServiceError extends Error {
  status:number;
  code:string;
  constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code;}
}
export function apiError(error:unknown,requestId:string){
  const known=error instanceof ServiceError?error:null;
  const databaseDenied=!!error&&typeof error==='object'&&'code' in error&&error.code==='42501';
  const status=known?.status??(databaseDenied?404:503);
  const code=known?.code??(databaseDenied?'NOT_FOUND':'SERVICE_UNAVAILABLE');
  const message=known?.message??(databaseDenied?'Recurso não encontrado.':'Serviço temporariamente indisponível.');
  return Response.json({error:{code,message,requestId}},{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie, X-Organization-Id'}});
}
