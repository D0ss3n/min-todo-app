/* Kom ihåg den senast öppna informationssidan på just den här enheten. */
const pageStateKey='todo-current-page';
const rememberPage=page=>localStorage.setItem(pageStateKey,page);

document.querySelector('#menu-install')?.addEventListener('click',()=>rememberPage('install'));
document.querySelector('#menu-backup')?.addEventListener('click',()=>rememberPage('backup'));
document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>rememberPage(button.dataset.info)));
document.querySelector('#menu-home')?.addEventListener('click',()=>localStorage.removeItem(pageStateKey));

const showHomeForSearch=()=>{
  localStorage.removeItem(pageStateKey);
  document.querySelector('#side-menu')?.classList.remove('open');
  ['#guide','#info-guide','#backup-guide'].forEach(selector=>{
    const panel=document.querySelector(selector);
    if(panel)panel.hidden=true;
  });
};
document.querySelector('#search-button')?.addEventListener('click',showHomeForSearch);
document.querySelector('#find')?.addEventListener('keydown',event=>{
  if(event.key==='Enter')showHomeForSearch();
});

let savedPage=localStorage.getItem(pageStateKey);
if(savedPage?.startsWith('{')){
  localStorage.removeItem(pageStateKey);
  savedPage=null;
}
if(savedPage){
  if(savedPage==='install')document.querySelector('#menu-install')?.click();
  else if(savedPage==='backup')document.querySelector('#menu-backup')?.click();
  else document.querySelector(`[data-info="${savedPage}"]`)?.click();
}
document.documentElement.classList.remove('restoring');

/* Anteckningar till uppgifter. */
document.head.insertAdjacentHTML('beforeend','<style>textarea{width:100%;min-height:78px;resize:vertical;border:2px solid var(--l);border-radius:12px;padding:12px;background:var(--p);color:var(--i);font:inherit}.task .task-note{display:block;grid-column:2;color:var(--m);font-size:.84rem;line-height:1.4;margin-top:3px}.task .task-note+.priority-note{margin-top:6px}.add-note{display:grid;gap:5px;margin-top:10px;color:var(--m);font-size:.85rem;font-weight:700}.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:12px}.stat{background:var(--t);border-radius:14px;padding:12px}.stat b{display:block;font-size:1.3rem;color:var(--v)}.stat span{color:var(--m);font-size:.8rem}@media(max-width:390px){.stats-grid{grid-template-columns:1fr}}</style>');
const addNote=document.createElement('label');addNote.className='add-note';addNote.innerHTML='Anteckning <textarea id="add-note" maxlength="300" placeholder="Valfri kort anteckning"></textarea>';document.querySelector('#form').nextElementSibling.after(addNote);
const editNote=document.createElement('label');editNote.innerHTML='Anteckning<textarea id="edit-note" maxlength="300" placeholder="Valfri kort anteckning"></textarea>';document.querySelector('.edit-buttons').before(editNote);
document.querySelector('#form').onsubmit=event=>{event.preventDefault();const text=document.querySelector('#input').value.trim();if(!text)return;T.unshift({id:crypto.randomUUID(),text,note:document.querySelector('#add-note').value.trim(),done:false,marked:false,priority:document.querySelector('#add-priority').value,createdAt:new Date().toISOString()});save();event.target.reset();document.querySelector('#add-note').value='';document.querySelector('#add-priority').value='normal';document.querySelector('#add-priority-label').textContent='🟡 Normal ▾';render()};
document.addEventListener('click',event=>{if(!event.target.closest('.edit-task'))return;setTimeout(()=>{document.querySelector('#edit-note').value=editingTask?.note||''},0)},true);
document.querySelector('#edit-save').onclick=()=>{const text=document.querySelector('#edit-input').value.trim();if(editingTask&&text){editingTask.text=text;editingTask.note=document.querySelector('#edit-note').value.trim();editingTask.priority=document.querySelector('#edit-priority').value;save();render()}closeEdit()};
const notesRender=render;render=function(){notesRender();document.querySelectorAll('.task').forEach(row=>{const task=T.find(item=>item.text===row.querySelector('.text')?.textContent);if(task?.note){const note=document.createElement('small');note.className='task-note';note.textContent=task.note;row.querySelector('.text').after(note)}})};

