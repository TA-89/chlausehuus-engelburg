import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../store.js';
import {calendarEntries,destinationStatus} from '../planner.js';
test('destination guide distinguishes availability, clashes and forbidden windows',()=>{
 const state=seed(),entries=calendarEntries(state),slot={date:'2026-12-02',time:'18:00'};
 assert.equal(destinationStatus(state,entries,'DEMO-101',slot,1).kind,'conflict');
 assert.equal(destinationStatus(state,entries,'DEMO-101',{...slot,time:'21:00'},1).kind,'free');
 assert.equal(destinationStatus(state,entries,'DEMO-101',{...slot,time:'21:15'},1).kind,'blocked');
 assert.equal(destinationStatus(state,entries,'DEMO-101',slot,5).kind,'blocked');
 state.locked.push(slot.date+'-4');assert.equal(destinationStatus(state,entries,'DEMO-101',slot,4).kind,'blocked');
});
test('confirmed visit guide allows only the fixed time and excludes itself from conflicts',()=>{
 const state=seed();state.requests=state.requests.filter(r=>r.id==='DEMO-102');const entries=calendarEntries(state),slot=state.requests[0].slot;
 assert.equal(destinationStatus(state,entries,'DEMO-102',slot,2).kind,'free');
 assert.equal(destinationStatus(state,entries,'DEMO-102',{...slot,time:'19:00'},2).kind,'blocked');
});
