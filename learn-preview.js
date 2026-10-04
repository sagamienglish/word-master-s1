function showLearnPreview() {
 const list=document.getElementById('learn-preview-list');
 document.getElementById('learn-preview-count').textContent=learnTargets.length;
 list.innerHTML=learnTargets.map((word,i)=>{
  const hint=wordStudyNote(word);
  return `<article class="learn-preview-card"><div class="learn-preview-word"><span>${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(word.en)}</h3></div><p class="learn-preview-meaning">${escapeHtml(word.jp)}</p>${hint?`<p class="learn-preview-hint">${escapeHtml(hint)}</p>`:''}</article>`;
 }).join('');
 showModal('modal-learn-preview');list.scrollTop=0;
}
function beginLearnPreviewSession() {
 if(document.getElementById('modal-learn-preview').classList.contains('hidden'))return;
 closeModal('modal-learn-preview');renderLearnPhase();
}
