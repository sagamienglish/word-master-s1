/* Review suggestions, factual session feedback, collection goals and local backups. */
let learningHistory;
try{learningHistory=JSON.parse(localStorage.getItem('wm_studio_v1_review_schedule')||'{}');}catch(_){learningHistory={};}
if(!learningHistory || typeof learningHistory!=='object' || Array.isArray(learningHistory))learningHistory={};
let learningInsight=null, pendingLearningBackup=null;
function beginLearningInsight(){learningInsight={before:{...wordStatus},correct:new Set(),wrong:new Set()};}
function noteLearningAnswer(en,correct){
 if(learningInsight){(correct?learningInsight.correct:learningInsight.wrong).add(en);}
 const old=learningHistory[en]||{},now=Date.now();
 const sameDay=old.successAt && companionLocalDay(old.successAt)===companionLocalDay(now);
 const streak=correct?(sameDay?Math.max(1,old.streak||1):(old.streak||0)+1):0;
 const days=[1,3,7,14][Math.min(3,Math.max(0,streak-1))];
 learningHistory[en]={lastAt:now,successAt:correct?now:old.successAt||0,streak,dueAt:correct?now+days*86400000:now,correct};
 try{localStorage.setItem('wm_studio_v1_review_schedule',JSON.stringify(learningHistory));}catch(_){}
}
function companionLocalDay(time){const d=new Date(time);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function todayReviewWords(now=Date.now()){
 const today=companionLocalDay(now);
 return wordData.filter(w=>w.cat===currentCategory).filter(w=>{
  const h=learningHistory[w.en];
  if(h && h.correct && companionLocalDay(h.successAt)===today)return false;
  return ['x','t'].includes(wordStatus[w.en]) || (wordStatus[w.en]==='o' && (!h || h.dueAt<=now));
 }).sort((a,b)=>{
  const rank=w=>wordStatus[w.en]==='x'?0:wordStatus[w.en]==='t'?1:2;
  return rank(a)-rank(b) || (learningHistory[a.en]?.lastAt||0)-(learningHistory[b.en]?.lastAt||0);
 }).slice(0,5);
}
function renderTodayReview(){
 const host=document.getElementById('today-review');if(!host)return;
 const words=todayReviewWords();
 host.innerHTML=`<div><strong>今日の復習</strong><span>${words.length?`ミス・あやふや・覚えた語の確認 · ${words.length}問`:'今日の復習はありません'}</span></div><button type="button" onclick="startTodayReview()" ${words.length?'':'disabled'}>${words.length?'短く復習する →':'完了 ✓'}</button>`;
}
function startTodayReview(){
 const words=todayReviewWords();if(!words.length)return;
 initAudio();if(!useStamina())return;
 lastRunConfig=null;navTo('4choice');init4Choice(words);
}
function showLearningInsight(type){
 const host=document.getElementById('learning-insight');if(!host)return;
 host.classList.add('hidden');host.textContent='';
 if(type==='info' || !learningInsight)return;
 const recovered=[...learningInsight.correct].filter(en=>learningInsight.before[en]==='x' && !learningInsight.wrong.has(en)).length;
 const checked=learningInsight.correct.size;
 if(checked){host.textContent=recovered?`前にミスした${recovered}語に、今回は最初から正解。`:`今回、${checked}語に正解できました。`;host.classList.remove('hidden');}
 if(!checked){const words=new Set([...document.querySelectorAll('#res-extra [data-result-status-word]')].map(el=>el.dataset.resultStatusWord));if(words.size){host.textContent=`今回、${words.size}語を練習しました。`;host.classList.remove('hidden');}}
 learningInsight=null;
}
function renderCompanionGoal(){
 const host=document.getElementById('companion-goal');if(!host)return;
 const s=getCompanionState(),owned=companionCatalog.filter(c=>s.owned[c.id]),awakened=owned.filter(c=>companionGrowth(s.owned[c.id].xp).stage===3).length;
 const c=companionCatalog.find(c=>c.id===s.active),g=companionGrowth(s.owned[c.id].xp);
 const target=g.stage<3?(g.stage===1?200:800):3500;
 const text=g.level===10?`${c.name}は最高レベルに到達！`:`${c.name}の${g.stage===1?'成長':g.stage===2?'覚醒':'最高レベル'}まで、あと${Math.max(0,target-s.owned[c.id].xp)} EXP`;
 host.innerHTML=`<div><strong>${owned.length===20?'次は、お気に入りを育てよう。':'相棒の育成目標'}</strong><p>${text}</p></div><span>覚醒 ${awakened} / ${companionCatalog.length}体</span>`;
}
const learningBackupKeys = new Set(["wm_studio_v1_boss_daily","wm_studio_v1_last_category","wm_studio_v1_sec","wm_studio_v1_date","wm_studio_v1_streak","wm_studio_v1_word_status","wm_studio_v1_cpu","wm_studio_v1_stamina","wm_studio_v1_stamina_time","wm_studio_v1_category_exp","wm_studio_v1_exp","wm_studio_v1_learn_review","wm_studio_v1_weekly_study","wm_studio_v1_last_run","wm_studio_v1_theme","wm_studio_v1_mastery_history","wm_studio_v1_review_schedule","wm_studio_v1_companion_collection_v1"]);
function captureLearningBackup(){
 const entries={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(learningBackupKeys.has(key))entries[key]=localStorage.getItem(key);}
 return {format:'word-master-backup',version:1,createdAt:new Date().toISOString(),entries};
}
function validateLearningBackup(data){
 if(!data || data.format!=='word-master-backup' || data.version!==1 || !data.entries || typeof data.entries!=='object' || Array.isArray(data.entries))throw Error('Word Masterのバックアップファイルではありません。');
 const entries={};
 for(const [key,value] of Object.entries(data.entries)){
  if(!learningBackupKeys.has(key) || typeof value!=='string' || value.length>1500000)throw Error('対応していない記録が含まれています。');
  if(key==='wm_studio_v1_boss_daily'){const b=JSON.parse(value);if(!b||typeof b.day!=='string'||!/^\d{4}-\d{1,2}-\d{1,2}$/.test(b.day)||!Number.isFinite(b.exp)||b.exp<0||typeof b.attempted!=='boolean'||typeof b.rewarded!=='boolean'||(b.attempts!==undefined&&(!Number.isInteger(b.attempts)||b.attempts<0||b.attempts>5)))throw Error('ボス戦の記録が不正です。');}
  if(key==='wm_studio_v1_companion_collection_v1'){
   const s=JSON.parse(value);if(s.version!==1 || !s.owned || Array.isArray(s.owned) || typeof s.owned!=='object')throw Error('相棒の記録を読み込めません。');
   for(const [id,entry] of Object.entries(s.owned))if(!companionCatalog.some(c=>c.id===id) || !entry || !Number.isFinite(entry.xp) || entry.xp<0)throw Error('相棒の経験値が不正です。');
   if(!s.owned['blue-dragon'] || !s.owned[s.active])throw Error('相棒の選択が不正です。');
   if(s.ticketReward && (s.ticketReward.version!==2 || !Number.isInteger(s.ticketReward.tickets) || s.ticketReward.tickets<0 || !Number.isFinite(s.ticketReward.progress) || s.ticketReward.progress<0 || typeof s.ticketReward.lastEarned!=='string'||(s.ticketReward.progressDay!==undefined&&typeof s.ticketReward.progressDay!=='string')))throw Error('チケットの記録が不正です。');
  }else if(['wm_studio_v1_word_status','wm_studio_v1_review_schedule','wm_studio_v1_category_exp','wm_studio_v1_weekly_study','wm_studio_v1_mastery_history','wm_studio_v1_last_run','wm_studio_v1_learn_review'].includes(key)){
   const parsed=JSON.parse(value);if((!parsed || typeof parsed!=='object') && !(key==='wm_studio_v1_last_run' && parsed===null))throw Error('学習記録の形式が不正です。');
   if(key==='wm_studio_v1_learn_review' && (!Array.isArray(parsed)||parsed.some(item=>!item||typeof item.en!=='string'||!wordData.some(w=>w.en===item.en&&w.cat===item.cat)||!Number.isFinite(item.time))))throw Error('復習リストが不正です。');
   if(key==='wm_studio_v1_last_run' && parsed!==null && (!wordData.some(w=>w.cat===parsed.category)||!['learn','4choice','sentence_choice','typing_drill','listening_drill','matching','timetrial','vs','invader'].includes(parsed.mode)))throw Error('再挑戦の設定が不正です。');
   if(['wm_studio_v1_weekly_study','wm_studio_v1_mastery_history'].includes(key) && (Array.isArray(parsed)||Object.values(parsed).some(row=>!row||typeof row!=='object'||Array.isArray(row)||Object.values(row).some(v=>!Number.isFinite(v)||v<0))))throw Error('学習履歴が不正です。');
   if(key==='wm_studio_v1_word_status' && (Array.isArray(parsed)||Object.values(parsed).some(v=>!['o','t','x'].includes(v))))throw Error('単語の評価が不正です。');
   if(key==='wm_studio_v1_category_exp' && (Array.isArray(parsed)||Object.values(parsed).some(v=>!Number.isFinite(v)||v<0)))throw Error('経験値が不正です。');
   if(key==='wm_studio_v1_review_schedule')for(const item of Object.values(parsed))if(!item||!Number.isFinite(item.lastAt)||!Number.isFinite(item.dueAt)||!Number.isFinite(item.streak)||item.streak<0||typeof item.correct!=='boolean')throw Error('復習記録が不正です。');
  }else if(key==='wm_studio_v1_theme' && !['default','pistachio','lavender','skywash','apricot','mint','cyber'].includes(value))throw Error('テーマの記録が不正です。');
  if(['wm_studio_v1_sec','wm_studio_v1_streak','wm_studio_v1_cpu','wm_studio_v1_stamina','wm_studio_v1_stamina_time','wm_studio_v1_exp'].includes(key) && (!Number.isFinite(Number(value))||Number(value)<0))throw Error('数値の記録が不正です。');
  if(key==='wm_studio_v1_last_category' && !wordData.some(w=>w.cat===value))throw Error('教材の設定が不正です。');
  entries[key]=value;
 }
 if(!Object.keys(entries).length)throw Error('学習記録が入っていません。');return {...data,entries};
}
function downloadLearningBackup(){
 const blob=new Blob([JSON.stringify(captureLearningBackup(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=`word-master-${companionTicketDate()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 document.getElementById('backup-status').textContent='ファイルの保存を開始しました。保存先で確認し、別の端末へ共有してください。';
}
async function previewLearningBackup(input){
 pendingLearningBackup=null;document.getElementById('backup-restore').disabled=true;
 const file=input.files[0];if(!file)return;
 try{
  if(file.size>2000000)throw Error('ファイルが大きすぎます。');
  const data=validateLearningBackup(JSON.parse(await file.text()));pendingLearningBackup=data;
  const s=JSON.parse(data.entries.wm_studio_v1_companion_collection_v1||'{"owned":{}}');
  const exp=Number(data.entries.wm_studio_v1_exp)||0;
  document.getElementById('backup-status').textContent=`読み込み内容：相棒${Object.keys(s.owned).length}体・累計${exp} EXP。現在の記録をこの内容に置き換えます。`;
  document.getElementById('backup-restore').disabled=false;
 }catch(error){document.getElementById('backup-status').textContent=error.message;}
}
function restoreLearningBackup(){
 if(!pendingLearningBackup)return;
 const before=captureLearningBackup();
 try{
  localStorage.setItem('wm_studio_v1_restore_safety',JSON.stringify(before));
  learningBackupKeys.forEach(key=>localStorage.removeItem(key));
  Object.entries(pendingLearningBackup.entries).forEach(([key,value])=>localStorage.setItem(key,value));
 }catch(_){
  try{learningBackupKeys.forEach(key=>localStorage.removeItem(key));Object.entries(before.entries).forEach(([key,value])=>localStorage.setItem(key,value));}catch(_){}
  document.getElementById('backup-status').textContent='保存できませんでした。変更前の記録の復元を試みました。';return;
 }
 location.reload();
}
function usePreviousLearningBackup(){
 try{pendingLearningBackup=validateLearningBackup(JSON.parse(localStorage.getItem('wm_studio_v1_restore_safety')||'null'));document.getElementById('backup-status').textContent='前回の読み込み前の記録を選択しました。「この記録で引き継ぐ」で戻せます。';document.getElementById('backup-restore').disabled=false;}catch(_){document.getElementById('backup-status').textContent='戻せる記録がありません。';}
}
function openLearningBackup(){pendingLearningBackup=null;document.getElementById('backup-restore').disabled=true;document.getElementById('backup-file').value='';document.getElementById('backup-status').textContent='書き出したファイルを、別の端末のWord Masterで読み込んでください。';showModal('modal-learning-backup');document.getElementById('backup-export').focus();}
document.addEventListener('keydown',event=>{
 const modal=document.getElementById('modal-learning-backup');if(!modal || modal.classList.contains('hidden'))return;
 if(event.key==='Escape'){closeModal('modal-learning-backup');return;}
 if(event.key==='Tab'){const items=[...modal.querySelectorAll('button:not([disabled]),input')],first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
renderTodayReview();
