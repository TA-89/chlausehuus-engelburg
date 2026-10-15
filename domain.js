export let DAYS=['2026-12-02','2026-12-03','2026-12-04','2026-12-05'];
export let LABELS=['Mittwoch, 2. Dezember','Donnerstag, 3. Dezember','Freitag, 4. Dezember','Samstag, 5. Dezember'];
export let DEADLINE=new Date('2026-11-26T23:59:59+01:00');
export let CLOSE=new Date('2026-11-28T10:00:00+01:00');
export const dateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString('de-CH',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
export const deadlineLabel=()=>DEADLINE.toLocaleString('de-CH',{timeZone:'Europe/Zurich',dateStyle:'long',timeStyle:'short'});
export function configureSeason(state){DAYS=Object.keys(state.hours).sort();LABELS=DAYS.map(dateLabel);const year=state.year||Number(DAYS[0].slice(0,4));DEADLINE=new Date((state.deadline||year+'-11-26')+'T23:59:59+01:00');CLOSE=new Date((state.close||year+'-11-28')+'T10:00:00+01:00');}
export const defaultHours=()=>Object.fromEntries(DAYS.map(d=>[d,{from:new Date(d+'T12:00:00').getDay()===6?'10:00':'17:00',to:new Date(d+'T12:00:00').getDay()===6?'23:00':'21:00'}]));
export const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
export const completeChild=c=>Boolean(c.praise?.trim()||c.files?.length);
export const children=r=>r.families.flatMap(f=>f.children);
export const isGuestChild=(c,f)=>c.guest??Boolean(c.last?.trim()&&c.last.trim()!==f.name?.trim());
export function setChildSurname(c,f,guest,last=''){c.guest=guest;c.last=(guest?last:f.name||'').trim();}
export function confirmationText(r,slot,note=''){
 const date=LABELS[DAYS.indexOf(slot?.date)]||slot?.date||'noch offen';
 return `Guten Tag ${r.contact}\n\nGerne bestätigen wir Ihren Chlausbesuch am ${date} um ${slot?.time||'–'} Uhr.\nBesuchsadresse: ${r.address}, 9032 Engelburg.\n\n${note.trim()?note.trim()+'\n\n':''}Wir freuen uns auf Ihren Besuchstermin. Falls Sie noch mehr Unterlagen zu den Kindern senden möchten, so ergänzen Sie diese bitte bis ${deadlineLabel()}.\n\nFreundliche Grüsse\nChlausemueter Brigitte Arnold\nTannenbergstrasse 26a\n9032 Engelburg\n079 732 02 37\nChlausengruppe Engelburg · Verkehrsverein Engelburg`;
}
export function validateRequest(r,now=new Date(),hours=defaultHours()){
 const errors=[];
 if(now>=CLOSE)errors.push('Die Anmeldefrist ist abgelaufen.');
 if(!r.contact?.trim()||!r.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)||!r.phone?.trim()||!r.address?.trim())errors.push('Bitte Kontaktperson, gültige E-Mail, Telefon und Besuchsadresse ergänzen.');
 if(r.town!=='Engelburg')errors.push('Besuche sind nur in Engelburg möglich.');
 if(!r.families?.length||r.families.some(f=>!f.name?.trim()||!f.children.length||f.children.some(c=>!c.first?.trim()||!c.last?.trim()||c.age===''||!Number.isInteger(Number(c.age))||Number(c.age)<0||Number(c.age)>18)))errors.push('Bitte für jede Familie mindestens ein Kind mit Vorname, Nachname und Alter (0–18) angeben.');
 if(!r.days?.length||!r.days.some(d=>d.date===r.preferred))errors.push('Bitte mindestens einen möglichen Tag und genau einen Wunschtag wählen.');
 for(const d of r.days||[]){const h=hours[d.date];if(!h||!d.from||!d.to||!d.wish||d.from>d.to||d.wish<d.from||d.wish>d.to||d.from<h.from||d.to>h.to)errors.push('Wunschzeit und Zeitraum müssen innerhalb der Besuchszeiten liegen.');}
 if(now>DEADLINE&&!children(r).every(completeChild))errors.push('Nach der Unterlagenfrist sind vollständige Kinderunterlagen für jedes Kind erforderlich.');
 return [...new Set(errors)];
}
export const editable=now=>new Date(now)<=DEADLINE;
export const reminderDue=(r,now)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zurich'}).format(now)===DEADLINE.getFullYear()+'-11-23'&&!children(r).every(completeChild)&&!r.reminded;
export const visibleOnDay=(r,day)=>r.confirmed?r.slot.date===day:r.days.some(d=>d.date===day);
export const duplicateHints=(r,all)=>all.filter(x=>x.id!==r.id&&x.address.trim().toLowerCase()===r.address.trim().toLowerCase());
export function fixAppointment(r,slot,hours=defaultHours()){
 if(r.confirmed)throw Error('Dieser Termin ist bestätigt und gegen Verschieben geschützt.');
 const day=r.days.find(d=>d.date===slot.date),h=hours[slot.date];
 if(!day||!h||slot.time<day.from||slot.time>day.to||slot.time<h.from||slot.time>h.to)throw Error('Der Termin muss im möglichen Zeitraum liegen. Für eine Alternative bitte zuerst mit der Familie Rücksprache halten.');
 return {...r,confirmed:true,slot:{...slot},mail:'nicht gesendet'};
}
export function conflicts(requests){
 const result=[];
 for(const day of DAYS){const rs=requests.filter(r=>r.slot?.date===day);const events=[];
 for(const r of rs){events.push([minutes(r.slot.time),1],[minutes(r.slot.time)+Number(r.duration),-1]);}
 let active=0;for(const [,delta] of events.sort((a,b)=>a[0]-b[0]||a[1]-b[1])){active+=delta;if(active>5){result.push(`${day}: mehr als fünf gleichzeitige Besuche.`);break;}}
 for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i],b=rs[j];if(a.tour&&a.tour===b.tour&&minutes(a.slot.time)<minutes(b.slot.time)+Number(b.duration)+10&&minutes(b.slot.time)<minutes(a.slot.time)+Number(a.duration)+10)result.push(`Tour ${a.tour}: ${a.contact} / ${b.contact} überschneiden sich (inkl. 10 Min. Wegpuffer).`);}
 for(const tour of [1,2,3,4,5]){const ordered=rs.filter(r=>r.tour===tour).sort((a,b)=>(a.order||0)-(b.order||0));for(let i=1;i<ordered.length;i++)if(minutes(ordered[i].slot.time)<minutes(ordered[i-1].slot.time))result.push(`Tour ${tour}: Reihenfolge am ${day} passt nicht zu den Uhrzeiten.`);}
 }return result;
}
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
