import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../store.js';
import {switchSeason} from '../seasons.js';
import {configureSeason,DAYS,DEADLINE,fixAppointment} from '../domain.js';
import {moveVisit,calendarEntries} from '../planner.js';
import {tourContent} from '../tour.js';

test('new season preserves all prior data and returns without mutation',()=>{
 const state=seed();state.requests[0].personalMessage='Persönlicher Text';state.tourContacts={'2026-12-02-1':{chlaus:{name:'Demo'}}};state.hours['2026-12-01']={from:'16:00',to:'21:00'};
 const next=switchSeason(state,2027);assert.equal(next.requests.length,0);assert.equal(next.archives[2026].requests.length,30);next.requests.push({...seed().requests[0],id:'NEW'});
 const restored=switchSeason(next,2026);assert.deepEqual(restored.requests,state.requests);assert.deepEqual(restored.hours,state.hours);assert.deepEqual(restored.tourContacts,state.tourContacts);assert.equal(restored.archives[2027].requests[0].id,'NEW');assert.equal(state.archives,undefined);
});
test('extra days and next-year deadlines configure scheduling',()=>{const s=switchSeason(seed(),2027);s.hours['2027-12-01']={from:'16:00',to:'21:00'};s.deadline='2027-11-25';configureSeason(s);assert.ok(DAYS.includes('2027-12-01'));assert.equal(DEADLINE.getFullYear(),2027);assert.equal(DEADLINE.toISOString().slice(0,10),'2027-11-25');configureSeason(seed());});
test('special appointments appear once and retain bounded time when moved between groups',()=>{const s=seed(),r={id:'SPECIAL',type:'special',title:'Kindergarten',contact:'Demo',address:'Demo 1',families:[],days:[{date:'2026-12-02',from:'20:30',to:'20:30',wish:'20:30'}],preferred:'2026-12-02',slot:null,tour:null,confirmed:false,duration:20};s.requests.push(r);assert.equal(calendarEntries(s).filter(x=>x.id==='SPECIAL').length,1);const next=moveVisit(s,'SPECIAL',{date:r.preferred,time:'20:30'},2);assert.equal(next.requests.at(-1).tour,2);assert.throws(()=>moveVisit(s,'SPECIAL',{date:r.preferred,time:'20:45'},2),/Zeitraum/);});
test('tour document includes funfacts and escapes user content',()=>{const r=seed().requests[1];r.families[0].children[0].funfact='<script>alert(1)</script>';const html=tourContent({date:'2026-12-02',group:1,visits:[r]});assert.ok(html.includes('Funfact: &lt;script&gt;'));assert.ok(html.includes('google.com/maps/dir/'));assert.ok(html.includes('Daniel Beispiel'));assert.ok(!html.includes('<script>'));});
