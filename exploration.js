/* Exploration presents a draw already committed by collection.js. It never spends a ticket. */
let companionExploration = null;
function stopCompanionExploration() {
 if(companionExploration) companionExploration.timers.forEach(clearTimeout);
 companionExploration = null;
 const shell=document.querySelector('#modal-companion .companion-detail');
 if(shell) shell.classList.remove('is-exploring');
 const close=document.querySelector('#modal-companion .collection-close');
 if(close)close.setAttribute('aria-label','カードを閉じる');
}
function explorationDelay(callback,milliseconds) {
 const expedition=companionExploration;
 const reduced=typeof matchMedia==='function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
 const timer=setTimeout(()=>{if(companionExploration===expedition)callback();},reduced?0:milliseconds);
 expedition.timers.push(timer);
}
function startCompanionExploration(id) {
 stopCompanionExploration();
 const c=companionCatalog.find(c=>c.id===id);
 if(!c || !getCompanionState().owned[id])return;
 if(typeof initAudio==='function')initAudio();
 companionDetailId=id;
 companionExploration={id,phase:'travel',selected:null,timers:[]};
 const shell=document.querySelector('#modal-companion .companion-detail');
 shell.classList.add('is-exploring');
 document.querySelector('#modal-companion .collection-close').setAttribute('aria-label','探索を閉じる');
 const host=document.getElementById('companion-detail-content');
 host.style.setProperty('--card-accent',c.color);
 host.innerHTML=`<section class="expedition" data-phase="travel" aria-label="相棒との出会い"><div class="expedition-heading"><span>COMPANION JOURNEY</span><h2 id="companion-detail-name">はじまりの草原</h2><button class="expedition-skip" onclick="finishCompanionExploration()">演出をスキップ ↗</button></div><div class="expedition-world"><div class="expedition-backdrop" aria-hidden="true"></div><div class="expedition-vignette" aria-hidden="true"></div><span class="expedition-firefly firefly-one" aria-hidden="true"></span><span class="expedition-firefly firefly-two" aria-hidden="true"></span><span class="expedition-firefly firefly-three" aria-hidden="true"></span><div class="expedition-creature" aria-hidden="true"><img src="${c.image}" alt="" draggable="false"></div>${[{name:"岩のそば",x:22,y:62},{name:"草むら",x:50,y:70},{name:"花のそば",x:78,y:62}].map((spot,i)=>`<button class="expedition-spot" id="expedition-spot-${i}" style="left:${spot.x}%;top:${spot.y}%" onclick="selectExplorationSpot(${i})" aria-label="${spot.name}を選ぶ" aria-pressed="false" disabled><i aria-hidden="true"></i><span>${spot.name}</span></button>`).join('')}<div class="expedition-orb" aria-hidden="true"></div><div class="expedition-impact" aria-hidden="true"></div><div class="expedition-card-spark" aria-hidden="true"><span>✦</span><div class="expedition-mini-card"><small>No.${String(c.number).padStart(3,'0')}</small><img src="${c.image}" alt=""><b>${c.name}</b></div></div></div><div class="expedition-footer"><div><p id="expedition-status" role="status">草原に、誰かの気配。</p><span id="expedition-note">チケット1枚 · 必ず新しい相棒に出会えます</span></div><button id="expedition-action" onclick="handleExplorationAction()" disabled>探索中…</button></div></section>`;
 showModal('modal-companion');
 document.querySelector('#modal-companion .collection-close').focus();
 explorationDelay(()=>{
  setExplorationPhase('search');
  for(let i=0;i<3;i++)document.getElementById('expedition-spot-'+i).disabled=false;
  document.getElementById('expedition-status').textContent='気になる場所を選ぼう。';
  document.getElementById('expedition-action').textContent='場所を選ぶ';
 },650);
}
function setExplorationPhase(phase){if(!companionExploration)return;companionExploration.phase=phase;document.querySelector('.expedition').setAttribute('data-phase',phase);}
function selectExplorationSpot(index){
 if(!companionExploration || !['search','aim'].includes(companionExploration.phase) || !Number.isInteger(index) || index<0 || index>2)return;
 const spots=[{name:'岩のそば',x:22,y:62},{name:'草むら',x:50,y:70},{name:'花のそば',x:78,y:62}];
 const spot=spots[index];companionExploration.selected=index;setExplorationPhase('aim');
 const scene=document.querySelector('.expedition-world');
 scene.style.setProperty('--target-x',spot.x+'%');scene.style.setProperty('--target-y',spot.y+'%');scene.style.setProperty('--arc-x',((50+spot.x)/2)+'%');
 for(let i=0;i<3;i++)document.getElementById('expedition-spot-'+i).setAttribute('aria-pressed',i===index?'true':'false');
 document.getElementById('expedition-status').textContent=spot.name+'から、気配がする。';
 document.getElementById('expedition-note').textContent='ボールを投げて、相棒を呼び出そう';
 document.getElementById('expedition-action').textContent='ボールを投げる';document.getElementById('expedition-action').disabled=false;
}
function throwExplorationOrb(){
 if(!companionExploration || companionExploration.phase!=='aim' || companionExploration.selected===null)return;
 setExplorationPhase('throwing');
 for(let i=0;i<3;i++)document.getElementById('expedition-spot-'+i).disabled=true;
 document.getElementById('expedition-action').disabled=true;document.getElementById('expedition-action').textContent='届くかな…';
 document.getElementById('expedition-status').textContent='光のボールが、草原へ。';
 explorationDelay(()=>{setExplorationPhase('discover');explorationDelay(()=>{
  if(typeof playSound==='function')playSound('correct');setExplorationPhase('encounter');
  const c=companionCatalog.find(c=>c.id===companionExploration.id);
  document.getElementById('expedition-status').textContent=c.name+'が現れた！';
  document.getElementById('expedition-note').textContent='あなたのコレクションに迎えよう';
  document.getElementById('expedition-action').textContent='仲間にする';document.getElementById('expedition-action').disabled=false;
 },450);},950);
}
function investigateCompanionClue(){selectExplorationSpot(1);throwExplorationOrb();}
function handleExplorationAction(){if(!companionExploration)return;if(companionExploration.phase==='aim')throwExplorationOrb();else if(companionExploration.phase==='encounter')welcomeExplorationCompanion();}
function welcomeExplorationCompanion(){
 if(!companionExploration || companionExploration.phase!=='encounter')return;
 setExplorationPhase('welcome');
 document.getElementById('expedition-action').disabled=true;
 document.getElementById('expedition-action').textContent='カードに迎えています';
 document.getElementById('expedition-status').textContent='新しい相棒が、仲間になった。';
 if(typeof playSound==='function')playSound('match');
 explorationDelay(finishCompanionExploration,1000);
}
function finishCompanionExploration(){if(!companionExploration)return;const id=companionExploration.id;const c=companionCatalog.find(c=>c.id===id);stopCompanionExploration();document.getElementById('collection-status').textContent=c.name+'が仲間になりました！';openCompanionDetail(id,true);}
