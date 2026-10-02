(function(){
  const sb=window.__railSupabase;
  const GUEST_EMAIL='guest@railtel-bhavnagar.com';
  const ADMIN_EMAIL='rahulbagathariya@gmail.com';

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"]/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }

  function size(n){
    if(!n)return '';
    const u=['B','KB','MB','GB'];
    let i=0,x=Number(n);
    while(x>=1024&&i<u.length-1){x/=1024;i++}
    return x.toFixed(x>=10||i===0?0:1)+' '+u[i];
  }

  function icon(name){
    const x=String(name||'').toLowerCase();
    if(x.endsWith('.pdf'))return '📕';
    if(/\.(doc|docx)$/.test(x))return '📘';
    if(/\.(xls|xlsx|csv)$/.test(x))return '📗';
    if(/\.(ppt|pptx)$/.test(x))return '📙';
    if(/\.(jpg|jpeg|png|gif|webp|svg)$/.test(x))return '🖼️';
    if(/\.(zip|rar|7z)$/.test(x))return '🗜️';
    return '📄';
  }

  async function openFile(path){
    try{
      const result=await sb.storage.from('pop-documents').createSignedUrl(path,3600);
      if(result.error||!result.data||!result.data.signedUrl){
        alert('Unable to create document link: '+(result.error&&result.error.message||'Unknown error'));
        return;
      }
      window.open(result.data.signedUrl,'_blank','noopener');
    }catch(e){
      alert('Unable to open document: '+(e.message||e));
    }
  }

  async function deleteFile(path,id,pop){
    if(!confirm('Delete this document permanently?'))return;
    const status=document.getElementById('popUploadStatus');
    if(status)status.textContent='Deleting document…';
    const a=await sb.storage.from('pop-documents').remove([path]);
    if(a.error){
      if(status)status.textContent='Delete failed: '+a.error.message;
      return;
    }
    const b=await sb.from('pop_documents').delete().eq('id',id);
    if(b.error){
      if(status)status.textContent='File removed, but database record could not be removed: '+b.error.message;
      return;
    }
    await window.details(pop);
  }

  async function load(pop,user){
    const result=await sb.from('pop_documents').select('*').eq('pop_name',pop).order('created_at',{ascending:false});
    if(result.error)throw result.error;

    const docs=result.data||[];
    const admin=(user.email||'').toLowerCase()===ADMIN_EMAIL;
    const box=document.getElementById('popDocs');

    if(!docs.length){
      box.className='empty';
      box.textContent=admin?'No documents uploaded yet.':'No documents uploaded in this PoP yet.';
      return;
    }

    box.className='';
    box.innerHTML='';

    for(const d of docs){
      const row=document.createElement('div');
      row.className='doc';

      const main=document.createElement('div');
      main.className='doc-main';

      const ico=document.createElement('div');
      ico.className='doc-icon';
      ico.textContent=icon(d.file_name);

      const info=document.createElement('div');
      const name=document.createElement('div');
      name.className='doc-name';
      name.textContent=d.file_name||'Document';

      const meta=document.createElement('div');
      meta.className='doc-meta';
      meta.textContent=(d.file_type||'File')+(d.file_size?' · '+size(d.file_size):'');

      info.appendChild(name);
      info.appendChild(meta);
      main.appendChild(ico);
      main.appendChild(info);

      const actions=document.createElement('div');
      actions.className='doc-actions';

      const open=document.createElement('button');
      open.className='btn light';
      open.textContent='Open';
      open.onclick=function(){openFile(d.storage_path)};
      actions.appendChild(open);

      if(admin){
        const del=document.createElement('button');
        del.className='btn danger';
        del.textContent='Delete';
        del.onclick=function(){deleteFile(d.storage_path,d.id,pop)};
        actions.appendChild(del);
      }

      row.appendChild(main);
      row.appendChild(actions);
      box.appendChild(row);
    }
  }

  window.details=async function(pop){
    try{
      if(!sb){
        alert('Authentication service is not ready. Please refresh.');
        return;
      }

      const sessionResult=await sb.auth.getSession();
      const user=sessionResult.data&&sessionResult.data.session&&sessionResult.data.session.user;

      if(!user){
        if(typeof window.guestLogin==='function')window.guestLogin();
        return;
      }

      const email=(user.email||'').toLowerCase();
      if(email!==GUEST_EMAIL&&email!==ADMIN_EMAIL){
        if(typeof window.guestLogin==='function')window.guestLogin();
        return;
      }

      const admin=email===ADMIN_EMAIL;
      const title=document.getElementById('title');
      const body=document.getElementById('body');
      const modal=document.getElementById('modal');

      title.textContent=pop+' · Documents';

      body.innerHTML='<div class="drive-head"><div class="drive-folder">📁</div><div><div class="drive-title">'+esc(pop)+'</div><div class="drive-sub">'+(admin?'Admin · Manage documents':'View uploaded documents')+'</div></div></div>'+
        (admin?'<div class="upload" style="margin-bottom:14px"><b>Upload documents to '+esc(pop)+'</b><br><input type="file" id="popUploadFiles" multiple style="margin-top:9px"><div class="file-types">PDF, Word, Excel, PowerPoint, images, ZIP and other file formats are supported.</div><div class="progress-wrap" id="popProgressWrap"><div class="progress-head"><span id="popProgressName">Preparing…</span><span id="popProgressPercent">0%</span></div><div class="progress-track"><div class="progress-bar" id="popProgressBar"></div></div></div><div id="popUploadStatus" class="status"></div></div>':'')+
        '<div id="popDocs" class="empty">Loading documents…</div>';

      modal.classList.add('open');

      if(admin){
        document.getElementById('popUploadFiles').onchange=async function(){
          const input=this;
          const files=Array.from(input.files||[]);
          const status=document.getElementById('popUploadStatus');
          if(!files.length)return;

          const session=(await sb.auth.getSession()).data.session;
          if(!session){status.textContent='Admin session expired. Please login again.';return}

          let done=0;
          try{
            for(const file of files){
              const wrap=document.getElementById('popProgressWrap');
              const bar=document.getElementById('popProgressBar');
              const name=document.getElementById('popProgressName');
              const pct=document.getElementById('popProgressPercent');

              wrap.classList.add('show');
              name.textContent='Uploading '+file.name;
              pct.textContent='0%';
              bar.style.width='0%';

              await window.uploadOne(session,pop,file,function(p){
                const v=((done+p/100)/files.length)*100;
                bar.style.width=v+'%';
                pct.textContent=Math.round(v)+'%';
              });
              done++;
            }

            status.className='status success';
            status.textContent=files.length===1?'File uploaded successfully.':files.length+' files uploaded successfully.';
            input.value='';
            await load(pop,user);
          }catch(e){
            status.className='status';
            status.textContent=e.message||'Upload failed.';
          }
        };
      }

      await load(pop,user);
    }catch(e){
      const box=document.getElementById('popDocs');
      if(box){
        box.className='empty';
        box.textContent='Unable to load documents: '+(e.message||'Please try again.');
      }
      console.error('PoP document error',e);
    }
  };
})();