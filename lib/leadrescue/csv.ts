import {normalizePhones,type CountryCode,type PhoneItem} from './phones.ts';
export const CSV_LIMITS={bytes:20*1024*1024,rows:50000,columns:100,cellBytes:16384};
export const FIELDS={name:'Nome',email:'E-mail',phone:'Telefone(s)',externalId:'ID externo',source:'Origem',createdAt:'Data original de criação'};
export type Field=keyof typeof FIELDS;
export type Mapping=Partial<Record<Field,number>>;
export type Csv={headers:string[];rows:string[][];delimiter:string};
const encoder=new TextEncoder();
export async function readCsv(blob:Blob,delimiter:','|';'):Promise<Csv>{
  if(blob.size>CSV_LIMITS.bytes)throw new Error('Arquivo maior que 20 MiB.');
  const decoder=new TextDecoder('utf-8',{fatal:true});
  const reader=blob.stream().getReader();
  const records:string[][]=[];let row:string[]=[],cell='',state:'start'|'plain'|'quoted'|'closed'='start',skipLF=false,first=true;
  function field(){if(encoder.encode(cell).length>CSV_LIMITS.cellBytes)throw new Error('Uma célula excede 16 KiB.');row.push(cell);cell='';state='start';if(row.length>100)throw new Error('O limite é de 100 colunas.');}
  function record(){field();records.push(row);row=[];if(records.length>CSV_LIMITS.rows+1)throw new Error('O limite é de 50.000 registros.');}
  function consume(text:string){for(const char of text){
    if(first){first=false;if(char==='\uFEFF')continue;}
    if(skipLF){skipLF=false;if(char==='\n')continue;}
    if(state==='quoted'){if(char==='"')state='closed';else cell+=char;}
    else if(state==='closed'&&char==='"'){cell+='"';state='quoted';}
    else if(char===delimiter)field();
    else if(char==='\r'||char==='\n'){record();skipLF=char==='\r';}
    else if(state==='closed')throw new Error('Há caracteres após o fechamento de aspas.');
    else if(char==='"'){if(state!=='start')throw new Error('Aspas inválidas no arquivo.');state='quoted';}
    else{cell+=char;state='plain';}
    if(cell.length>CSV_LIMITS.cellBytes)throw new Error('Uma célula excede 16 KiB.');
  }}
  try{while(true){const {done,value}=await reader.read();if(done)break;let text;try{text=decoder.decode(value,{stream:true});}catch{throw new Error('Reexporte o arquivo em CSV UTF-8.');}consume(text);}consume(decoder.decode());
    if((state as string)==='quoted')throw new Error('Uma célula tem aspas não fechadas.');
    if(cell||row.length||(state as string)==='closed')record();
  }finally{await reader.cancel();reader.releaseLock();}
  const headers=records.shift()?.map(x=>x.trim())??[];
  if(!headers.length||headers.every(x=>!x))throw new Error('O arquivo não tem cabeçalhos.');
  if(!records.length)throw new Error('O arquivo não tem registros.');
  return {headers,rows:records,delimiter};
}
export async function detectCsv(blob:Blob):Promise<Csv>{
  if(blob.size>CSV_LIMITS.bytes)throw new Error('Arquivo maior que 20 MiB.');
  // Score only delimiters outside quotes in the first logical record.
  let sample:string;
  try{sample=new TextDecoder('utf-8',{fatal:true}).decode(await blob.slice(0,256*1024).arrayBuffer(),{stream:true});}catch{throw new Error('Reexporte o arquivo em CSV UTF-8.');}
  let quoted=false,comma=0,semi=0;
  for(let i=0;i<sample.length;i++){const c=sample[i];if(c==='"'){if(quoted&&sample[i+1]==='"'){i++;continue;}quoted=!quoted;}else if(!quoted){if(c==='\n'||c==='\r')break;if(c===',')comma++;if(c===';')semi++;}}
  return readCsv(blob,semi>comma?';':',');
}
export function suggestMapping(headers:string[]):Mapping{
  const aliases:Record<Field,string[]>={name:['nome','name'],email:['email','e-mail'],phone:['telefone','phone','celular'],externalId:['id externo','externalid','id_externo'],source:['origem','source'],createdAt:['data de criacao','createdat','data_criacao']};
  const result:Mapping={};
  for(const field of Object.keys(FIELDS) as Field[]){const index=headers.findIndex(h=>aliases[field].includes(h.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()));if(index>=0)result[field]=index;}
  return result;
}
export type RowResult={row:number;name:string;errors:string[];warnings:string[];duplicate:boolean;phones:PhoneItem[]};
export function validateCsv(csv:Csv,mapping:Mapping,options:{country?:CountryCode}={}):RowResult[]{
  const indices=Object.values(mapping);if(new Set(indices).size!==indices.length)throw new Error('Uma coluna não pode representar dois campos.');
  if(indices.some(i=>!Number.isInteger(i)||i!<0||i!>=csv.headers.length))throw new Error('Mapeamento inválido.');
  const seen=new Set<string>();
  return csv.rows.map((cells,i)=>{
    const get=(key:Field)=>mapping[key]===undefined?'':(cells[mapping[key]!]??'').trim();
    const name=get('name'),email=get('email').toLowerCase(),phone=get('phone'),externalId=get('externalId'),source=get('source'),date=get('createdAt');
    const errors:string[]=[],warnings:string[]=[];
    if(cells.length!==csv.headers.length)errors.push('Quantidade de células diferente do cabeçalho.');
    const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=254;
    const phones=normalizePhones(phone,options.country);
    const phoneValid=phones.some(p=>p.number!==null);
    if(email&&!emailValid)errors.push('E-mail inválido.');
    for(const [index,item] of phones.entries())if(item.error)errors.push(`Telefone ${index+1}: ${item.error}`);
    if(phones.length>1)warnings.push(`${phones.length} telefones separados para revisão; números incompletos não recebem DDD presumido.`);
    if(!(externalId&&source)&&!(name&&(emailValid||phoneValid)))errors.push('Informe ID externo e origem, ou nome com e-mail/telefone válido.');
    if(name.length>160)errors.push('Nome maior que 160 caracteres.');
    if(!date)warnings.push('Data original ausente: não será calculado SLA retroativo.');
    else if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(date)||!Number.isFinite(Date.parse(date))||!validCalendarDate(date))errors.push('Use data ISO válida com horário e fuso, como 2026-09-01T12:00:00-03:00.');
    const keys=[externalId&&source?'id:'+JSON.stringify([source,externalId]):'',emailValid?'email:'+email:'',...phones.filter(p=>p.number).map(p=>'phone:'+p.number+':'+(p.extension??''))].filter(Boolean);
    const duplicate=keys.some(k=>seen.has(k));keys.forEach(k=>seen.add(k));
    if(duplicate)warnings.push('Possível duplicidade dentro deste arquivo; requer revisão, sem união automática.');
    return {row:i+2,name:name||externalId||'Sem identificação',errors,warnings,duplicate,phones};
  });
}
function validCalendarDate(value:string){const year=Number(value.slice(0,4)),month=Number(value.slice(5,7)),day=Number(value.slice(8,10));const d=new Date(0);d.setUTCFullYear(year,month-1,day);return d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day&&Number(value.slice(11,13))<24;}
export function safeCsvCell(value:string){const safe=/^[\s]*[=+\-@]|^[\t\r\n]/.test(value)?"'"+value:value;return '"'+safe.replaceAll('"','""')+'"';}
export function errorReport(rows:RowResult[]){return '\uFEFF'+[['registro','nome','telefones_originais','telefones_normalizados','erros','avisos'],...rows.map(r=>[String(r.row),r.name,r.phones.map(p=>p.original).join(' | '),r.phones.filter(p=>p.number).map(p=>p.number+(p.extension?' ramal '+p.extension:'')).join(' | '),r.errors.join(' | '),r.warnings.join(' | ')])].map(r=>r.map(safeCsvCell).join(';')).join('\r\n');}