/* Statistik för klara uppgifter. */
const statsCard=document.createElement('section');statsCard.className='card';statsCard.id='stats-card';statsCard.innerHTML='<h2>📊 Statistik</h2><div class="stats-grid"><div class="stat"><b id="stat-percent">0 %</b><span>Klart totalt</span></div><div class="stat"><b id="stat-total">0</b><span>Utförda uppgifter</span></div><div class="stat"><b id="stat-today">0</b><span>Klara idag</span></div><div class="stat"><b id="stat-week">0</b><span>Klara denna vecka</span></div></div>';document.querySelector('#focus-card').after(statsCard);
function updateStats(){const now=new Date(),startOfWeek=new Date(now);startOfWeek.setHours(0,0,0,0);startOfWeek.setDate(now.getDate()-((now.getDay()+6)%7));const done=T.filter(task=>task.done),today=done.filter(task=>task.completedAt&&new Date(task.completedAt).toDateString()===now.toDateString()).length,week=done.filter(task=>task.completedAt&&new Date(task.completedAt)>=startOfWeek).length,percent=T.length?Math.round(done.length/T.length*100):0;document.querySelector('#stat-percent').textContent=`${percent} %`;document.querySelector('#stat-total').textContent=done.length;document.querySelector('#stat-today').textContent=today;document.querySelector('#stat-week').textContent=week}
document.querySelector('#move').onclick=()=>{const completedAt=new Date().toISOString();T.forEach(task=>{if(!task.done&&task.marked){task.done=true;task.marked=false;task.completedAt=completedAt}});save();render()};document.querySelector('#back').onclick=()=>{T.forEach(task=>{if(task.done&&task.marked){task.done=false;task.marked=false;delete task.completedAt}});save();render()};const statsRender=render;render=function(){statsRender();updateStats()};render();

/* Nyheter / ändringslogg i menyn. */
document.head.insertAdjacentHTML('beforeend','<style>.change-date{display:block;margin-top:3px;color:var(--m);font-size:.76rem;font-weight:700}</style>');const newsButton=document.createElement('button');newsButton.id='menu-news';newsButton.textContent='📜 Nyheter / Ändringslogg';document.querySelector('#menu-backup').after(newsButton);newsButton.onclick=()=>{rememberPage('news');document.querySelector('#guide').hidden=true;document.querySelector('#backup-guide').hidden=true;document.querySelector('#info-title').textContent='Nyheter / Ändringslogg';document.querySelector('#info-content').innerHTML='<div class="steps"><div class="step"><b>SENASTE NYTT</b><span class="change-date">10 september 2026</span><h3>🛠️ Förbättringar och buggfixar</h3><p>Ändringsloggen har fått datum på varje post. Appens uppdatering och omladdning har också förbättrats för att fungera stabilare på dator och telefon.</p></div><div class="step"><b>SENASTE NYTT</b><span class="change-date">10 september 2026</span><h3>📊 Statistik och 📝 anteckningar</h3><p>Se slutförandeprocent, antal utförda uppgifter samt hur många som blivit klara idag och denna vecka. Du kan också lägga till en kort anteckning till varje uppgift.</p></div><div class="step"><b>TIDIGARE</b><span class="change-date">4 september 2026</span><h3>🎯 Dagens fokus</h3><p>Välj en uppgift som dagens fokus och ändra eller ta bort den när du vill.</p></div><div class="step"><b>TIDIGARE</b><span class="change-date">31 augusti 2026</span><h3>💾 Säkerhetskopia</h3><p>Exportera och importera listan direkt från menyn.</p></div></div>';document.querySelector('#side-menu').classList.remove('open');document.querySelector('#info-guide').hidden=false;document.querySelector('#info-guide').scrollTo(0,0)};
if(savedPage==='news')newsButton.click();
