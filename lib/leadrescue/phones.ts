import {parsePhoneNumberFromString,getCountries,getCountryCallingCode,type CountryCode} from 'libphonenumber-js/max';
export type {CountryCode};
const display=new Intl.DisplayNames(['pt-BR'],{type:'region'});
export const countries=getCountries().map(code=>({code,name:display.of(code)??code,dial:'+'+getCountryCallingCode(code)})).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
export type PhoneItem={original:string;number:string|null;extension:string|null;country:string|null;error:string|null};
export function normalizePhones(value:string,country?:CountryCode):PhoneItem[]{
  if(!value.trim())return [];
  // Explicit separators only: do not split hyphens or guess shared area codes.
  const parts=value.split(/\s*(?:[;|/\n\r,]+|\s+e\s+)\s*/i).filter(x=>x.trim());
  if(!parts.length)return [{original:value,number:null,extension:null,country:null,error:'Nenhum número encontrado na célula.'}];
  if(parts.length>20)return [{original:value,number:null,extension:null,country:null,error:'Mais de 20 números na mesma célula; revise a lista.'}];
  return parts.map(original=>{
    const cleaned=original.trim().replace(/^(?:tel(?:efone)?|cel(?:ular)?|whatsapp|fone)\s*:\s*/i,'').replace(/\s+ramal\s*:?\s*(\d+)$/i,' ext. $1');
    const fail=(error:string):PhoneItem=>({original,number:null,extension:null,country:null,error});
    if(!country&&!cleaned.startsWith('+'))return fail('Escolha o país ou informe o código internacional com +.');
    const phone=parsePhoneNumberFromString(cleaned,{defaultCountry:country,extract:false});
    if(!phone||!phone.isValid())return fail('Número incompleto ou inválido para o país; confira DDD e dígitos.');
    return {original,number:phone.number,extension:phone.ext??null,country:phone.country??null,error:null};
  });
}
