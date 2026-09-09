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

/* Hämtar nya appversioner även i installerat läge på iPhone. */
if('serviceWorker' in navigator){
  let reloadingForUpdate=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!reloadingForUpdate){
      reloadingForUpdate=true;
      window.location.reload();
    }
  });
  navigator.serviceWorker.register('sw.js?v=68',{updateViaCache:'none'}).then(registration=>{
    if(registration.waiting)registration.waiting.postMessage('SKIP_WAITING');
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      worker?.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage('SKIP_WAITING');
      });
    });
  });
}
