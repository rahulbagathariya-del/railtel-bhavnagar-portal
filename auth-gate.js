(function(){
  const SUPA_URL='https://xmhdpqviwbtsuaaoxplo.supabase.co';
  const SUPA_KEY='sb_publishable_NPBWNlDlQZMZ9_hN5UWcqQ_pcZP3eKg';
  const ADMIN_EMAIL='rahulbagathariya@gmail.com';
  const GUEST_EMAIL='guest@railtel-bhavnagar.com';
  const GUEST_USER='guest';
  const GUEST_PASS='Guest@2026';
  const sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
  window.__railSupabase=sb;
  const css='<style id="authGateCss">body{display:none!important}#authGate{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#f7f9fc;padding:20px;z-index:999999;font-family:Inter,Arial,sans-serif;color:#172033}#authGate .card{position:relative;width:min(400px,100%);background:#fff;border:1px solid #e5eaf0;border-radius:16px;padding:30px;box-shadow:0 12px 35px #1232;text-align:center}#authGate .admin-top{position:fixed;right:20px;top:18px;width:auto;padding:9px 14px;background:#fff;color:#0757a5;border:1px solid #d9e5f0;border-radius:8px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px #1231}#authGate img{width:88px;height:88px;object-fit:contain;margin-bottom:10px}#authGate h1{font-size:21px;margin:0}#authGate .div{font-size:13px;color:#718096;margin:5px 0 24px}#authGate h2{font-size:18px;margin:0 0 15px}#authGate input{width:100%;padding:11px 12px;margin:6px 0;border:1px solid #e5eaf0;border-radius:8px;box-sizing:border-box}#authGate button.login{width:100%;padding:11px;border:0;border-radius:8px;margin-top:8px;background:#0757a5;color:#fff;font-weight:700;cursor:pointer}#authGate .status{font-size:12px;color:#b42318;margin-top:12px;min-height:18px}#authGate .small{font-size:10px;color:#8a95a5;margin-top:15px}.railLogout{border:1px solid #e5eaf0;background:#fff;color:#b42318;padding:8px 11px;border-radius:8px;cursor:pointer;font-weight:700}';
  document.head.insertAdjacentHTML('beforeend',css);
  function showGate(){
    document.body.innerHTML='<div id="authGate"><button class="admin-top" id="agAdminTop">🔐 Admin Login</button><div class="card"><img src="RailTel_L.png" alt="Logo"><h1>RailTel Corporation Of India Limited</h1><div class="div">Bhavnagar Division</div><h2>Guest Login</h2><input id="agUser" type="text" placeholder="Username" autocomplete="username"><input id="agGuestPass" type="password" placeholder="Password" autocomplete="current-password"><button class="login" id="agGuest">Login as Guest</button><div class="status" id="agStatus"></div><div class="small">Guest access is view-only. You will stay signed in until you press Logout.</div></div></div>';
    document.getElementById('agAdminTop').onclick=showAdmin;
    document.getElementById('agGuest').onclick=guest;
  }
  function showAdmin(){
    const c=document.querySelector('#authGate .card');
    c.innerHTML='<img src="RailTel_L.png" alt="Logo"><h1>RailTel Corporation Of India Limited</h1><div class="div">Bhavnagar Division</div><h2>Admin Login</h2><input id="agEmail" type="email" placeholder="Admin email" autocomplete="username"><input id="agPass" type="password" placeholder="Admin password" autocomplete="current-password"><button class="login" id="agAdmin">Admin Login</button><button class="login" id="backGuest" style="background:#eef4fa;color:#0757a5">Back to Guest Login</button><div class="status" id="agStatus"></div>';
    document.getElementById('agAdmin').onclick=admin;
    document.getElementById('backGuest').onclick=showGate;
  }
  function reveal(user){
    document.body.style.display='block';
    document.documentElement.style.visibility='visible';
    const style=document.getElementById('authGateCss'); if(style) style.remove();
    const gate=document.getElementById('authGate'); if(gate) gate.remove();
    const actions=document.querySelector('.actions');
    if(actions){
      const oldGuest=actions.querySelector('.guest'); if(oldGuest) oldGuest.style.display='none';
      const oldAdmin=actions.querySelector('.admin'); if(oldAdmin) oldAdmin.style.display='none';
      let out=document.getElementById('railLogout');
      if(!out){out=document.createElement('button');out.id='railLogout';out.className='railLogout';out.textContent='Logout';actions.appendChild(out);}
      out.onclick=logout;
    }
    window.__railGuestAuthenticated=(user.email||'').toLowerCase()===GUEST_EMAIL.toLowerCase();
    try{sessionStorage.setItem('rail_guest',window.__railGuestAuthenticated?'1':'0')}catch(e){}
  }
  async function admin(){
    const s=document.getElementById('agStatus'),email=document.getElementById('agEmail').value.trim(),pass=document.getElementById('agPass').value;
    if(!email||!pass){s.textContent='Enter admin email and password.';return}
    s.textContent='Signing in…';
    const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
    if(error){s.textContent=error.message;return}
    if(!data.user||data.user.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase()){await sb.auth.signOut();s.textContent='This account is not an Admin account.';return}
    location.reload();
  }
  async function guest(){
    const s=document.getElementById('agStatus'),u=document.getElementById('agUser').value.trim(),p=document.getElementById('agGuestPass').value;
    if(u!==GUEST_USER||p!==GUEST_PASS){s.textContent='Invalid guest username or password.';return}
    s.textContent='Signing in…';
    const {error}=await sb.auth.signInWithPassword({email:GUEST_EMAIL,password:GUEST_PASS});
    if(error){s.textContent=error.message||'Guest account is not available.';return}
    location.reload();
  }
  async function logout(){
    await sb.auth.signOut({scope:'local'});
    window.__railGuestAuthenticated=false;
    try{sessionStorage.removeItem('rail_guest')}catch(e){}
    location.reload();
  }
  window.guestLogin=function(){showGate()};
  window.adminLogin=function(){showAdmin()};
  async function boot(){
    const {data:{user}}=await sb.auth.getUser();
    if(user && ((user.email||'').toLowerCase()===ADMIN_EMAIL.toLowerCase() || (user.email||'').toLowerCase()===GUEST_EMAIL.toLowerCase())){reveal(user);return;}
    if(user) await sb.auth.signOut({scope:'local'});
    showGate();
    if(location.hash) history.replaceState(null,'',location.pathname+location.search);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();