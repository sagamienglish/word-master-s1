/* Only the new history key is written. Existing learning records stay intact. */
function updateStudioGrowth(category, mastered, total = 0, unsure = 0, missed = 0) {
    if(typeof renderTodayReview==='function')renderTodayReview();
    const panel = document.getElementById('studio-growth');
    if (!panel) return;
    const localDay = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const now = new Date(), day = localDay(now);
    let history = {};
    try {
        const stored = JSON.parse(localStorage.getItem('wm_studio_v1_mastery_history') || '{}');
        if(stored && typeof stored === 'object' && !Array.isArray(stored)) history = stored;
    } catch (_) {}
    if(!history[category] || typeof history[category] !== 'object' || Array.isArray(history[category])) history[category] = {};
    history[category][day] = mastered;
    try { localStorage.setItem('wm_studio_v1_mastery_history', JSON.stringify(history)); } catch (_) {}
    const days = Array.from({length:7}, (_,i) => {
        const date = new Date(now); date.setDate(date.getDate() - 6 + i);
        const key = localDay(date), value = history[category][key];
        return {key, label:`${date.getMonth()+1}/${date.getDate()}`, value:Number.isFinite(value) && value >= 0 ? value : null};
    });
    const recorded = days.filter(d => d.value !== null);
    const max = Math.max(1, ...recorded.map(d => d.value));
    const gain = mastered - recorded[0].value;
    const badge = recorded.length > 1 ? `記録初日から ${gain >= 0 ? '+' : ''}${gain}語` : '直近7日';
    const chartLabel = days.map(d => `${d.label} ${d.value === null ? '未記録' : d.value+'語'}`).join('、');
    panel.innerHTML = `<div class="studio-growth-head"><strong>習得語数の推移</strong><span>${badge}</span></div><div class="studio-growth-bars" role="img" aria-label="${chartLabel}">${days.map(d => `<div class="studio-growth-day"><b>${d.value === null ? '—' : d.value}</b><div class="studio-growth-track">${d.value === null ? '' : `<i style="height:${d.value/max*100}%"></i>`}</div><small>${d.label}</small></div>`).join('')}</div>${recorded.length === 1 ? '<p class="growth-note">今日から記録 · — は未記録</p>' : ''}`;
    const unseen = document.getElementById('studio-unseen');
    if(unseen) unseen.textContent = Math.max(0, total - mastered - unsure - missed);
    const caption = document.getElementById('studio-category-caption');
    if(caption) caption.textContent = `${categoryDisplayName(category)} · 全${total}語`;
}
