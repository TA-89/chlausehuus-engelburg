import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,load,save} from '../store.js';
import {conflicts} from '../domain.js';
test('30 fictional requests have unique ids and conflict-free planned tours',()=>{
 const s=seed();assert.equal(s.requests.length,30);assert.equal(new Set(s.requests.map(r=>r.id)).size,30);assert.deepEqual(conflicts(s.requests),[]);assert.ok(s.requests.every(r=>r.email.endsWith('@example.invalid')));
});
test('older demo session expands without overwriting edits or new requests',()=>{
 let value=null;globalThis.sessionStorage={getItem:()=>value,setItem:(_,v)=>value=v};
 const s=seed();s.requests=s.requests.slice(0,4);delete s.seedVersion;s.requests[0].wishes='Meine Änderung';s.requests.push({...s.requests[0],id:'DEMO-new'});save(s);
 const migrated=load();assert.equal(migrated.requests.length,31);assert.equal(migrated.requests[0].wishes,'Meine Änderung');assert.equal(load().requests.length,31);
 delete globalThis.sessionStorage;
});
