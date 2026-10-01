/* Molnsynk för Att göra lista. Firebase web API-nyckeln är en offentlig appidentifierare;
   åtkomsten skyddas av Firebase Authentication och Firestore-regler. */
(()=>{
  if(!window.firebase)return;
  const firebaseConfig={apiKey:'AIzaSyB7gHnwaDCTIRrK7vE2NjkntNE4Tb60kjQ',authDomain:'todo-list-aff74.firebaseapp.com',projectId:'todo-list-aff74',storageBucket:'todo-list-aff74.firebasestorage.app',messagingSenderId:'836194978024',appId:'1:836194978024:web:5f9679bd917810f8e5e15d'};
  firebase.initializeApp(firebaseConfig);
  const auth=firebase.auth(),db=firebase.firestore(),provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});

  document.head.insertAdjacentHTML('beforeend','<style>.sync-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;margin:0 0 16px;border:1px solid var(--l);border-radius:15px;background:var(--p)}.sync-card b{display:block;font-size:.88rem}.sync-card small{display:block;color:var(--m);margin-top:2px}.sync-card button{min-height:40px;white-space:nowrap;background:var(--t);color:var(--i)}.sync-card .sync-google{background:var(--v);color:#fff}@media(max-width:430px){.sync-card{align-items:flex-start;flex-direction:column}.sync-card button{width:100%}}</style>');
  const syncCard=document.createElement('section');
  syncCard.className='sync-card';syncCard.id='sync-card';
  syncCard.innerHTML='<div><b id="sync-title">☁️ Synka mellan enheter</b><small id="sync-status">Logga in för att se samma lista på telefon och dator.</small></div><button class="sync-google" id="sync-login">Fortsätt med Google</button>';
  document.querySelector('header').after(syncCard);
  const title=document.querySelector('#sync-title'),status=document.querySelector('#sync-status'),login=document.querySelector('#sync-login');
  let unsubscribe=null,remoteReady=false,applyingRemote=false;
  const plainTasks=()=>T.map(({marked,...task})=>task);
  const documentFor=user=>db.collection('users').doc(user.uid).collection('todo').doc('state');
  const setStatus=text=>status.textContent=text;
  const originalSave=save;
  async function pushState(){
    const user=auth.currentUser;
    if(!user||!remoteReady||applyingRemote)return;
    setStatus('Synkar ändringar …');
    try{await documentFor(user).set({tasks:plainTasks(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});setStatus('Synkad ✓')}catch(error){console.warn('Kunde inte synka listan',error);setStatus('Kunde inte synka just nu — ändringarna finns kvar på enheten.')}
  }
  save=function(){originalSave();pushState()};
  login.onclick=async()=>{
    try{
      if(auth.currentUser){await auth.signOut();return}
      setStatus('Öppnar Google-inloggning …');
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      if(matchMedia('(max-width:700px)').matches)await auth.signInWithRedirect(provider);else await auth.signInWithPopup(provider);
    }catch(error){console.warn('Google-inloggningen misslyckades',error);const message=error?.code==='auth/unauthorized-domain'?'Webbadressen saknar behörighet i Firebase. Kontrollera Authorized domains.':error?.code==='auth/network-request-failed'?'Kontrollera internetanslutningen och försök igen.':`Inloggningen kunde inte öppnas (${error?.code||'okänt fel'}).`;setStatus(message)}
  };
  auth.onAuthStateChanged(async user=>{
    if(unsubscribe){unsubscribe();unsubscribe=null}remoteReady=false;
    if(!user){title.textContent='☁️ Synka mellan enheter';login.textContent='Fortsätt med Google';login.className='sync-google';setStatus('Logga in för att se samma lista på telefon och dator.');return}
    title.textContent='☁️ Du är inloggad';login.textContent='Logga ut';login.className='';setStatus('Hämtar din synkade lista …');
    const ref=documentFor(user);
    try{
      const first=await ref.get();
      if(!first.exists)await ref.set({tasks:plainTasks(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      remoteReady=true;
      unsubscribe=ref.onSnapshot(snapshot=>{
        if(!snapshot.exists)return;
        const cloudTasks=Array.isArray(snapshot.data().tasks)?snapshot.data().tasks:[];
        applyingRemote=true;T=cloudTasks.map(task=>({...task,marked:false}));originalSave();render();applyingRemote=false;setStatus('Synkad ✓');
      },error=>{console.warn('Kunde inte läsa synkad lista',error);setStatus('Synkning saknar behörighet.')});
    }catch(error){console.warn('Kunde inte starta synkning',error);setStatus('Kunde inte starta synkningen. Kontrollera internet och behörighet.')}
  });
  auth.getRedirectResult().catch(error=>{console.warn('Kunde inte slutföra Google-inloggningen',error);setStatus(`Inloggningen kunde inte slutföras (${error?.code||'okänt fel'}).`)});
})();
