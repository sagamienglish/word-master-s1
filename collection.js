'use strict';
const companionCatalog = [
 ['blue-dragon','ブルードラゴン','空','#3882f6','assets/buddy-blue-dragon.png'],
 ['amber-fox','アンバーフォックス','炎','#e99a39','assets/companions/amber-fox-v1.png'],
 ['echo-rabbit','エコーラビット','音','#b48aef','assets/companions/echo-rabbit-v1.png'],
 ['ice-penguin','アイスペンギン','氷','#6bb4da','assets/companions/ice-penguin-v1.png'],
 ['luna-owl','ルナオウル','月','#9981e5','assets/companions/luna-owl-v1.png'],
 ['rune-wolf','ルーンウルフ','岩','#8495ad','assets/companions/rune-wolf-v1.png'],
 ['volt-tiger','ボルトタイガー','雷','#deb642','assets/companions/volt-tiger-v1.png'],
 ['sky-eagle','スカイイーグル','風','#64a4ca','assets/companions/sky-eagle-v1.png'],
 ['emerald-dragon','エメラルドドラゴン','森','#57b984','assets/companions/emerald-dragon-v1.png'],
 ['flare-phoenix','フレアフェニックス','炎','#e77c60','assets/companions/flare-phoenix-v1.png'],
 ['snow-turtle','スノータートル','氷','#69adc6','assets/companions/snow-turtle-v1.png'],
 ['bloom-deer','ブルームディア','花','#d986a3','assets/companions/bloom-deer-v1.png'],
 ['spark-cat','スパークキャット','雷','#d8ae47','assets/companions/spark-cat-v1.png'],
 ['moon-bat','ムーンバット','月','#9582cc','assets/companions/moon-bat-v1.png'],
 ['crystal-whale','クリスタルホエール','水','#63a2d4','assets/companions/crystal-whale-v1.png'],
 ['sand-griffin','サンドグリフィン','砂','#c5a26b','assets/companions/sand-griffin-v1.png'],
 ['gear-ferret','ギアフェレット','鋼','#809ba3','assets/companions/gear-ferret-v1.png'],
 ['coral-axolotl','コーラルウーパー','海','#e191a1','assets/companions/coral-axolotl-v1.png'],
 ['star-fox','スターフォックス','星','#a394dc','assets/companions/star-fox-v1.png'],
 ['cloud-horse','クラウドホース','雲','#80b7c6','assets/companions/cloud-horse-v1.png']
].map(([id,name,type,color,image],i)=>({id,name,type,color,image,number:i+1,growthImages:[`assets/companions/${id}-stage-2.png`,`assets/companions/${id}-stage-3.png`]}));
const companionLevels = [0,50,100,200,350,550,800,1200,2000,3500];
const companionStorageKey = 'wm_studio_v1_companion_collection_v1';
let companionState = null, collectionFilter = 'all', companionDetailId = null;
function getCompanionState() {
 if(companionState) return companionState;
 let stored; try {stored = JSON.parse(localStorage.getItem(companionStorageKey));} catch(_) {}
 const owned = {};
 if(stored && stored.version === 1 && stored.owned && typeof stored.owned === 'object') {
  companionCatalog.forEach(c=>{const entry=stored.owned[c.id];if(entry && Number.isFinite(entry.xp) && entry.xp >=0) owned[c.id]={xp:entry.xp};});
 }
 if(!owned['blue-dragon']) owned['blue-dragon']={xp:Math.max(0,getTotalExpAll())};
 const active = stored && owned[stored.active] ? stored.active : 'blue-dragon';
 const oldTickets=Math.max(0,Math.floor(getTotalExpAll()/30)-(Object.keys(owned).length-1));
 const reward=stored && stored.ticketReward;
 companionState={version:1,active,owned,ticketReward:reward && reward.version===2 ? {version:2,tickets:Math.max(0,Math.floor(Number(reward.tickets)||0)),progress:Math.max(0,Number(reward.progress)||0),lastEarned:typeof reward.lastEarned==='string'?reward.lastEarned:''} : {version:2,tickets:oldTickets,progress:0,lastEarned:''}};
 saveCompanionState();
 return companionState;
}
function saveCompanionState() {try{localStorage.setItem(companionStorageKey,JSON.stringify(companionState));return true;}catch(_){return false;}}
function getActiveCompanionExp(){const s=getCompanionState();return s.owned[s.active].xp;}
function companionGrowth(xp){let level=1;companionLevels.forEach((threshold,i)=>{if(xp>=threshold)level=i+1;});const next=companionLevels[level];const previous=companionLevels[level-1];return{level,stage:level>=7?3:level>=4?2:1,pct:next?Math.min(100,(xp-previous)/(next-previous)*100):100,remaining:next?next-xp:0};}
function companionTicketDate(){const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}
function companionTicketCost(){const count=Object.keys(getCompanionState().owned).length;return count<=5?50:count<=10?75:count<=15?100:200;}
function grantCompanionTicket(){const s=getCompanionState(),r=s.ticketReward,today=companionTicketDate();if(Object.keys(s.owned).length>=companionCatalog.length || r.lastEarned===today || r.progress<companionTicketCost())return;const before={...r};r.progress-=companionTicketCost();r.tickets++;r.lastEarned=today;if(!saveCompanionState())s.ticketReward=before;}
function companionTicketCount(){grantCompanionTicket();return getCompanionState().ticketReward.tickets;}
function companionImage(c,stage=1){return stage>1 && c.growthImages ? c.growthImages[Math.min(3,stage)-2] || c.image : c.image;}
function companionArt(c,owned,growth){return `<div class="companion-art stage-${growth.stage} ${owned?'':'is-silhouette'}"><img src="${companionImage(c,owned?growth.stage:1)}" alt="${owned?c.name:'未入手の相棒のシルエット'}" draggable="false">${owned && growth.stage>1?'<span class="companion-aura" aria-hidden="true"></span>':''}</div>`;}
function renderActiveCompanion(){const s=getCompanionState(),c=companionCatalog.find(c=>c.id===s.active),g=companionGrowth(s.owned[c.id].xp);document.getElementById('mascot-level').textContent=g.level;document.getElementById('mascot-name').textContent=c.name;document.getElementById('mascot-exp-bar').style.width=g.pct+'%';document.getElementById('exp-count').textContent=s.owned[c.id].xp;document.getElementById('mascot-container').style.setProperty('--card-accent',c.color);document.getElementById('mascot-container').innerHTML=companionArt(c,true,g);}
function awardCompanionExp(amount){if(!Number.isFinite(amount)||amount<=0)return;const s=getCompanionState(),before=companionGrowth(s.owned[s.active].xp);s.owned[s.active].xp+=amount;s.ticketReward.progress+=amount;saveCompanionState();if(typeof queueCompanionGrowth==='function')queueCompanionGrowth(s.active,before,companionGrowth(s.owned[s.active].xp));grantCompanionTicket();if(activeScreen==='collection')renderCollection();}
function setCollectionFilter(filter){collectionFilter=filter==='owned'?'owned':'all';renderCollection();}
function renderCollection(){if(typeof renderCompanionGoal==='function')renderCompanionGoal();const s=getCompanionState();document.getElementById('collection-count').textContent=Object.keys(s.owned).length;const tickets=companionTicketCount();document.getElementById('collection-tickets').textContent=tickets;const complete=Object.keys(s.owned).length===companionCatalog.length;document.getElementById('collection-ticket-caption').textContent=complete?'20種類すべての相棒が集まりました':`${s.ticketReward.lastEarned===companionTicketDate()?'今日のチケット獲得済み ✓ · ':''}${s.ticketReward.progress} / ${companionTicketCost()} EXP`;document.getElementById('collection-ticket-bar').style.width=(Math.min(100,s.ticketReward.progress/companionTicketCost()*100))+'%';const draw=document.getElementById('collection-draw');draw.disabled=tickets===0||complete;draw.innerHTML=complete?'コンプリート！':'草原を探索する <span aria-hidden="true">↗</span>';document.getElementById('collection-filter-all').setAttribute('aria-pressed',collectionFilter==='all');document.getElementById('collection-filter-owned').setAttribute('aria-pressed',collectionFilter==='owned');document.getElementById('collection-grid').innerHTML=companionCatalog.filter(c=>collectionFilter==='all'||s.owned[c.id]).map(c=>{const owned=Boolean(s.owned[c.id]),g=companionGrowth(owned?s.owned[c.id].xp:0);return `<button class="companion-card ${owned?'is-owned':'is-locked'} ${s.active===c.id?'is-active':''}" style="--card-accent:${c.color}" onclick="openCompanionDetail('${c.id}')" aria-label="${owned?c.name+' レベル'+g.level:'未入手カード '+c.number}"><div class="companion-card-top"><span>No.${String(c.number).padStart(3,'0')}</span><span>${owned?c.type:'？？？'}</span></div>${companionArt(c,owned,g)}<div class="companion-card-name">${owned?c.name:'まだ見ぬ相棒'}</div><div class="companion-card-bottom"><span>${owned?'Lv. '+g.level:'未入手'}</span><span>${s.active===c.id?'いまの相棒':owned?'成長 '+g.stage+'/3':'チケットで出会う'}</span></div><div class="companion-card-exp"><i style="width:${owned?g.pct:0}%"></i></div></button>`;}).join('');}
function drawCompanion(){if(!document.getElementById('modal-companion').classList.contains('hidden'))return;const s=getCompanionState();const remaining=companionCatalog.filter(c=>!s.owned[c.id]);if(companionTicketCount()===0||remaining.length===0)return;const chosen=remaining[Math.floor(Math.random()*remaining.length)];s.owned[chosen.id]={xp:0};s.ticketReward.tickets--;if(!saveCompanionState()){s.ticketReward.tickets++;delete s.owned[chosen.id];document.getElementById('collection-status').textContent='保存できませんでした。チケットは消費していません。';return;}document.getElementById('collection-status').textContent=typeof startCompanionExploration === 'function'?'草原を探索しています':`${chosen.name}が仲間になりました！`;collectionFilter='all';renderCollection();if(typeof startCompanionExploration === 'function')startCompanionExploration(chosen.id);else openCompanionDetail(chosen.id,true);}
function openCompanionDetail(id,isNew=false){if(typeof stopCompanionExploration === 'function')stopCompanionExploration();const c=companionCatalog.find(c=>c.id===id);if(!c)return;const s=getCompanionState(),owned=Boolean(s.owned[id]),g=companionGrowth(owned?s.owned[id].xp:0);companionDetailId=id;const host=document.getElementById('companion-detail-content');host.style.setProperty('--card-accent',c.color);host.innerHTML=`<div class="companion-detail-kicker">${isNew?'NEW COMPANION':'No. '+String(c.number).padStart(3,'0')}</div>${companionArt(c,owned,g)}<h2 id="companion-detail-name">${owned?c.name:'まだ見ぬ相棒'}</h2><p class="companion-detail-type">${owned?c.type+'の相棒 · Lv. '+g.level:'チケットで、未入手の相棒に出会えます。'}</p>${owned?`<div class="companion-detail-exp"><span>${s.owned[id].xp} EXP</span><span>${g.remaining?'次のレベルまで '+g.remaining+' EXP':'最高レベル'}</span></div><div class="companion-card-exp"><i style="width:${g.pct}%"></i></div><div class="companion-stages">${['めばえ','成長','覚醒'].map((label,i)=>`<span class="${i+1<=g.stage?'reached':''}"><b>${i+1}</b>${label}<small>Lv.${[1,4,7][i]}〜</small></span>`).join('')}</div><button class="companion-select" onclick="selectCompanion('${id}')" ${s.active===id?'disabled':''}>${s.active===id?'いまの相棒':'ホームの相棒にする'}</button><p class="companion-detail-note">学習の経験値は、選んだ相棒に入ります。</p>`:'<button class="companion-select" onclick="closeCompanionDetail()">図鑑に戻る</button>'}`;showModal('modal-companion');document.querySelector('#modal-companion .collection-close').focus();}
function selectCompanion(id){const s=getCompanionState();if(!s.owned[id])return;const prev=s.active;s.active=id;if(!saveCompanionState()){s.active=prev;return;}renderActiveCompanion();renderCollection();openCompanionDetail(id);document.getElementById('collection-status').textContent='ホームの相棒を変更しました';}
function closeCompanionDetail(){if(typeof stopCompanionExploration === 'function')stopCompanionExploration();closeModal('modal-companion');const card=document.querySelector(`.companion-card[onclick="openCompanionDetail('${companionDetailId}')"]`);if(card)card.focus();}
document.addEventListener('keydown',event=>{const modal=document.getElementById('modal-companion');if(!modal||modal.classList.contains('hidden'))return;if(event.key==='Escape'){event.preventDefault();closeCompanionDetail();}if(event.key==='Tab'){const buttons=[...modal.querySelectorAll('button:not([disabled])')];const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
