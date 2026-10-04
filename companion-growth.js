const pendingCompanionGrowth=new Map();
function queueCompanionGrowth(id,before,after) {
 if(after.level<=before.level)return;
 const previous=pendingCompanionGrowth.get(id);
 pendingCompanionGrowth.set(id,{id,before:previous?previous.before:before,after});
}
function showPendingCompanionGrowth() {
 if(!pendingCompanionGrowth.size)return;
 const event=pendingCompanionGrowth.values().next().value;pendingCompanionGrowth.delete(event.id);
 const companion=companionCatalog.find(c=>c.id===event.id);
 const evolved=event.after.stage>event.before.stage,awakened=evolved&&event.after.stage===3;
 const overlay=document.getElementById('modal-companion-growth');
 overlay.className='growth-overlay '+(awakened?'is-awakening':evolved?'is-evolving':'is-level-up');
 overlay.style.setProperty('--growth-color',companion.color);
 const title=awakened?'覚醒！':evolved?'新しい姿に成長！':'レベルアップ！';
 overlay.innerHTML=`<div class="growth-panel" role="document"><span class="growth-kicker">${awakened?'AWAKENING':evolved?'EVOLUTION':'LEVEL UP'}</span><h2 id="growth-title">${title}</h2><div class="growth-reveal"><div class="growth-ring"></div>${evolved?`<img class="growth-before" src="${companionImage(companion,event.before.stage)}" alt="">`:''}<img class="growth-after" src="${companionImage(companion,event.after.stage)}" alt="${companion.name}の${awakened?'覚醒した':evolved?'成長した':'現在の'}姿"><div class="growth-sparks" aria-hidden="true">✦</div></div><strong class="growth-name">${companion.name}</strong><p class="growth-level">Lv.${event.before.level} <span>→</span> <b>Lv.${event.after.level}</b></p><p class="growth-message">${awakened?'学びの力で、秘めた力が目覚めた。':evolved?'学びを重ねて、相棒が新しい姿に。':'積み重ねた学びが、相棒の力になった。'}</p><button type="button" onclick="closeCompanionGrowth()">一緒に進もう <span aria-hidden="true">→</span></button></div>`;
 if(typeof playSound==='function')playSound('match');
 overlay.querySelector('button').focus();
}
function closeCompanionGrowth(){document.getElementById('modal-companion-growth').classList.add('hidden');showPendingCompanionGrowth();}
