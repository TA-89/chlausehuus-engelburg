import test from 'node:test';
import assert from 'node:assert/strict';
import {setChildSurname,isGuestChild,confirmationText} from '../domain.js';
test('children inherit current family name while guests keep their own surname',()=>{
 const f={name:'Muster'},c={last:''};setChildSurname(c,f,false);assert.equal(c.last,'Muster');assert.equal(isGuestChild(c,f),false);
 f.name='Neu';setChildSurname(c,f,false);assert.equal(c.last,'Neu');
 setChildSurname(c,f,true,' Gast ');assert.equal(c.last,'Gast');assert.equal(isGuestChild(c,f),true);
 setChildSurname(c,f,false);assert.equal(c.last,'Neu');assert.equal(c.guest,false);
 assert.equal(isGuestChild({last:'Alt'},{name:'Muster'}),true);
});
test('confirmation embeds optional personal message between appointment and standard closing',()=>{
 const r={contact:'Anna Muster',address:'Musterweg 1'},slot={date:'2026-12-02',time:'18:30'};
 const text=confirmationText(r,slot,' Bitte beim Gartentor warten.\nBis bald! ');
 assert.ok(text.includes('18:30 Uhr'));assert.ok(text.includes('Musterweg 1'));
 assert.ok(text.indexOf('Besuchsadresse:')<text.indexOf('Bitte beim Gartentor'));
 assert.ok(text.indexOf('Bis bald!')<text.indexOf('Wir freuen uns'));
 assert.ok(text.includes('Brigitte Arnold'));assert.ok(!confirmationText(r,slot).includes('undefined'));
});
