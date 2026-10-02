(function(){
  const sb=window.__railSupabase||window.supabase;
  const GUEST_EMAIL='guest@railtel-bhavnagar.com';
  const ADMIN_EMAIL='rahulbagathariya@gmail.com';
  function escapeHtml(s){return String(s==null?'':s).replace(/[&<>\\"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'})[m]})}
  function formatSizeSafe(n){if(!n)return'';const u=['B','KB','MB','GB'];let i=0,x=Number(n);while(x>=1024&&i<u.length-1){x/=1024;i++}return x.toFixed(x>=10||i===0?0:1)+' '+u[i]}
  function fileIcon(f){const x=String(f||'').toLowerCase();if(x.endsWith('.pdf'))return'📕';if(/\\.(doc|docx)$/.test(x))return'📘';if(/\\.(xls|xlsx|csv)$/.test(x))return'📗';if(/\\.(ppt|pptx)$/.test(x))return'📙';if(/\\.(jpg|jpeg|png|gif|webp|svg)$/.test(x))return'🖼️';if(/\\.(zip|rar|7z)$/.test(x))return'🗜️';return'📄'}
  async function loadDocs(pop,user){
    const {data,error}=await sb.from('pop_documents').select('*').eq('pop_name',pop).order('created_at',{ascending:false});
    if(error)throw error;
    const docs=data||[],admin=(user.email||'').toLowerCase()===ADMIN_EMAIL;
    const box=document.getElementById('popDocs');
    if(!docs.length){box.className='empty';box.innerHTML=admin?'No documents uploaded yet.':'No documents uploaded in this PoP yet.';return}
    box.className='';
    const rows=await Promise.all(docs.map(async function(d){
      const file=escapeHtml(d.file_name||'Document'),type=escapeHtml(d.file_type||'File'),size=d.file_size?formatSizeSafe(d.file_size):'';
      let href='#';
      try{
        const s=await sb.storage.from('pop-documents').createSignedUrl(d.storage_path,3600);
        if(!s.error&&s.data&&s.data.signedUrl)href=s.data.signedUrl;
      }catch(e){console.error('Signed URL error',e)}
      const del=admin?'<button class="btn danger" onclick="deleteDoc(\\''+encodeURIComponent(d.storage_path)+'\\',\\''+escapeHtml(d.id)+'\\');setTimeout(()=>details(\\''+escapeHtml(pop)+'\\'),700)">Delete</button>':'';
      return '<div class="doc"><div class="doc-main"><div class="doc-icon">'+fileIcon(d.file_name)+'</div><div><div class="doc-name">'+file+'</div><div class="doc-meta">'+type+(size?' · '+size:'')+'</div></div></div><div class="doc-actions">'+(href!=='#'?'<a class="btn light" href="'+href.replace(/"/g,'%22')+'" target="_blank" rel="noopener">Open</a>':'<span class="doc-meta">File unavailable</span>')+del+'</div></div>';
    }));
    box.innerHTML=rows.join('');
  }
  window.details=async function(pop){
    let user=null;try{user=(await sb.auth.getUser()).data.user}catch(e){}
    if(!user){showLoginError();return}
    const email=(user.email||'').toLowerCase();
    if(email!==GUEST_EMAIL&&email!==ADMIN_EMAIL){showLoginError();return}
    const isAdmin=email===ADMIN_EMAIL;
    const title=document.getElementById('title'),body=document.getElementById('body'),modal=document.getElementById('modal');
    if(!title||!body||!modal)return;
    title.textContent=pop+' · Documents';
    body.innerHTML='<div class="drive-head"><div class="drive-folder">📁</div><div><div class="drive-title">'+escapeHtml(pop)+'</div><div class="drive-sub">'+(isAdmin?'Admin · Manage documents':'View uploaded documents')+'</div></div></div>'+
      (isAdmin?'<div class="upload" style="margin-bottom:14px"><b>Upload documents to '+escapeHtml(pop)+'</b><br><input type="file" id="popUploadFiles" accept="*/*" multiple style="margin-top:9px"><div class="file-types">All common file formats are supported.</div><div class="progress-wrap" id="popProgressWrap"><div class="progress-head"><span id="popProgressName">Preparing…</span><span id="popProgressPercent">0%</span></div><div class="progress-track"><div class="progress-bar" id="popProgressBar"></div></div></div><div id="popUploadStatus" class="status"></div></div>':'')+
      '<div id="popDocs" class="empty">Loading documents…</div>';
    modal.classList.add('open');
    if(isAdmin){
      document.getElementById('popUploadFiles').onchange=async function(){
        const input=this,files=Array.from(input.files||[]),status=document.getElementById('popUploadStatus');
        if(!files.length)return;
        const session=(await sb.auth.getSession()).data.session;
        if(!session){status.textContent='Admin session expired. Please login again.';return}
        let done=0;status.className='status';status.textContent='Starting upload…';
        try{
          for(const file of files){
            const wrap=document.getElementById('popProgressWrap'),bar=document.getElementById('popProgressBar'),name=document.getElementById('popProgressName'),pct=document.getElementById('popProgressPercent');
            wrap.classList.add('show');name.textContent='Uploading '+file.name;pct.textContent='0%';bar.style.width='0%';
            await uploadOne(session,pop,file,p=>{const v=((done+p/100)/files.length)*100;bar.style.width=v+'%';pct.textContent=Math.round(v)+'%';});
            done++;
          }
          status.className='status success';status.textContent=files.length===1?'File uploaded successfully.':files.length+' files uploaded successfully.';
          input.value='';await loadDocs(pop,user);
        }catch(e){status.className='status';status.textContent=e.message||'Upload failed.'}
      };
    }
    try{await loadDocs(pop,user)}catch(e){const box=document.getElementById('popDocs');if(box)box.innerHTML='<div class="empty">Unable to load documents: '+escapeHtml(e.message||'Please try again.')+'</div>';console.error('PoP folder load error',e)}
  };
  function showLoginError(){if(typeof window.guestLogin==='function')window.guestLogin();}
})();