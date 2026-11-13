(function(){
  const exact={
    "Overall":"종합 순위","Loading…":"불러오는 중…","Prize reveal":"선물 공개","Santa’s Gift Rush":"산타의 선물 대작전",
    "Loading Christmas magic…":"크리스마스 마법을 불러오는 중…","Tap fast, collect gifts, and climb the family scoreboard!":"빠르게 눌러 선물을 모으고 가족 순위에 도전하세요!",
    "Registered family name":"등록된 이름","Continue":"계속하기","Welcome":"환영합니다","Switch player":"플레이어 바꾸기",
    "attempts today":"오늘 남은 도전","today’s best":"오늘 최고점","overall":"종합 점수",
    "An official attempt is used as soon as the server starts the session. Leaving or refreshing does not restore it.":"서버에서 공식 게임을 시작하는 순간 도전 기회가 사용됩니다. 나가거나 새로고침해도 복구되지 않습니다.",
    "Play official round":"게임 시작","Practice — unlimited":"연습하기 — 무제한","How to play":"게임 방법",
    "tap once":"한 번 누르기","gold star":"황금 별","tap 3×":"세 번 누르기","avoid!":"누르지 마세요!","photo star":"사진 별",
    "45 seconds. Targets speed up. Misses cost nothing.":"제한 시간은 45초예요. 점점 빨라지며, 놓쳐도 감점은 없습니다.",
    "Get ready!":"준비하세요!","Something went wrong":"문제가 발생했어요","Retry":"다시 시도","Full scoreboard":"전체 순위",
    "Play again":"다시 도전","Practice":"연습하기","Christmas Champions!":"크리스마스 챔피언!",
    "Final results · December 19, 2026":"최종 결과 · 2026년 12월 19일",
    "LOCAL MOCK MODE — scores stay only in this browser.":"로컬 테스트 모드 — 점수는 이 브라우저에만 저장됩니다.",
    "Connected to the family scoreboard.":"가족 순위표에 연결되었습니다.","Practice — not saved":"연습 모드 — 점수가 저장되지 않습니다.",
    "Practice result — not saved":"연습 결과 — 저장되지 않습니다.","Practice scores are not saved.":"연습 점수는 저장되지 않습니다.",
    "Saving score…":"점수를 저장하는 중…","Score saved ✓":"점수가 저장되었습니다 ✓","New daily best! 🎉":"오늘의 새로운 최고 기록! 🎉",
    "Prize reveal time!":"선물 공개 시간이에요!","No scores yet":"아직 기록이 없습니다"
  };
  const patterns=[
    [/^Prize reveal in (\d+)d (\d+)h (\d+)m (\d+)s$/,"선물 공개까지 $1일 $2시간 $3분 $4초"],
    [/^Official attempt (\d+) of 3$/,"공식 도전 $1/3"],[/^Attempt (\d+)\/3$/,"도전 $1/3"],
    [/^(\d+) official attempt\(s\) remaining today\.$/,"오늘 공식 도전이 $1회 남았습니다."],
    [/^No official attempts left today$/,"오늘의 공식 도전을 모두 사용했습니다"],[/^You: #(\d+) · (\d+)$/,"내 순위: $1위 · $2점"],
    [/^Official round complete$/,"공식 게임 완료"],[/^That name is not on the family roster\..*$/,"등록되지 않은 이름입니다. 진행자에게 문의해 주세요."],
    [/^The competition has not started yet\.$/,"아직 대회가 시작되지 않았습니다."],[/^No official attempts remain today\.$/,"오늘의 공식 도전을 모두 사용했습니다."],
    [/^An official round is already active\.$/,"이미 진행 중인 공식 게임이 있습니다."],[/^Final rounds are finishing\..*$/,"마지막 게임이 진행 중입니다. 오후 7시에 우승자를 발표합니다."],
    [/^The three photo assets could not be loaded\..*$/,"아이 사진을 불러오지 못했습니다. 연결 상태를 확인해 주세요. 도전 기회는 사용되지 않았습니다."],
    [/^Score not confirmed\..*$/,"점수 저장이 확인되지 않았습니다. 페이지를 닫지 말고 다시 시도해 주세요."]
  ];
  function text(node){if(node.nodeType!==Node.TEXT_NODE)return;const raw=node.nodeValue,t=raw.trim();if(!t)return;let out=exact[t];if(!out)for(const [re,v] of patterns)if(re.test(t)){out=t.replace(re,v);break}if(out)node.nodeValue=raw.replace(t,out)}
  function translate(root){if(root.nodeType===Node.TEXT_NODE)return text(root);const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())text(n);root.querySelectorAll?.("[aria-label]").forEach(el=>{const m={"Mute sound":"소리 끄기","Game board":"게임판","Overall scoreboard":"종합 순위"};const v=el.getAttribute("aria-label");if(m[v])el.setAttribute("aria-label",m[v])})}
  translate(document.body);new MutationObserver(cs=>cs.forEach(c=>{c.addedNodes.forEach(translate);if(c.type==="characterData")text(c.target)})).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
