(function(){
  const sb=window.__railSupabase||window.supabase;
  const GUEST_EMAIL='guest@railtel-bhavnagar.com';
  function escapeHtml(s){return String(s==null?'':s).replace(/[&<>\\"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'})[m]})}
  function formatSizeSafe(n){if(!n)return'';const u=['B','KB','MB','GB'];let i=0,x=Number(n);while(x>=1024&&i<u.length-1){x/=1024;i++}return x.toFixed(x>=10||i===0?0:1)+' '+u[i]}
  function fileIcon(f){const x=String(f||'').toLowerCase();if(x.endsWith('.pdf'))return'📕';if(/\\.(doc|docx)$/.test(x))return'📘';if(/\\.(xls|xlsx|csv)$/.test(x))return'📗';if(/\\.(ppt|pptx)$/.test(x))return'📙';if(/\\.(jpg|jpeg|png|gif|webp|svg)$/.test(x))return'🖼️';if(/\\.(zip|rar|7z)$/.test(x))return'🗜️';return'📄'}
  window.details=async function(pop){
    let user=null; try{user=(await sb.auth.getUser()).data.user}catch(e){}
    if(!user){showLoginError();return}
    const email=(user.email||'').toLowerCase();
    if(email!==GUEST_EMAIL && email!=='rahulbagathariya@gmail.com'){showLoginError();return}
    const title=document.getElementById('title'),body=document.getElementById('body'),modal=document.getElementById('modal');
    if(!title||!body||!modal)return;
    title.textContent=pop+' · Documents';
    body.innerHTML='<div class="drive-head"><div class="drive-folder">📁</div><div><div class="drive-title">'+escapeHtml(pop)+'</div><div class="drive-sub">Uploaded documents</div></div></div><div id="popDocs" class="empty">Loading documents…</div>';
    modal.classList.add('open');
    try{
      const {data,error}=await sb.from('pop_documents').select('*').eq('pop_name',pop).order('created_at',{ascending:false});
      if(error)throw error;
      const docs=data||[]; const box=document.getElementById('popDocs');
      if(!docs.length){box.innerHTML='<div class="empty">No documents uploaded in this PoP yet.</div>';return}
      box.className='';
      box.innerHTML=docs.map(function(d){
        const file=escapeHtml(d.file_name||'Document'),type=escapeHtml(d.file_type||'File'),size=d.file_size?formatSizeSafe(d.file_size):'';
        let href='#'; try{href=sb.storage.from('pop-documents').getPublicUrl(d.storage_path).data.publicUrl||'#'}catch(e){}
        return '<div class="doc"><div class="doc-main"><div class="doc-icon">'+fileIcon(d.file_name)+'</div><div><div class="doc-name">'+file+'</div><div class="doc-meta">'+type+(size?' · '+size:'')+'</div></div></div><div class="doc-actions">'+(href!=='#'?'<a class="btn light" href="'+href.replace(/"/g,'%22')+'" target="_blank" rel="noopener">Open</a>':'')+'</div></div>';
      }).join('');
    }catch(e){
      const box=document.getElementById('popDocs'); if(box)box.innerHTML='<div class="empty">Unable to load documents: '+escapeHtml(e.message||'Please try again.')+'</div>'; console.error('PoP folder load error',e);
    }
  };
  function showLoginError(){if(typeof window.guestLogin==='function')window.guestLogin();}
})();