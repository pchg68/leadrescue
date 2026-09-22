'use client';
import LeadEditor,{qualificationGroups,type QualificationLead} from './lead-editor';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
type Organization={organizationId:string;name:string;role:string};
type Lead=QualificationLead & {id:string;name:string;source:string;currentState:string;leadScore:number|null;rescueRisk:number|null;progressionScore:number|null;rescuePriority:number|null;doNotContact:boolean;humanRequired:boolean};
const roles:Record<string,string>={ORGANIZATION_ADMIN:'Administrador',MANAGER:'Gestor',BROKER:'Corretor'};
const states:Record<string,string>={NEW:'Novo',CONTACTED:'Contatado',QUALIFYING:'Em qualificação',QUALIFIED:'Qualificado',MATCHING:'Buscando imóvel',OPPORTUNITY:'Oportunidade',VISIT_REQUESTED:'Visita solicitada',VISIT_SCHEDULED:'Visita agendada',VISIT_COMPLETED:'Visita realizada',NEGOTIATION:'Negociação',PROPOSAL:'Proposta',WON:'Ganho',PAUSED:'Pausado',NURTURE:'Nutrição',RECOVERY:'Recuperação',NO_FIT:'Sem compatibilidade',LOST:'Perdido',DUPLICATE:'Duplicado',BLOCKED:'Bloqueado'};
async function api<T=unknown>(path:string,options:RequestInit={}){
  const response=await fetch(path,{...options,cache:'no-store'});
  const body=await response.json() as {data:T;error?:{message?:string}};
  if(!response.ok)throw new Error(body.error?.message??'Não foi possível carregar os dados.');
  return body.data;
}
export default function ConnectedWorkspace({signedIn,displayName,signInPath,signOutPath}:{signedIn:boolean;displayName:string;signInPath:string;signOutPath:string}){
  const [organizations,setOrganizations]=useState<Organization[]>([]),[org,setOrg]=useState('');
  const [loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[name,setName]=useState('');
  const [leads,setLeads]=useState<Lead[]>([]),[cursor,setCursor]=useState<string|null>(null),[detail,setDetail]=useState<Lead|null>(null);
  const [editor,setEditor]=useState<Lead|'new'|null>(null),[notice,setNotice]=useState('');
  const requestVersion=useRef(0);
  const loadOrganizations=useCallback(async()=>{
    setBusy(true);setError('');
    try{const data=await api<{items:Organization[]}>('/api/v1/workspaces');setOrganizations(data.items);setOrg(data.items[0]?.organizationId??'');setLoaded(true);}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  },[]);
  useEffect(()=>{if(signedIn)void loadOrganizations();},[signedIn,loadOrganizations]);
  const loadLeads=useCallback(async(selected:string,next:string|null=null)=>{
    const version=++requestVersion.current;setBusy(true);setError('');
    try{const data=await api<{items:Lead[];nextCursor:string|null}>('/api/v1/leads?limit=50'+(next?'&cursor='+encodeURIComponent(next):''),{headers:{'X-Organization-Id':selected}});
      if(version!==requestVersion.current)return;
      setLeads(previous=>next?[...previous,...data.items]:data.items);setCursor(data.nextCursor);
    }catch(e){if(version===requestVersion.current){setLeads([]);setDetail(null);setCursor(null);setError((e as Error).message);}}
    finally{if(version===requestVersion.current)setBusy(false);}
  },[]);
  useEffect(()=>{setLeads([]);setCursor(null);setDetail(null);setEditor(null);setNotice('');++requestVersion.current;if(org)void loadLeads(org);},[org,loadLeads]);
  async function create(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{await api('/api/v1/workspaces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});await loadOrganizations();}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  async function openLead(id:string){
    const version=++requestVersion.current;setBusy(true);setError('');setDetail(null);
    try{const data=await api<Lead>('/api/v1/leads/'+id,{headers:{'X-Organization-Id':org}});if(version===requestVersion.current)setDetail(data);}
    catch(e){if(version===requestVersion.current)setError((e as Error).message);}finally{if(version===requestVersion.current)setBusy(false);}
  }
  const current=organizations.find(item=>item.organizationId===org);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="bg-sidebar text-sidebar-foreground px-6 py-5 flex flex-wrap items-center justify-between gap-4">
      <div><strong className="text-xl">LeadRescue</strong><p className="text-sm mt-1">Minha imobiliária</p></div>
      <nav className="flex flex-wrap items-center gap-5 text-sm"><a href="/demo">Ver demonstração</a>{signedIn?<><span>{displayName}</span><a href={signOutPath} target="_top">Sair</a></>:<a href={signInPath} target="_top">Entrar com ChatGPT</a>}</nav>
    </header>
    <section className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
      {signedIn&&<a href="/importar" className="inline-block rounded-lg border bg-card px-5 py-3 font-medium text-primary">Importar CSV de leads</a>}
      {signedIn&&<section aria-labelledby="teste-500" className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 id="teste-500" className="text-xl font-semibold">Teste com 500 contatos</h2><p className="text-sm text-muted-foreground mt-1">Validação realizada em 12/09/2026 · primeiros 500 registros da aba Contatos únicos</p></div><span className="self-start rounded-full bg-secondary px-3 py-1 text-sm">Resultado de teste</span></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['Registros avaliados','500'],['Sem erros de identificação','424'],['Com erro de telefone','76'],['Possíveis duplicidades','26']].map(([label,count])=><div key={label} className="rounded-lg bg-background p-4"><p className="text-3xl font-semibold">{count}</p><p className="mt-2 text-sm">{label}</p></div>)}</div>
        <div className="grid md:grid-cols-2 gap-5"><div><h3 className="font-medium">Evolução do tratamento de telefones</h3><p className="mt-1">Aprovação de identificação passou de 79 para 424 registros. Foram separados 18 registros com múltiplos telefones; 388 números têm formato válido. Duplicidades não foram unidas.</p></div><div><h3 className="font-medium">Qualidade dos dados</h3><p className="mt-1">76 registros exigem revisão do telefone. Brasil (+55) foi selecionado para este teste. Os 500 não têm data original de cadastro.</p></div></div>
        <p className="border-t pt-4 font-medium">Leads gravados por este teste: 0. Este resumo não representa uma importação nem contatos qualificados para compra de imóveis.</p>
      </section>}
      {!signedIn?<div className="rounded-xl bg-card border p-8 space-y-4"><h1 className="text-2xl font-semibold">Acesse seus leads</h1><p>Entre para acessar os dados da sua imobiliária.</p><a className="inline-block bg-primary text-primary-foreground rounded-lg px-5 py-3" href={signInPath} target="_top">Entrar com ChatGPT</a></div>:<>
        {notice&&<p role="status" className="rounded-lg border bg-card p-4">{notice}</p>}
        {error&&<div role="alert" className="border border-destructive rounded-lg p-4 space-y-3"><p>{error}</p><Button variant="outline" onClick={()=>org?void loadLeads(org):void loadOrganizations()} disabled={busy}>Tentar novamente</Button></div>}
        {busy&&<p role="status">Carregando…</p>}
        {loaded&&!organizations.length&&<form onSubmit={create} className="max-w-xl rounded-xl bg-card border p-8 space-y-5"><h1 className="text-2xl font-semibold">Cadastre sua imobiliária</h1><p>Você será o administrador deste espaço. Se já participa de uma equipe, solicite ao responsável a liberação do seu acesso.</p><label className="block space-y-2"><span>Nome da imobiliária</span><Input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={160}/></label><Button disabled={busy} type="submit">Criar imobiliária</Button></form>}
        {current&&<><div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-2xl font-semibold">Leads</h1><p className="text-muted-foreground mt-2">{current.name} · {roles[current.role]??current.role}</p></div><div className="flex gap-3 items-center">{organizations.length>1&&<Select value={org} onValueChange={setOrg}><SelectTrigger aria-label="Imobiliária" className="w-56"><SelectValue/></SelectTrigger><SelectContent>{organizations.map(item=><SelectItem key={item.organizationId} value={item.organizationId}>{item.name}</SelectItem>)}</SelectContent></Select>}<Button disabled={busy} onClick={()=>setEditor('new')}>Novo lead</Button><Button variant="outline" disabled={busy} onClick={()=>void loadLeads(org)}>Atualizar</Button></div></div>
          {!busy&&!error&&!leads.length?<div className="bg-card border rounded-xl p-8"><h2 className="text-lg font-semibold">Nenhum lead disponível</h2><p className="mt-2 text-muted-foreground">Os leads autorizados para seu perfil aparecerão aqui. Clique em Novo lead para cadastrar sem arquivo ou use Importar CSV de leads.</p></div>:!!leads.length&&<div className="bg-card border rounded-xl overflow-hidden"><Table><TableHeader><TableRow><TableHead>Lead</TableHead><TableHead>Etapa</TableHead><TableHead>Origem</TableHead><TableHead>Contato</TableHead><TableHead>Detalhes</TableHead></TableRow></TableHeader><TableBody>{leads.map(lead=><TableRow key={lead.id}><TableCell className="font-medium">{lead.name}</TableCell><TableCell>{states[lead.currentState]??lead.currentState}</TableCell><TableCell>{lead.source}</TableCell><TableCell>{lead.doNotContact?'Não contatar':lead.humanRequired?'Revisão humana':'Sem bloqueio registrado'}</TableCell><TableCell><Button variant="ghost" disabled={busy} onClick={()=>void openLead(lead.id)}>Abrir</Button></TableCell></TableRow>)}</TableBody></Table></div>}
          {cursor&&<Button disabled={busy} variant="outline" onClick={()=>void loadLeads(org,cursor)}>Carregar mais</Button>}
        </>}
      </>}
    </section>
    <Sheet open={!!detail} onOpenChange={open=>{if(!open)setDetail(null);}}><SheetContent className="overflow-y-auto sm:max-w-lg"><SheetHeader><SheetTitle>{detail?.name??'Lead'}</SheetTitle><SheetDescription>Dados salvos da sua imobiliária.</SheetDescription></SheetHeader>{detail&&<div className="p-6 space-y-5"><Button onClick={()=>{setEditor(detail);setDetail(null);}}>Editar qualificação</Button><dl className="space-y-5"><div><dt className="font-medium">Identificação</dt><dd className="mt-2 break-words">{detail.email||'E-mail não informado'}</dd><dd className="mt-2">{detail.dataQuality?.phones?.length?<ul className="space-y-1">{detail.dataQuality.phones.map((p,i)=><li key={i}>{p.number}{p.extension?' · ramal '+p.extension:''}</li>)}</ul>:detail.phone||'Telefone não informado'}</dd></div><div><dt className="font-medium">Qualificação: {qualificationGroups(detail).filter(g=>g.known).length} de 5 grupos preenchidos</dt><dd className="mt-2 space-y-1">{qualificationGroups(detail).map(g=><p key={g.label}>{g.label}: {g.known?'informado':'pendente'}</p>)}</dd><dd className="text-sm text-muted-foreground mt-2">Preenchimento da ficha; não equivale a probabilidade de compra.</dd></div>{[['Etapa',states[detail.currentState]??detail.currentState],['Origem',detail.source],['Lead Score',detail.leadScore],['Risco de resgate',detail.rescueRisk],['Progressão',detail.progressionScore],['Prioridade de resgate',detail.rescuePriority]].map(([label,value])=><div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium mt-1">{value??'Ainda não calculado'}</dd></div>)}</dl><p>{detail.doNotContact?'Contato bloqueado.':detail.provisionalContactBlock?'Contato sob bloqueio provisório; revisar antes de qualquer ação.':detail.humanRequired?'Revisão humana necessária.':'Nenhum bloqueio de contato registrado.'}</p></div>}</SheetContent></Sheet>
    {editor&&current&&<LeadEditor key={editor==='new'?'new':editor.id+':'+editor.version} org={org} organizationName={current.name} lead={editor==='new'?undefined:editor} onClose={()=>setEditor(null)} onSaved={()=>{setNotice(editor==='new'?'Lead cadastrado. Os dados ficam salvos na sua imobiliária.':'Qualificação salva. A análise de prioridades permanece pendente.');setEditor(null);setDetail(null);void loadLeads(org);}}/>}
  </main>;
}
