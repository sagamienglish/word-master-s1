/* Number keys use the same click handlers as touch, preserving all learning rules. */
function handleChoiceNumberKey(event) {
 if(event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || !/^[1-4]$/.test(event.key))return;
 const target=event.target;
 const hiddenLearningInput=target && target.id==='learn-typ-input' && activeScreen==='learn' && (learnPhase===1 || learnPhase===2);
 if(target && !hiddenLearningInput && (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName)))return;
 if([...document.querySelectorAll('[id^="modal-"]')].some(modal=>!modal.classList.contains('hidden')))return;
 let containerId;
 if(activeScreen==='4choice')containerId='qc-choices';
 else if(activeScreen==='learn' && (learnPhase===1 || learnPhase===2))containerId='learn-choices';
 else if(activeScreen==='sentence_choice' && scLayout==='single')containerId='sc-choices';
 else return;
 const container=document.getElementById(containerId);
 if(!container || container.closest('.screen')?.classList.contains('hidden'))return;
 const button=container.querySelectorAll('button')[Number(event.key)-1];
 if(!button || button.disabled || typeof button.onclick!=='function' || button.classList.contains('pointer-events-none'))return;
 event.preventDefault();button.click();
}
function decorateChoiceKeys() {
 ['qc-choices','learn-choices','sc-choices'].forEach(id=>{
  const container=document.getElementById(id);if(!container)return;
  [...container.querySelectorAll('button')].slice(0,4).forEach((button,i)=>{button.dataset.choiceKey=i+1;button.setAttribute('aria-keyshortcuts',String(i+1));});
 });
}
document.addEventListener('keydown',handleChoiceNumberKey);
document.addEventListener('DOMContentLoaded',()=>{
 decorateChoiceKeys();
 const observer=new MutationObserver(decorateChoiceKeys);
 ['qc-choices','learn-choices','sc-choices'].forEach(id=>{const container=document.getElementById(id);if(container)observer.observe(container,{childList:true});});
});
function handleSentenceNextKey(event){
 if(event.defaultPrevented||event.key!=='Enter'||event.repeat||event.isComposing||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
 if(typeof activeScreen==='undefined'||activeScreen!=='sentence_choice'||scLayout!=='single'||!scLocked)return;
 if(event.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName))return;
 if([...document.querySelectorAll('[id^="modal-"]')].some(m=>!m.classList.contains('hidden')))return;
 const button=document.getElementById('sc-next-btn');
 if(!button||button.disabled||button.classList.contains('hidden'))return;
 event.preventDefault();button.click();
}
document.addEventListener('keydown',handleSentenceNextKey);
