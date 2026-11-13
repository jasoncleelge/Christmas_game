(function(){
  const $=id=>document.getElementById(id),C=GAME_CONFIG,R=GameRules,A=GameApi;
  const screens=[...document.querySelectorAll("main>section")];let player=null,dash=null,session=null,mode="practice",run=null,muted=false,status=null;
  function show(id){screens.forEach(x=>x.hidden=x.id!==id);scrollTo(0,0)}
  function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}
  function renderRanks(rows,target="fullRanks"){const el=$(target);if(!el)return;el.innerHTML=(rows||[]).map(r=>`<li class="${player&&r.id===player.id?"current":""}"><b>${esc(r.name)}</b> <span>${r.score} pts</span></li>`).join("")||"<li>No scores yet</li>"}
  function renderMini(rows){$("miniRanks").innerHTML=(rows||[]).slice(0,3).map(r=>`<li>${r.rank}. ${esc(r.name)} — ${r.score}</li>`).join("")||"<li>No scores yet</li>";const me=player&&(rows||[]).find(r=>r.id===player.id);$("myRank").textContent=me&&me.rank>3?`You: #${me.rank} · ${me.score}`:""}
  function tickClock(){const left=Math.max(0,Date.parse(C.closeUtc)-A.now()),d=Math.floor(left/86400000),h=Math.floor(left/3600000)%24,m=Math.floor(left/60000)%60,s=Math.floor(left/1000)%60;$("revealClock").textContent=left?`Prize reveal in ${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`:"Prize reveal time!";if(!left&&status?.state!=="closed")refreshStatus()}
  async function refreshStatus(){try{status=await A.call("status");renderMini(status.standings);if(status.state==="closed"){show("closed");renderRanks(status.standings,"finalRanks");$("podium").innerHTML='<div class="podium">'+status.standings.slice(0,3).map((r,i)=>`<div><strong>${["🥇","🥈","🥉"][i]}</strong><br>${esc(r.name)}<br><b>${r.score}</b></div>`).join("")+"</div>"}}catch(e){console.warn(e)}}
  async function preload(){await Promise.all(C.kids.map(src=>new Promise((ok,bad)=>{const i=new Image;i.onload=()=>i.decode?i.decode().then(ok,bad):ok();i.onerror=bad;i.src=src})))}
  async function login(name){$("loginError").textContent="";try{dash=await A.call("lookup",{name});player=dash.player;localStorage.setItem("sgr_name",player.name);renderDashboard();show("dashboard")}catch(e){$("loginError").textContent=e.message}}
  function renderDashboard(){if(!dash)return;$("welcomeName").textContent=player.name;$("attemptsLeft").textContent=dash.attemptsRemaining;$("todayBest").textContent=dash.todayBest;$("overallScore").textContent=dash.overall;$("officialBtn").disabled=dash.attemptsRemaining<1;$("officialBtn").textContent=dash.attemptsRemaining?"Play official round":"No official attempts left today";renderMini(dash.standings)}
  async function begin(official){void unlockAudio();mode=official?"official":"practice";try{await preload()}catch(e){alert("The three photo assets could not be loaded. Check your connection/files and retry. No attempt was used.");return}
    if(official){const key=A.uid();$("officialBtn").disabled=true;try{session=await A.call("start",{name:player.name,key});localStorage.setItem("sgr_start_key",key)}catch(e){alert(e.message);$("officialBtn").disabled=false;return}}else session={date:new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul"}).format(new Date()),attemptNumber:"Practice"};
    $("countMode").textContent=official?`Official attempt ${session.attemptNumber} of 3`:"Practice — not saved";show("countdown");let n=3;$("countNumber").textContent=n;const timer=setInterval(()=>{n--;$("countNumber").textContent=n||"GO!";if(n<0){clearInterval(timer);startRound()}},1000)}
  function startRound(){show("game");$("roundHud").hidden=false;$("attemptHud").textContent=mode==="official"?`Attempt ${session.attemptNumber}/3`:"Practice";const nonce=mode==="official"?null:A.uid(),seq=R.generate(session.date,C.rulesVersion,nonce),board=$("board");run={seq,events:[],score:0,start:performance.now(),timers:[],done:false};seq.forEach(t=>run.timers.push(setTimeout(()=>spawn(t),t.at)));run.frame=requestAnimationFrame(frame)}
  function spawn(t){if(run.done)return;const b=document.createElement("button");b.type="button";b.className="target "+t.type;b.dataset.id=t.id;b.style.left=t.x+"%";b.style.top=t.y+"%";b.setAttribute("aria-label",t.type);if(t.type==="photo")b.innerHTML=`<img src="${C.kids[t.photo]}" alt="Kids photo bonus">`;else b.innerHTML=`<span class="shape">${{present:"🎁",star:"⭐",snowman:"⛄",bomb:"💣"}[t.type]}</span><span class="hits"></span>`;let hits=0,done=false;b.addEventListener("pointerdown",e=>{e.preventDefault();if(done||run.done)return;hits++;run.events.push({eventId:A.uid(),targetId:t.id,t:Math.round(performance.now()-run.start)});if(t.type==="snowman"&&hits<t.hits){b.querySelector(".hits").textContent=hits+"/3";tone(350);return}done=true;run.score=Math.max(0,run.score+t.points);$("roundScore").textContent=run.score;feedback(b,t.points,t.type==="photo");tone(t.points<0?120:t.type==="photo"?750:500);b.remove()},{passive:false});board.appendChild(b);run.timers.push(setTimeout(()=>{done=true;b.remove()},t.life))}
  function feedback(el,points,bonus){const f=document.createElement("span"),r=el.getBoundingClientRect(),br=$("board").getBoundingClientRect();f.className="feedback "+(points<0?"bad":bonus?"bonus":"");f.textContent=(points>0?"+":"")+points+(bonus?"!":"");f.style.left=(r.left-br.left)+"px";f.style.top=(r.top-br.top)+"px";$("feedbackLayer").appendChild(f);setTimeout(()=>f.remove(),800)}
  let audioContext=null,audioUnlocked=false;
  function unlockAudio(){
    if(muted)return Promise.resolve(null);
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return Promise.resolve(null);
      if(!audioContext||audioContext.state==="closed"){
        try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
        audioContext=new AudioCtx();audioUnlocked=false;
      }
      const a=audioContext,needsUnlock=!audioUnlocked||a.state!=="running";
      const resumed=a.state==="running"?Promise.resolve():a.resume();
      if(needsUnlock){
        const source=a.createBufferSource();source.buffer=a.createBuffer(1,1,a.sampleRate);
        source.connect(a.destination);source.onended=()=>source.disconnect();source.start(0);audioUnlocked=true;
      }
      return Promise.resolve(resumed).then(()=>a.state==="running"?a:null).catch(e=>{audioUnlocked=false;console.warn("Tap the sound button to enable audio.",e);return null});
    }catch(e){console.warn("Audio could not be initialized.",e);return Promise.resolve(null)}
  }
  function tone(freq){
    if(muted)return Promise.resolve(false);
    return unlockAudio().then(a=>{
      if(!a||muted||a.state!=="running")return false;
      try{
        const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
        o.type="sine";o.frequency.setValueAtTime(freq,t);
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.11);
        o.connect(g);g.connect(a.destination);o.onended=()=>{o.disconnect();g.disconnect()};o.start(t);o.stop(t+.12);return true;
      }catch(e){console.warn("Sound playback failed.",e);return false}
    });
  }
  function syncSoundButton(){const b=$("muteBtn");b.textContent=muted?"🔇":"🔊";b.setAttribute("aria-pressed",String(muted));b.setAttribute("aria-label",muted?"소리 켜기":"소리 끄기")}
  ["pointerdown","touchend","click","keydown"].forEach(type=>document.addEventListener(type,()=>{if(!muted)void unlockAudio()},{capture:true,passive:true}));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&audioContext&&!muted)void unlockAudio()});
  function frame(){const elapsed=performance.now()-run.start,left=Math.max(0,C.roundMs-elapsed);$("roundTime").textContent=(left/1000).toFixed(1);if(left<=0)return endRound();run.frame=requestAnimationFrame(frame)}
  async function endRound(){if(run.done)return;run.done=true;run.timers.forEach(clearTimeout);document.querySelectorAll(".target").forEach(x=>x.remove());$("roundHud").hidden=true;$("finalScore").textContent=run.score;$("resultMode").textContent=mode==="official"?"Official round complete":"Practice result — not saved";$("bestMessage").textContent="";show("results");
    if(mode==="practice"){$("saveState").className="save-state";$("saveState").textContent="Practice scores are not saved.";$("remainingMessage").textContent="";renderRanks(status?.standings||[]);return}
    $("saveState").className="save-state saving";$("saveState").textContent="Saving score…";const payload={sessionId:session.sessionId,events:run.events};localStorage.setItem("sgr_pending",JSON.stringify(payload));
    try{const res=await A.call("submit",payload);if(!res.confirmed)throw Error("The server did not confirm the result.");localStorage.removeItem("sgr_pending");$("saveState").className="save-state saved";$("saveState").textContent="Score saved ✓";dash=await A.call("lookup",{name:player.name});const newBest=res.result.score>=dash.todayBest;$("bestMessage").textContent=newBest?"New daily best! 🎉":"";$("remainingMessage").textContent=`${dash.attemptsRemaining} official attempt(s) remaining today.`;renderRanks(res.standings);renderMini(res.standings)}catch(e){$("saveState").className="save-state failed";$("saveState").textContent="Score not confirmed. Keep this page open and retry: "+e.message}}
  $("loginForm").addEventListener("submit",e=>{e.preventDefault();login($("playerName").value)});$("officialBtn").onclick=()=>begin(true);$("practiceBtn").onclick=()=>begin(false);$("playAgain").onclick=()=>mode==="official"?login(player.name).then(()=>begin(true)):begin(false);$("practiceAgain").onclick=()=>begin(false);document.querySelectorAll(".switch").forEach(b=>b.onclick=()=>{player=null;$("playerName").value=localStorage.getItem("sgr_name")||"";show("login")});$("muteBtn").onclick=()=>{muted=!muted;syncSoundButton();if(!muted)void tone(660)};const soundTest=document.createElement("button");soundTest.id="soundTestBtn";soundTest.type="button";soundTest.className="ghost small";soundTest.textContent="소리 테스트";soundTest.setAttribute("aria-label","소리 활성화 및 테스트");soundTest.onclick=()=>{muted=false;syncSoundButton();void tone(660).then(ok=>{soundTest.textContent=ok?"소리 테스트 다시 듣기":"다시 눌러 소리 켜기"})};$("practiceBtn").insertAdjacentElement("afterend",soundTest);syncSoundButton();
  (async()=>{$("modeNote").textContent=C.mockMode?"LOCAL MOCK MODE — scores stay only in this browser.":"Connected to the family scoreboard.";$("playerName").value=localStorage.getItem("sgr_name")||"";await refreshStatus();if(status?.state!=="closed")show("login");setInterval(tickClock,1000);tickClock()})()
})();
