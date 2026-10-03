/* Lokala påminnelser när appen är öppen. Bakgrundspush kräver en separat serverdel. */
(()=>{
  const button=document.createElement('button');
  button.id='reminder-notifications';
  button.type='button';
  const menuAnchor=document.querySelector('#menu-news')||document.querySelector('#menu-backup');
  menuAnchor?.after(button);

  const isEnglish=()=>document.documentElement.lang.startsWith('en');
  const updateButton=()=>{
    if(!('Notification'in window)){button.hidden=true;return}
    const en=isEnglish();
    button.textContent=Notification.permission==='granted'?(en?'🔔 Reminders enabled':'🔔 Påminnelser är på'):(en?'🔔 Enable reminders':'🔔 Aktivera påminnelser');
  };
  const today=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};
  const tomorrow=()=>{const date=new Date();date.setDate(date.getDate()+1);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};
  const showReminder=async task=>{
    const en=isEnglish(),dueTomorrow=task.dueDate===tomorrow();
    const title=en?(dueTomorrow?'Due tomorrow':'Due today'):(dueTomorrow?'Förfaller i morgon':'Förfaller idag');
    const options={body:task.text,icon:'todo-icon.svg',tag:`todo-reminder-${task.id}-${task.dueDate}`,renotify:false};
    const registration=await navigator.serviceWorker?.ready;
    if(registration?.showNotification)await registration.showNotification(title,options);
    else new Notification(title,options);
  };
  const checkReminders=()=>{
    if(!('Notification'in window)||Notification.permission!=='granted'||!Array.isArray(T))return;
    const sent=JSON.parse(localStorage.getItem('todo-reminder-notifications')||'{}');
    T.filter(task=>!task.done&&task.dueDate&&(task.dueDate===today()||task.dueDate===tomorrow())).forEach(task=>{
      const key=`${task.id}-${task.dueDate}`;
      if(sent[key])return;
      sent[key]=Date.now();
      showReminder(task).catch(()=>{delete sent[key]});
    });
    localStorage.setItem('todo-reminder-notifications',JSON.stringify(sent));
  };
  button.onclick=async()=>{
    if(!('Notification'in window))return;
    if(Notification.permission==='default')await Notification.requestPermission();
    updateButton();
    checkReminders();
  };
  updateButton();
  checkReminders();
  setInterval(checkReminders,15*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkReminders()});
})();
