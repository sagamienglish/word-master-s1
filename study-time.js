/* Count only visible, foreground practice and game sessions. */
function isStudyTimeActive(){
 if(document.hidden||!document.hasFocus())return false;
 const battle=document.querySelector('#daily-boss-modal iframe');
 if(battle){try{return battle.contentWindow.bossBattleIsActive?.()===true}catch{return false}}
 if([...document.querySelectorAll('[id^="modal-"]')].some(m=>!m.classList.contains('hidden')))return false;
 return ['learn','4choice','sentence_choice','typing_drill','listening_drill','listening-vs','matching','matching-vs','timetrial','vs','invader'].includes(activeScreen);
}
