const fs=require("fs"),vm=require("vm"),assert=require("assert");
vm.runInThisContext(fs.readFileSync("js/rules.js","utf8"));
const R=globalThis.GameRules;
function test(name,fn){try{fn();console.log("✓",name)}catch(e){console.error("✗",name,e.message);process.exitCode=1}}
test("name normalization",()=>{assert.equal(R.normalizeName(" Jason "),"jason");assert.equal(R.normalizeName("JASON"),"jason")});
test("deterministic daily sequence",()=>{assert.deepEqual(R.generate("2026-12-01","2026.1"),R.generate("2026-12-01","2026.1"));assert.notDeepEqual(R.generate("2026-12-01","2026.1"),R.generate("2026-12-02","2026.1"))});
test("practice differs from official",()=>assert.notDeepEqual(R.generate("2026-12-01","2026.1"),R.generate("2026-12-01","2026.1","practice")));
test("all photo selections valid",()=>R.generate("2026-12-01","2026.1").filter(x=>x.type==="photo").forEach(x=>assert(x.photo>=0&&x.photo<3)));
test("single target awards once",()=>{const s=[{id:"x",at:0,life:1000,hits:1,points:10}];assert.equal(R.score(s,[{eventId:"1",targetId:"x",t:10}]),10);assert.throws(()=>R.score(s,[{eventId:"1",targetId:"x",t:10},{eventId:"2",targetId:"x",t:20}]))});
test("snowman needs three taps",()=>{const s=[{id:"x",at:0,life:1000,hits:3,points:20}];assert.equal(R.score(s,[1,2].map(n=>({eventId:String(n),targetId:"x",t:n}))),0);assert.equal(R.score(s,[1,2,3].map(n=>({eventId:String(n),targetId:"x",t:n}))),20)});
test("bomb score clamps at zero",()=>{const s=[{id:"b",at:0,life:1000,hits:1,points:-20},{id:"p",at:0,life:1000,hits:1,points:10}];assert.equal(R.score(s,[{eventId:"1",targetId:"b",t:1},{eventId:"2",targetId:"p",t:2}]),10)});
test("best ten daily scores",()=>assert.equal(R.overall([1,2,3,4,5,6,7,8,9,10,100]),154));
test("reject outside lifetime and duplicate ids",()=>{const s=[{id:"x",at:10,life:10,hits:1,points:10}];assert.throws(()=>R.score(s,[{eventId:"1",targetId:"x",t:21}]));assert.throws(()=>R.score([{id:"a",at:0,life:10,hits:1,points:1},{id:"b",at:0,life:10,hits:1,points:1}],[{eventId:"1",targetId:"a",t:1},{eventId:"1",targetId:"b",t:1}]))});
if(!process.exitCode)console.log("\nAll rule tests passed.");
