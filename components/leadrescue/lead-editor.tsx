'use client';
import {useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import CountryPhonePicker from './country-phone-picker';
import type {CountryCode} from '@/lib/leadrescue/phones';
export type QualificationLead={id:string;version:number;name:string;email?:string|null;phone?:string|null;operationType?:string;city?:string|null;neighborhood?:string|null;propertyType?:string|null;minPrice?:string|null;maxPrice?:string|null;purchaseTimelineDays?:number|null;financingStatus?:string;motivation?:string|null;dataQuality?:{phones?:{number:string;extension?:string|null}[]};provisionalContactBlock?:boolean;contactNotBefore?:string|null};
export function qualificationGroups(lead:QualificationLead){return [
 {label:'Operação',known:!!lead.operationType&&lead.operationType!=='UNKNOWN'},
 {label:'Região',known:!!(lead.city||lead.neighborhood)},
 {label:'Orçamento',known:lead.minPrice!=null||lead.maxPrice!=null},
 {label:'Prazo',known:lead.purchaseTimelineDays!=null},
 {label:'Capacidade financeira',known:!!lead.financingStatus&&lead.financingStatus!=='UNKNOWN'},
];}
const operations=[['UNKNOWN','Não informado'],['SALE','Compra'],['RENT','Locação']];
const financing=[['UNKNOWN','Não informada'],['APPROVED','Financiamento aprovado'],['OWN_FUNDS','Recursos próprios'],['DOWN_PAYMENT','Entrada disponível'],['UNDER_REVIEW','Em análise'],['UNABLE','Sem capacidade no momento']];
export default function LeadEditor({org,organizationName,lead,onClose,onSaved}:{org:string;organizationName:string;lead?:QualificationLead;onClose:()=>void;onSaved:()=>void}){
 const [form,setForm]=useState({name:'',email:'',phone:'',operationType:lead?.operationType??'UNKNOWN',city:lead?.city??'',neighborhood:lead?.neighborhood??'',propertyType:lead?.propertyType??'',minPrice:lead?.minPrice??'',maxPrice:lead?.maxPrice??'',purchaseTimelineDays:lead?.purchaseTimelineDays==null?'':String(lead.purchaseTimelineDays),financingStatus:lead?.financingStatus??'UNKNOWN',motivation:lead?.motivation??'',reason:''});
 const [country,setCountry]=useState<CountryCode|undefined>(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef<{body:string;key:string}|null>(null);
 const field=(key:keyof typeof form,label:string,max=160,type='text')=><label className="block space-y-2"><span>{label}</span><Input type={type} value={form[key]} maxLength={max} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))}/></label>;
 const choice=(key:'operationType'|'financingStatus',label:string,options:string[][])=><label className="block space-y-2"><span>{label}</span><Select value={form[key]} onValueChange={v=>setForm(old=>({...old,[key]:v}))}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent>{options.map(([value,text])=><SelectItem key={value} value={value}>{text}</SelectItem>)}</SelectContent></Select></label>;
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  const {name,email,phone,...profile}=form;
  const data=lead?profile:{...profile,name,email,phone,country};const body=JSON.stringify(data);
  if(pending.current?.body!==body)pending.current={body,key:crypto.randomUUID()};
  try{const response=await fetch('/api/v1/leads'+(lead?'/'+lead.id:''),{method:lead?'PATCH':'POST',headers:{'Content-Type':'application/json','X-Organization-Id':org},body:JSON.stringify({data,version:lead?.version,mutationId:pending.current.key})});
   const result=await response.json() as {error?:{message:string}};if(!response.ok)throw new Error(result.error?.message??'Não foi possível salvar.');onSaved();
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent showCloseButton={!busy} className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{lead?'Qualificar '+lead.name:'Novo lead'}</DialogTitle><DialogDescription>{organizationName} · Informe apenas dados conhecidos. Campos desconhecidos podem ficar vazios.</DialogDescription></DialogHeader>
 <form onSubmit={submit} className="space-y-5"><fieldset disabled={busy} className="space-y-5 min-w-0">
 {!lead&&<><div className="flex justify-end"><Button type="button" variant="outline" onClick={()=>setForm(old=>({...old,name:'Ana Exemplo',email:'ana-'+crypto.randomUUID().slice(0,8)+'@example.invalid',phone:'',operationType:'SALE',city:'Curitiba',neighborhood:'Água Verde',propertyType:'Apartamento',minPrice:'450000',maxPrice:'650000',purchaseTimelineDays:'90',financingStatus:'UNKNOWN',reason:'Exemplo fictício para testar o cadastro manual.'}))}>Preencher exemplo fictício</Button></div>{field('name','Nome *')}
 <div className="grid sm:grid-cols-2 gap-4">{field('email','E-mail',254,'email')}{field('phone','Telefone(s)',1024)}</div><p className="text-sm text-muted-foreground">Informe e-mail ou telefone. Para vários números, use ponto e vírgula.</p><CountryPhonePicker value={country} onChange={setCountry}/></>}
 <h3 className="text-lg font-semibold">Interesse imobiliário</h3><div className="grid sm:grid-cols-2 gap-4">{choice('operationType','Operação',operations)}{field('propertyType','Tipo de imóvel',80)}{field('city','Cidade',120)}{field('neighborhood','Bairro ou região',120)}{field('minPrice','Orçamento mínimo (R$)',15)}{field('maxPrice','Orçamento máximo (R$)',15)}{field('purchaseTimelineDays','Prazo declarado em dias',5)}{choice('financingStatus','Capacidade financeira informada',financing)}</div>
 <p className="text-sm text-muted-foreground">Valores em reais, sem separador de milhar: 450000,00. O prazo deve ter sido informado pelo contato. Aprovação de financiamento ou recursos próprios exigem informação confirmada.</p>
 <label className="block space-y-2"><span>Motivação ou observações comerciais</span><Textarea value={form.motivation} maxLength={1000} onChange={e=>setForm(old=>({...old,motivation:e.target.value}))}/></label>
 <label className="block space-y-2"><span>Origem das informações / motivo da revisão *</span><Textarea value={form.reason} minLength={8} maxLength={1000} required placeholder="Ex.: cliente informou orçamento e prazo na conversa de hoje." onChange={e=>setForm(old=>({...old,reason:e.target.value}))}/></label>
 <p className="text-sm text-muted-foreground">Salvar a ficha não libera contato nem altera a etapa comercial. A análise de prioridades será feita separadamente.</p>
 {error&&<p role="alert" className="text-destructive">{error}</p>}
 <div className="flex gap-3"><Button type="submit" disabled={busy}>{busy?'Salvando…':lead?'Salvar qualificação':'Cadastrar lead'}</Button><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancelar</Button></div>
 </fieldset></form></DialogContent></Dialog>;
}
