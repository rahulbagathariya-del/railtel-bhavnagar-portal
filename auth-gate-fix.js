(function(){
  function fix(){
    const style=document.getElementById('authGateCss');
    if(style) style.textContent=style.textContent.replace(/body\{display:none!important\}/g,'body.auth-locked{display:none!important}');
    const gate=document.getElementById('authGate');
    if(gate) document.body.classList.remove('auth-locked');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fix); else fix();
  setTimeout(fix,50);
  setTimeout(fix,250);
})();