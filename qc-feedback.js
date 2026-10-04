/* Short usage/memory tips, intentionally avoiding unverified etymologies. */
const wordMemoryTips = {
 global:'globe（地球）と global（地球規模の）をセットで覚えよう。global warming は「地球温暖化」。',
 sense:'「感覚」と「意味」をまとめて覚えよう。a sense of ～ は「～の感覚」、make sense は「意味をなす・筋が通る」。',
 advantage:'take advantage of ～ は「～を利用する」。advantage とセットで覚えると使いやすい。',
 species:'species は単数でも複数でも同じ形。one species / many species と覚えよう。',
 disease:'「病気」は disease。「病気にかかっている」は have a disease の形で使える。',
 form:'名詞の「形」と動詞の「形成する」を、同じ「形を作る」イメージで覚えよう。',
 benefit:'benefit from ～ は「～から恩恵を受ける」。前置詞 from とセットで覚えよう。',
 affect:'affect は動詞「影響する」。effect はよく名詞「影響・効果」として使われる。',
 effect:'have an effect on ～ は「～に影響を与える」。on までひとまとまりで覚えよう。',
 improve:'improve は「よくする・よくなる」。名詞 improvement もセットで覚えよう。',
 increase:'「増える・増やす」にも、名詞の「増加」にも使える。increase in ～ は「～の増加」。',
 decrease:'increase（増える）と対にして覚えよう。decrease は「減る・減らす」。',
 information:'information は数えない名詞。an information ではなく a piece of information と言う。',
 advice:'advice は名詞「助言」、advise は動詞「助言する」。つづりの c と s に注目。',
 succeed:'succeed in ～ing は「～することに成功する」。success（成功）もセットで覚えよう。',
 develop:'develop は「発達する・発展させる」。development（発達・発展）とセットで覚えよう。',
 experience:'「経験」のほか、動詞の「経験する」にも使える。経験を積むなら gain experience。',
 environment:'environmental（環境の）も同じ仲間。environment / environmental をセットで覚えよう。',
 opportunity:'have an opportunity to ～ は「～する機会がある」。to の後に動詞を続ける。',
 require:'require は「必要とする」。be required to ～ は「～することを求められる」。',
 consider:'consider ～ing は「～することを検討する」。動詞を続けるなら -ing の形。',
 prevent:'prevent A from ～ing は「Aが～するのを防ぐ」。from までセットで覚えよう。',
 allow:'allow A to ～ は「Aが～するのを許す」。人と to の後の動詞をセットに。',
 provide:'provide A with B は「AにBを提供する」。provide B for A の形も使える。',
 available:'available は「利用できる・手に入る」。人について使うと「都合がつく」の意味にもなる。',
 interested:'人の気持ちは interested、興味を引くものは interesting。I am interested in ～ と覚えよう。',
 suggest:'suggest ～ing は「～することを提案する」。suggestion（提案）もセットで覚えよう。'
};
function wordStudyNote(target) {
 const source=window.wordStudyNotes?.[target.cat+'::'+target.en.toLowerCase()];
 if(source){return [source.note,source.phrase&&source.translation?`${source.phrase} ｜ ${source.translation}`:''].filter(Boolean).join('\n');}
 return wordMemoryTips[target.en.toLowerCase()]||'';
}
function qcExampleHtml(target) {
 const example=(window.exampleQuestions||[]).find(e=>e.en===target.en && e.cat===target.cat)
  || (window.exampleQuestions||[]).find(e=>e.en===target.en);
 const tip=wordStudyNote(target);
 let html='';
 if(example){
  const full=example.full || example.sentence.replace(/\(\s*\)/g,example.answer||target.en);
  const word=(example.answer||target.en).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const parts=full.split(new RegExp(`(\\b${word}\\b)`,'gi'));
  const highlighted=parts.map((p,i)=>i%2?`<strong>${escapeHtml(p)}</strong>`:escapeHtml(p)).join('');
  html+=`<div class="qc-example"><p class="qc-example-en">${highlighted}</p><p class="qc-example-jp">${escapeHtml(example.jp)}</p></div>`;
 }
 if(tip)html+=`<div class="qc-memory"><p>${escapeHtml(tip)}</p></div>`;
 return html;
}
function handleQcNextKey(event) {
 if(event.key!=='Enter'||event.repeat||event.isComposing||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
 if(typeof activeScreen==='undefined'||activeScreen!=='4choice')return;
 if(event.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName))return;
 if([...document.querySelectorAll('[id^="modal-"]')].some(m=>!m.classList.contains('hidden')))return;
 const next=document.querySelector('#qc-feedback:not(.hidden) .qc-next');
 if(!next)return;
 event.preventDefault();next.click();
}
document.addEventListener('keydown',handleQcNextKey);
function resetQcFeedback() {
 document.getElementById('qc-answer').textContent='';
 document.getElementById('qc-answer').classList.add('hidden');
 document.getElementById('qc-feedback').innerHTML='';
 document.getElementById('qc-feedback').classList.add('hidden');
 document.getElementById('screen-4choice').classList.remove('qc-answered');
}
function showQcFeedback(target,isEnToJp) {
 if(!isEnToJp){const answer=document.getElementById('qc-answer');answer.textContent=target.en;answer.classList.remove('hidden');}
 document.getElementById('screen-4choice').classList.add('qc-answered');
 const feedback=document.getElementById('qc-feedback');
 feedback.innerHTML=qcExampleHtml(target)+`<button type="button" class="qc-next" onclick="qcIndex++;render4Choice()">${qcIndex+1===qcTargets.length?'結果を見る':'次へ'} <span aria-hidden="true">→</span></button>`;
 feedback.classList.remove('hidden');
}
