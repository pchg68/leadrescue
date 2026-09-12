export const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
export const A=id(101),B=id(102);
export async function seed(db){
  for(const [org,name] of [[A,'Imobiliária A — fictícia'],[B,'Imobiliária B — fictícia']])
    await db.query('INSERT INTO "Organization" (id,name,"updatedAt") VALUES ($1,$2,now())',[org,name]);
  for(let n=1;n<=7;n++)await db.query('INSERT INTO "User" (id,"authSubject",name,email,"platformAdmin") VALUES ($1,$2,$3,$4,$5)',[id(n),'test:user'+n,'Pessoa fictícia '+n,'user'+n+'@example.invalid',n===7]);
  for(const [n,org,role,active] of [[1,A,'MANAGER',true],[2,A,'BROKER',true],[3,A,'BROKER',true],[4,B,'MANAGER',true],[5,A,'BROKER',true],[6,A,'MANAGER',false]])
    await db.query('INSERT INTO "Membership" (id,"organizationId","userId",role,active) VALUES ($1,$2,$3,$4,$5)',[id(200+n),org,id(n),role,active]);
  for(const [n,org] of [[2,A],[3,A],[4,B]])await db.query('INSERT INTO "Broker" (id,"organizationId","membershipId",name,"updatedAt") VALUES ($1,$2,$3,$4,now())',[id(300+n),org,id(200+n),'Corretor fictício '+n]);
  for(const [n,org,broker] of [[1,A,2],[2,A,2],[3,A,3],[4,B,4]])await db.query('INSERT INTO "Lead" (id,"organizationId","brokerId",name,source,"dataQuality","updatedAt") VALUES ($1,$2,$3,$4,\'fixture\',\'{}\',now())',[id(400+n),org,id(300+broker),'Lead fictício '+n]);
  await db.query('INSERT INTO "LeadEvent" (id,"organizationId","leadId",type,source,"sourceEventId","actorType","occurredAt",payload) VALUES ($1,$2,$3,\'lead.created\',\'fixture\',\'event1\',\'USER\',now(),\'{}\')',[id(501),A,id(401)]);
  await db.query('INSERT INTO "PolicyVersion" (id,"organizationId",version,config,"effectiveAt","createdBy") VALUES ($1,$2,1,\'{}\',now(),$3)',[id(601),A,id(201)]);
  await db.query('INSERT INTO "AnalysisRun" (id,"organizationId","leadId",mode,"asOf","knowledgeCutoff","inputHash","policyVersion","engineVersion") VALUES ($1,$2,$3,\'LIVE\',now(),now(),\'fixture\',1,\'test\')',[id(701),A,id(401)]);
}
