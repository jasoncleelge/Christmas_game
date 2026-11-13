(function(g){
  const TYPES={present:{points:10,hits:1,life:1500},star:{points:30,hits:1,life:1200},snowman:{points:20,hits:3,life:2200},bomb:{points:-20,hits:1,life:1500},photo:{points:50,hits:1,life:1500}};
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rng(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function generate(date,version,practiceNonce){
    const rand=rng(hash(date+"|"+version+"|"+(practiceNonce||"official")));const out=[];let t=350,id=0;
    while(t<44500){const progress=t/45000;const gap=850-progress*360+rand()*260;t+=gap;const r=rand();let type=r<.43?"present":r<.61?"star":r<.78?"snowman":r<.93?"bomb":"photo";const spec=TYPES[type];out.push({id:"t"+(++id),type,at:Math.round(t),life:spec.life,points:spec.points,hits:spec.hits,x:10+rand()*80,y:8+rand()*84,photo:type==="photo"?Math.floor(rand()*3):null})}
    return out;
  }
  function score(sequence,events){
    const map=new Map(sequence.map(x=>[x.id,x])),state={},seen=new Set();let total=0;
    for(const e of events){if(seen.has(e.eventId)||!Number.isFinite(e.t))throw Error("invalid event");seen.add(e.eventId);const target=map.get(e.targetId);if(!target||e.t<target.at||e.t>target.at+target.life)throw Error("event outside target lifetime");const s=state[target.id]||(state[target.id]={hits:0,done:false});if(s.done)throw Error("duplicate award");s.hits++;if(s.hits>target.hits)throw Error("too many taps");if(s.hits===target.hits){s.done=true;total=Math.max(0,total+target.points)}}
    return total;
  }
  function normalizeName(v){return String(v||"").trim().toLocaleLowerCase("en-US")}
  function overall(daily){return [...daily].sort((a,b)=>b-a).slice(0,10).reduce((a,b)=>a+b,0)}
  g.GameRules={TYPES,hash,rng,generate,score,normalizeName,overall};
})(typeof window==="undefined"?globalThis:window);
