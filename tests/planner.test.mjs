import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../store.js';
import {calendarEntries,moveVisit,overlaps} from '../planner.js';
test('suggestions include every request exactly once without mutating confirmations',()=>{const s=seed(),before=JSON.stringify(s),rs=calendarEntries(s);assert.equal(rs.length,30);assert.equal(new Set(rs.map(r=>r.id)).size,30);assert.equal(JSON.stringify(s),before);assert.ok(rs.every(r=>r.tour>=1&&r.tour<=5));});
test('moving a draft is bounded by family window and allowed days',()=>{const s=seed(),r=s.requests[0];const moved=moveVisit(s,r.id,{date:r.preferred,time:'21:00'},4);assert.equal(moved.requests[0].slot.time,'21:00');assert.equal(moved.requests[0].confirmed,false);assert.throws(()=>moveVisit(s,r.id,{date:r.preferred,time:'21:15'},1));assert.throws(()=>moveVisit(s,r.id,{date:'2026-12-03',time:'18:00'},1));assert.equal(s.requests[0].slot,null);});
test('confirmed times and locked groups cannot be dragged',()=>{const s=seed(),r=s.requests[1];assert.throws(()=>moveVisit(s,r.id,{...r.slot,time:'19:00'},1));assert.equal(moveVisit(s,r.id,r.slot,4).requests[1].tour,4);s.locked.push(r.slot.date+'-4');assert.throws(()=>moveVisit(s,r.id,r.slot,4));});
test('collisions consider group and travel buffer',()=>{const a={slot:{date:'2026-12-02',time:'18:00'},tour:1,duration:30};assert.ok(overlaps(a,{...a,slot:{...a.slot,time:'18:30'}}));assert.ok(!overlaps(a,{...a,tour:2}));assert.ok(!overlaps(a,{...a,slot:{...a.slot,time:'18:40'}}));});

test('daily group limits default to four and Saturday five',()=>{const s=seed(),r=s.requests[0];assert.throws(()=>moveVisit(s,r.id,{date:r.preferred,time:'18:00'},5));s.groups={[r.preferred]:5};assert.equal(moveVisit(s,r.id,{date:r.preferred,time:'18:00'},5).requests[0].tour,5);assert.throws(()=>moveVisit(s,r.id,{date:r.preferred,time:'18:00'},6));});
