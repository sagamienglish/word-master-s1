/* Home reactions never award EXP or change learning records. */
let buddyLastTap = 0, buddyTapIndex = 0, buddyPreviousMessage = '', buddyRecentLearning = null;
const buddyDailyLines = {
 'blue-dragon':['草むらの向こう、見に行こうか。','次の冒険も、一緒に行こう。'],
 'amber-fox':['あの草むら、何か光った！','新しい単語、見つけに行こう！'],
 'echo-rabbit':['きみの声、聞くのが好き。','今日はどんな音に出会うかな？'],
 'ice-penguin':['ちょっとひと息、深呼吸。','一歩ずつ、進んでいこう。'],
 'luna-owl':['覚えた言葉が、道しるべになるよ。','気になる単語を、一つ見つけよう。'],
 'rune-wolf':['次の一歩も、そばにいる。','準備できたら、出発しよう。'],
 'volt-tiger':['よし、ひと勝負いこう！','今日もいい調子でいこう！'],
 'sky-eagle':['今日はどこまで飛ぼうか。','遠くに、新しい出会いがありそう。'],
 'emerald-dragon':['森の向こうも、見てみたいな。','きみのペースで進もう。'],
 'flare-phoenix':['次の挑戦、楽しみだね！','もう一度なら、きっと進める。'],
 'snow-turtle':['急がなくても、前に進めるよ。','ゆっくり、しっかり覚えよう。'],
 'bloom-deer':['草原に、小さな花が咲いたよ。','覚えた言葉が、また一つ増えるね。'],
 'spark-cat':['あ、面白そうな単語！','ちょっとだけ、挑戦してみる？'],
 'moon-bat':['今日はどんな発見があるかな。','静かな時間も、好きなんだ。'],
 'crystal-whale':['ひと呼吸して、次へ行こう。','言葉の海は、まだまだ広いね。'],
 'sand-griffin':['新しい道を、探してみよう。','次の冒険に、出かける？'],
 'gear-ferret':['準備よし。いつでもいけるよ！','気になるところ、確かめてみよう。'],
 'coral-axolotl':['会えてうれしいな。','今日は何を見つけよう？'],
 'star-fox':['まだ知らない相棒、いるかな？','あっちの草むらも気になる！'],
 'cloud-horse':['風が気持ちいいね。','きみのペースで、どこまでも。']
};
function noteBuddyLearning(amount){buddyRecentLearning={amount,time:Date.now()};}
function getMascotMessage(){
 const s=getCompanionState(),g=companionGrowth(s.owned[s.active].xp),r=s.ticketReward;
 const lines=[];
 if(buddyRecentLearning && Date.now()-buddyRecentLearning.time<300000)lines.push(`さっきの学習で、${buddyRecentLearning.amount} EXP増えたね！`);
 if(Object.keys(s.owned).length<20){
  if(r.lastEarned===companionTicketDate())lines.push('今日のチケット、手に入れたね！');
  else {const remaining=Math.max(0,companionTicketCost()-r.progress);if(remaining>0 && remaining<=20)lines.push(`あと${remaining} EXPで、チケットが手に入るよ。`);}
 }
 if(g.remaining>0 && g.remaining<=30)lines.push(`あと${g.remaining} EXPで、レベルアップ！`);
 const catWords=wordData.filter(w=>w.cat===currentCategory);
 if(catWords.some(w=>wordStatus[w.en]==='x'))lines.push('前に迷った単語、一緒に見直そう。');
 if(!buddyRecentLearning)lines.push('今日は、どの単語からいく？');
 lines.push(...(buddyDailyLines[s.active]||buddyDailyLines['blue-dragon']));
 const candidates=lines.filter(line=>line!==buddyPreviousMessage);
 buddyPreviousMessage=candidates[buddyTapIndex % candidates.length];buddyTapIndex++;
 return buddyPreviousMessage;
}
function handleMascotTap(event){
 const now=Date.now();if(now-buddyLastTap<800)return;buddyLastTap=now;
 if(event) showBuddyTouch(event);
 const art=document.querySelector('#mascot-container .companion-art');
 if(art){art.classList.remove('buddy-hello','buddy-sway','buddy-proud');void art.offsetWidth;art.classList.add(['buddy-hello','buddy-sway','buddy-proud'][buddyTapIndex%3]);}
 showMascotBubble(getMascotMessage());
}
function showMascotBubble(text){
 const bubble=document.getElementById('mascot-bubble');clearTimeout(showMascotBubble.timer);
 bubble.textContent=text;bubble.classList.remove('hidden');
 showMascotBubble.timer=setTimeout(()=>bubble.classList.add('hidden'),3800);
}

function showBuddyTouch(event){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const host=document.getElementById('mascot-container'),rect=host.getBoundingClientRect();
 const x=event.detail===0?rect.width/2:Math.max(0,Math.min(rect.width,event.clientX-rect.left));
 const y=event.detail===0?rect.height/2:Math.max(0,Math.min(rect.height,event.clientY-rect.top));
 host.querySelectorAll('.buddy-touch').forEach(node=>node.remove());
 const effect=document.createElement('span');effect.className='buddy-touch';effect.setAttribute('aria-hidden','true');effect.style.left=x+'px';effect.style.top=y+'px';
 effect.innerHTML='<i class="buddy-touch-ring"></i>'+[[-18,-24],[20,-16],[-6,-35],[25,5]].map(([dx,dy],i)=>'<i class="buddy-touch-spark" style="--dx:'+dx+'px;--dy:'+dy+'px;--delay:'+i*25+'ms">✦</i>').join('');
 host.appendChild(effect);setTimeout(()=>effect.remove(),650);
}
