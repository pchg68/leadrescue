import {validateCsv,type Csv,type Mapping,type Field,FIELDS} from './csv.ts';
import {countries,type CountryCode} from './phones.ts';
export const IMPORT_LIMIT=500;
export function prepareImport(input:unknown){
  if(!input||typeof input!=='object')throw new Error('Dados inválidos.');
  const body=input as {csv:Csv;mapping:Mapping;country?:CountryCode};
  const {csv,mapping,country}=body;
  if(!csv||!Array.isArray(csv.headers)||csv.headers.length<1||csv.headers.length>100||!csv.headers.every(x=>typeof x==='string'&&x.length<=16384)||!Array.isArray(csv.rows)||csv.rows.length<1||csv.rows.length>IMPORT_LIMIT||!csv.rows.every(r=>Array.isArray(r)&&r.length<=100&&r.every(x=>typeof x==='string'&&x.length<=16384)))throw new Error('Importe de 1 a 500 registros por arquivo nesta etapa.');
  if(!mapping||typeof mapping!=='object'||Array.isArray(mapping)||Object.keys(mapping).some(k=>!Object.hasOwn(FIELDS,k)))throw new Error('Mapeamento inválido.');
  if(country!==undefined&&!countries.some(c=>c.code===country))throw new Error('País inválido.');
  const results=validateCsv(csv,mapping,{country});
  const rows=results.map((r,i)=>{
    const get=(key:Field)=>mapping[key]===undefined?'':(csv.rows[i][mapping[key]!]??'').trim();
    const errors=[...r.errors];
    if(get('source').length>80)errors.push('Origem maior que 80 caracteres.');
    if(get('externalId').length>160)errors.push('ID externo maior que 160 caracteres.');
    return {row:r.row,name:r.name,email:get('email').toLowerCase()||null,source:get('source')||'csv',externalId:get('externalId')||null,originalCreatedAt:get('createdAt')||null,phones:r.phones.filter(p=>p.number).map(p=>({number:p.number,extension:p.extension})),errors,duplicate:r.duplicate};
  });
  return {rows,mapping,country:country??null};
}
