'use client';
import {useState} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogTrigger} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {countries,normalizePhones,type CountryCode} from '@/lib/leadrescue/phones';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export default function CountryPhonePicker({value,onChange}:{value:CountryCode|undefined;onChange:(value:CountryCode|undefined)=>void}){
  const [open,setOpen]=useState(false),[search,setSearch]=useState(''),[example,setExample]=useState('');
  const selected=countries.find(c=>c.code===value),numbers=normalizePhones(example,value);
  const filtered=countries.filter(c=>normalize(`${c.name} ${c.code} ${c.dial}`).includes(normalize(search.trim())));
  return <section className="bg-card border rounded-xl p-6 space-y-4"><h2 className="text-xl font-semibold">País dos telefones locais</h2>
    <p>Escolha o país dos números sem código internacional. Números iniciados por + mantêm o próprio código, mesmo em arquivos com países diferentes.</p>
    <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline">{selected?`${selected.name} (${selected.dial})`:'Escolher país e código'}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Países e códigos telefônicos</DialogTitle><DialogDescription>Pesquise por nome, sigla ou código. {countries.length} países e territórios disponíveis.</DialogDescription></DialogHeader><Input aria-label="Pesquisar país ou código" placeholder="Brasil, BR ou +55" value={search} onChange={e=>setSearch(e.target.value)}/><div className="max-h-80 overflow-auto space-y-1"><Button className="w-full justify-start" variant="ghost" onClick={()=>{onChange(undefined);setOpen(false);}}>Sem país padrão — exigir +DDI</Button>{filtered.map(c=><Button key={c.code} className="w-full justify-between" variant={value===c.code?'secondary':'ghost'} onClick={()=>{onChange(c.code);setOpen(false);}}><span>{c.name} ({c.code})</span><span>{c.dial}</span></Button>)}{!filtered.length&&<p className="p-3">Nenhum país encontrado.</p>}</div></DialogContent></Dialog>
    <p className="text-sm text-muted-foreground">Separe números completos por /, ;, vírgula, barra vertical ou quebra de linha. Para arquivos mistos sem DDI, revise o país de origem antes de validar. Ramais são mantidos separadamente.</p>
    <label className="block space-y-2"><span>Experimente um telefone ou uma lista</span><Input value={example} onChange={e=>setExample(e.target.value)} placeholder="(11) 99999-9999 / (11) 3333-3333" maxLength={1000}/></label>
    {!!numbers.length&&<ul className="space-y-2" aria-live="polite">{numbers.map((p,i)=><li key={i} className="rounded-lg bg-background p-3 break-words"><span>{p.original}</span><p className={p.error?'text-destructive':'font-medium text-primary'}>{p.error??`${p.number}${p.extension?' · ramal '+p.extension:''}`}</p></li>)}</ul>}
    <p className="text-sm text-muted-foreground">A verificação avalia o formato do número; não confirma linha ativa, titular ou WhatsApp.</p>
  </section>;
}
