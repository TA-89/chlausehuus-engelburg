import {minutes,fixAppointment} from './domain.js';
export const timeText=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export const overlaps=(a,b)=>a.slot?.date===b.slot?.date&&a.tour===b.tour&&minutes(a.slot.time)<minutes(b.slot.time)+Number(b.duration)+10&&minutes(b.slot.time)<minutes(a.slot.time)+Number(a.duration)+10;
export function cardColumns(visits){
 const layout=new Map();
 for(let t=1;t<=5;t++){
  const sorted=visits.filter(r=>r.tour===t).sort((a,b)=>a.slot.time.localeCompare(b.slot.time));
  let cluster=[],until=-1;
  const finish=()=>{const ends=[];for(const r of cluster){let col=ends.findIndex(n=>n<=minutes(r.slot.time));if(col<0)col=ends.length;ends[col]=minutes(r.slot.time)+Number(r.duration)+10;layout.set(r.id,{col});}for(const r of cluster)layout.get(r.id).count=ends.length;};
  for(const r of sorted){const start=minutes(r.slot.time);if(start>=until){finish();cluster=[];until=-1;}cluster.push(r);until=Math.max(until,start+Number(r.duration)+10);}finish();
 }return layout;
}
export function calendarEntries(state){
 const result=state.requests.filter(r=>r.slot&&r.tour).map(r=>({...r,suggestion:false}));
 for(const r of state.requests.filter(r=>!r.slot||!r.tour)){
  const date=r.slot?.date||r.preferred,window=r.days.find(d=>d.date===date);if(!window)continue;
  const candidate={...r,slot:r.slot||{date,time:window.wish},suggestion:true};
  const options=[1,2,3,4,5].filter(t=>!state.locked.includes(date+'-'+t));
  const score=t=>{const group=result.filter(x=>x.slot.date===date&&x.tour===t);return group.filter(x=>overlaps({...candidate,tour:t},x)).length*100+Math.max(0,group.length-3)*10+group.length;};
  candidate.tour=r.tour||options.sort((a,b)=>score(a)-score(b)||a-b)[0]||1;result.push(candidate);
 }return result;
}
export function moveVisit(state,id,slot,tour){
 const r=state.requests.find(x=>x.id===id);if(!r)throw Error('Anfrage nicht gefunden.');
 if(!Number.isInteger(tour)||tour<1||tour>5)throw Error('Bitte Gruppe 1 bis 5 wählen.');
 if(r.confirmed&&(r.slot.date!==slot.date||r.slot.time!==slot.time))throw Error('Bestätigte Besuchszeiten bleiben geschützt. Bitte zuerst persönlich Rücksprache halten.');
 if((r.slot&&state.locked.includes(r.slot.date+'-'+r.tour))||state.locked.includes(slot.date+'-'+tour))throw Error('Diese Tour ist fixiert. Zuerst die Planung wieder öffnen.');
 if(!r.confirmed)fixAppointment(r,slot,state.hours);
 const updated={...r,slot:{...slot},tour};
 const requests=state.requests.map(x=>x.id===id?updated:{...x});
 for(const date of Object.keys(state.hours))for(let t=1;t<=5;t++)requests.filter(x=>x.slot?.date===date&&x.tour===t).sort((a,b)=>a.slot.time.localeCompare(b.slot.time)).forEach((x,i)=>x.order=i+1);
 return {...state,requests};
}
