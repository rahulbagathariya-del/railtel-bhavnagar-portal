(function(){
  // A new page/tab open must start at the login screen. Keep the session only
  // across an in-page reload after a successful login.
  try{
    const nav=performance.getEntriesByType('navigation')[0];
    const isNewOpen=nav && nav.type==='navigate';
    if(isNewOpen){
      window.supabase.auth.signOut({scope:'local'}).catch(function(){});
      try{sessionStorage.removeItem('rail_guest');}catch(e){}
      if(location.hash){history.replaceState(null,'',location.pathname+location.search);}
      setTimeout(function(){location.reload();},50);
      return;
    }
  }catch(e){}

  function fix(){
    const style=document.getElementById('authGateCss');
    if(style) style.textContent=style.textContent.replace(/body\{display:none!important\}/g,'body.auth-locked{display:none!important}');
    const gate=document.getElementById('authGate');
    if(gate) document.body.classList.remove('auth-locked');
  }

  try{ if(sessionStorage.getItem('rail_guest')==='1') window.__railGuestAuthenticated=true; }catch(e){}

  window.details=async function(pop){
    const guestOk=window.__railGuestAuthenticated===true || sessionStorage.getItem('rail_guest')==='1';
    let adminOk=false;
    try{
      const r=await window.supabase.auth.getUser();
      adminOk=!!(r.data&&r.data.user);
    }catch(e){}
    if(!guestOk && !adminOk){
      if(typeof window.guestLogin==='function') window.guestLogin();
      return;
    }
    const title=document.getElementById('title'),body=document.getElementById('body'),modal=document.getElementById('modal');
    if(!title||!body||!modal)return;
    title.textContent=pop+' · Documents';
    body.innerHTML='<div class="drive-head"><div class="drive-folder">📁</div><div><div class="drive-title">'+escapeHtml(pop)+'</div><div class="drive-sub">Uploaded documents</div></div></div><div id="popDocs" class="empty">Loading documents…</div>';
    modal.classList.add('open');
    try{
      const {data,error}=await window.supabase.from('pop_documents').select('*').eq('pop_name',pop).order('created_at',{ascending:false});
      if(error)throw error;
      const docs=data||[];
      const box=document.getElementById('popDocs');
      if(!docs.length){box.innerHTML='<div class="empty">No documents uploaded in this PoP yet.</div>';return;}
      box.className='';
      box.innerHTML=docs.map(function(d){
        const file=escapeHtml(d.file_name||'Document');
        const type=escapeHtml(d.file_type||'File');
        const size=d.file_size?formatSizeSafe(d.file_size):'';
        let href='#';
        try{href=window.supabase.storage.from('pop-documents').getPublicUrl(d.storage_path).data.publicUrl||'#'}catch(e){}
        return '<div class="doc"><div class="doc-main"><div class="doc-icon">'+fileIcon(d.file_name)+'</div><div><div class="doc-name">'+file+'</div><div class="doc-meta">'+type+(size?' · '+size:'')+'</div></div></div><div class="doc-actions">'+(href!=='#'?'<a class="btn light" href="'+href.replace(/"/g,'%22')+'" target="_blank" rel="noopener">Open</a>':'')+'</div></div>';
      }).join('');
    }catch(e){
      const box=document.getElementById('popDocs');
      if(box)box.innerHTML='<div class="empty">Unable to load documents right now. Please try again.</div>';
      console.error('PoP folder load error',e);
    }
  };

  function escapeHtml(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'})[m]})}
  function formatSizeSafe(n){if(!n)return'';const u=['B','KB','MB','GB'];let i=0,x=Number(n);while(x>=1024&&i<u.length-1){x/=1024;i++}return x.toFixed(x>=10||i===0?0:1)+' '+u[i]}
  function fileIcon(f){const x=String(f||'').toLowerCase();if(x.endsWith('.pdf'))return'📕';if(/\.(doc|docx)$/.test(x))return'📘';if(/\.(xls|xlsx|csv)$/.test(x))return'📗';if(/\.(ppt|pptx)$/.test(x))return'📙';if(/\.(jpg|jpeg|png|gif|webp|svg)$/.test(x))return'🖼️';if(/\.(zip|rar|7z)$/.test(x))return'🗜️';return'📄'}

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fix); else fix();
  setTimeout(fix,50);
  setTimeout(fix,250);
})();