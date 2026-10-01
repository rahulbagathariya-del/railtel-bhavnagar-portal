(function(){
  const SUPA_URL='https://xmhdpqviwbtsuaaoxplo.supabase.co';
  const SUPA_KEY='sb_publishable_NPBWNlDlQZMZ9_hN5UWcqQ_pcZP3eKg';
  const ADMIN_EMAIL='rahulbagathariya@gmail.com';
  const GUEST_EMAIL='guest@railtel-bhavnagar.com';
  const GUEST_USER='guest';
  const GUEST_PASS='Guest@2026';
  const sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
  const css=`<style id="authGateCss">body{display:none!important}#authGate{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#f7f9fc;padding:20px;z-index:999999;font-family:Inter,Arial,sans-serif;color:#172033}#authGate .card{width:min(430px,100%);background:#fff;border:1px solid #e5eaf0;border-radius:16px;padding:30px;box-shadow:0 12px 35px #1232;text-align:center}#authGate img{width:92px;height:92px;object-fit:contain;margin-bottom:10px}#authGate h1{font-size:22px;margin:0}#authGate .div{font-size:13px;color:#718096;margin:5px 0 24px}#authGate h2{font-size:18px;margin:0 0 15px}#authGate input{width:100%;padding:11px 12px;margin:6px 0;border:1px solid #e5eaf0;border-radius:8px;box-sizing:border-box}#authGate button{width:100%;padding:11px;border:0;border-radius:8px;margin-top:8px;background:#0757a5;color:#fff;font-weight:700;cursor:pointer}#authGate button.alt{background:#eef4fa;color:#0757a5;border:1px solid #d9e5f0}#authGate .status{font-size:12px;color:#b42318;margin-top:12px;min-height:18px}#authGate .ok{color:#18794e}.sep{margin:18px 0;border-top:1px solid #e5eaf0}.small{font-size:10px;color:#8a95a5;margin-top:15px}`;
  document.head.insertAdjacentHTML('beforeend',css);
  function screen(){
    document.body.innerHTML=`<div id="authGate"><div class="card"><img src="RailTel_L.png" alt="Logo"><h1>RailTel Corporation Of India Limited</h1><div class="div">Bhavnagar Division</div><h2>Portal Login</h2><input id="agEmail" type="email" placeholder="Admin email"><input id="agPass" type="password" placeholder="Admin password"><button id="agAdmin">Admin Login</button><div class="sep"></div><input id="agUser" type="text" placeholder="Guest username"><input id="agGuestPass" type="password" placeholder="Guest password"><button class="alt" id="agGuest">Guest Login</button><div class="status" id="agStatus"></div><div class="small">Login is required to access PoP folders and documents.</div></div></div>`;
    document.getElementById('agAdmin').onclick=admin;
    document.getElementById('agGuest').onclick=guest;
  }
  async function setupGuest(){
    try{
      const {data:{session}}=await sb.auth.getSession();
      if(!session||!session.user||session.user.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase()) return {error:'Admin authentication required.'};
      const r=await sb.functions.invoke('setup-guest');
      if(r.error) return {error:r.error.message||'Guest setup failed.'};
      return r.data||{};
    }catch(e){return {error:e.message||'Guest setup failed.'}}
  }
  async function admin(){
    const s=document.getElementById('agStatus'),email=document.getElementById('agEmail').value.trim(),pass=document.getElementById('agPass').value;
    if(!email||!pass){s.textContent='Enter admin email and password.';return}
    s.textContent='Signing in…';
    const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
    if(error){s.textContent=error.message;return}
    if(!data.user||data.user.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase()){await sb.auth.signOut();s.textContent='This account is not an Admin account.';return}
    s.className='status ok';s.textContent='Admin verified. Setting up Guest access…';
    const g=await setupGuest();
    if(g.error){await sb.auth.signOut();s.className='status';s.textContent=g.error;return}
    location.reload();
  }
  async function guest(){
    const s=document.getElementById('agStatus'),u=document.getElementById('agUser').value.trim(),p=document.getElementById('agGuestPass').value;
    if(u!==GUEST_USER||p!==GUEST_PASS){s.textContent='Invalid guest username or password.';return}
    s.textContent='Signing in…';
    const {error}=await sb.auth.signInWithPassword({email:GUEST_EMAIL,password:GUEST_PASS});
    if(error){s.textContent='Guest account is not initialized yet. Ask the Admin to log in once, then try again.';return}
    location.reload();
  }
  async function boot(){
    const {data:{user}}=await sb.auth.getUser();
    if(user && (user.email||'').toLowerCase()===ADMIN_EMAIL.toLowerCase()) return;
    if(user && (user.email||'').toLowerCase()===GUEST_EMAIL.toLowerCase()) return;
    if(user) await sb.auth.signOut();
    screen();
    const hash=location.hash;
    if(hash) history.replaceState(null,'',location.pathname+location.search);
  }
  boot();
})();