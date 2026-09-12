import {ServiceError} from './errors';
export type Principal={subject:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function requestContext(principal:Principal|null,organizationId:string|null){
  if(!principal?.subject || principal.subject.length>512)throw new ServiceError(401,'UNAUTHENTICATED','Faça login para continuar.');
  if(!organizationId||!uuid.test(organizationId))throw new ServiceError(400,'INVALID_ORGANIZATION','Selecione uma imobiliária válida.');
  return {subject:principal.subject,organizationId:organizationId.toLowerCase()};
}
export function requireId(value:string){
  if(!uuid.test(value))throw new ServiceError(404,'NOT_FOUND','Recurso não encontrado.');
  return value.toLowerCase();
}
export function pageLimit(value:string|null){
  if(value===null)return 25;
  if(!/^[1-9][0-9]?$|^100$/.test(value))throw new ServiceError(400,'INVALID_LIMIT','O limite deve estar entre 1 e 100.');
  return Number(value);
}
