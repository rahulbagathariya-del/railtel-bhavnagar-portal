(function(){
  function apply(){
    const gate=document.getElementById('authGate');
    if(!gate||gate.dataset.layoutFixed)return;
    const adminEmail=document.getElementById('agEmail');
    const adminPass=document.getElementById('agPass');
    const adminBtn=document.getElementById('agAdmin');
    const guestUser=document.getElementById('agUser');
    const guestPass=document.getElementById('agGuestPass');
    const guestBtn=document.getElementById('agGuest');
    if(!adminEmail||!adminPass||!adminBtn||!guestUser||!guestPass||!guestBtn)return;
    gate.dataset.layoutFixed='1';
    const card=gate.querySelector('.card');
    const sep=gate.querySelector('.sep');
    if(adminEmail.parentElement===card) adminEmail.style.display='none';
    adminPass.style.display='none';
    adminBtn.style.display='none';
    if(sep)sep.style.display='none';
    const title=card.querySelector('h2');
    if(title)title.textContent='Guest Login';
    const top=document.createElement('button');
    top.type='button';top.textContent='Admin Login';top.id='guestFirstAdmin';
    top.style.cssText='position:fixed;right:22px;top:18px;width:auto;padding:9px 16px;margin:0;background:#fff;color:#0757a5;border:1px solid #0757a5;border-radius:8px;font-weight:700;cursor:pointer;z-index:1000000';
    gate.appendChild(top);
    top.onclick=function(){
      const adminMode=adminEmail.style.display!=='none';
      adminEmail.style.display=adminMode?'none':'';
      adminPass.style.display=adminMode?'none':'';
      adminBtn.style.display=adminMode?'none':'';
      guestUser.style.display=adminMode?'':'none';
      guestPass.style.display=adminMode?'':'none';
      guestBtn.style.display=adminMode?'':'none';
      if(sep)sep.style.display=adminMode?'none':'';
      if(title)title.textContent=adminMode?'Guest Login':'Admin Login';
      top.textContent=adminMode?'Admin Login':'Guest Login';
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  const observer=new MutationObserver(apply);observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,100);setTimeout(apply,500);setTimeout(apply,1200);
})();