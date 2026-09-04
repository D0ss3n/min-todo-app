/* Kom ihåg den senast öppna informationssidan på just den här enheten. */
const pageStateKey='todo-current-page';
const rememberPage=page=>localStorage.setItem(pageStateKey,page);

document.querySelector('#menu-install')?.addEventListener('click',()=>rememberPage('install'));
document.querySelector('#menu-backup')?.addEventListener('click',()=>rememberPage('backup'));
document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>rememberPage(button.dataset.info)));
document.querySelector('#menu-home')?.addEventListener('click',()=>localStorage.removeItem(pageStateKey));

const savedPage=localStorage.getItem(pageStateKey);
if(savedPage){
  if(savedPage==='install')document.querySelector('#menu-install')?.click();
  else if(savedPage==='backup')document.querySelector('#menu-backup')?.click();
  else document.querySelector(`[data-info="${savedPage}"]`)?.click();
}
document.documentElement.classList.remove('restoring');
