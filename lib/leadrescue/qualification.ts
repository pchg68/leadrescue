import {z} from 'zod';
import {normalizePhones,countries,type CountryCode} from './phones.ts';
const text=(max:number)=>z.string().trim().max(max).default('');
const money=z.string().trim().refine(v=>v===''||/^(0|[1-9]\d{0,11})([.,]\d{1,2})?$/.test(v),'Use valor sem separador de milhar, com até duas casas decimais.').transform(v=>v===''?null:Number(v.replace(',','.')).toFixed(2));
const days=z.string().trim().refine(v=>v===''||/^\d{1,5}$/.test(v)&&Number(v)<=36500,'Prazo inválido.').transform(v=>v===''?null:Number(v));
export const qualificationSchema=z.object({
 operationType:z.enum(['SALE','RENT','UNKNOWN']),city:text(120),neighborhood:text(120),propertyType:text(80),
 minPrice:money,maxPrice:money,purchaseTimelineDays:days,
 financingStatus:z.enum(['APPROVED','OWN_FUNDS','DOWN_PAYMENT','UNDER_REVIEW','UNKNOWN','UNABLE']),
 motivation:text(1000),reason:z.string().trim().min(8,'Explique a origem da informação em pelo menos 8 caracteres.').max(1000),
}).strict().refine(v=>v.minPrice===null||v.maxPrice===null||Number(v.minPrice)<=Number(v.maxPrice),'O orçamento mínimo não pode superar o máximo.');
export function validateQualification(input:unknown,creating:boolean){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Dados inválidos.');
 const {name,email,phone,country,...profile}=input as Record<string,unknown>;
 if(!creating&&[name,email,phone,country].some(x=>x!==undefined))throw new Error('Esta revisão altera somente a qualificação comercial.');
 const parsed=qualificationSchema.safeParse(profile);
 if(!parsed.success)throw new Error(parsed.error.issues[0]?.message??'Ficha inválida.');
 if(!creating)return parsed.data;
 const identity=z.object({name:z.string().trim().min(2).max(160),email:text(254),phone:text(1024),country:z.string().optional()}).strict().safeParse({name,email,phone,country});
 if(!identity.success)throw new Error('Confira nome, e-mail e telefone.');
 const v=identity.data;
 if(v.country&&!countries.some(c=>c.code===v.country))throw new Error('País inválido.');
 if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))throw new Error('E-mail inválido.');
 const phones=normalizePhones(v.phone,v.country as CountryCode|undefined);
 if(phones.some(p=>p.error))throw new Error('Confira o país e todos os telefones.');
 if(!v.email&&!phones.length)throw new Error('Informe e-mail ou telefone válido.');
 return {...parsed.data,name:v.name,email:v.email.toLowerCase()||null,phones:phones.map(p=>({number:p.number,extension:p.extension}))};
}
