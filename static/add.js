/* add.js — Form Add Material (statis, tanpa backend) */
const $ = s => document.querySelector(s);

function norm(s){ return (s||'').toString().trim(); }
function upper(s){ return norm(s).toUpperCase(); }
function numOrNull(v){
  if(v===undefined || v===null || v==='') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function nowISO(){
  // ISO lokal (UTC Z). Jika ingin +08:00 persis, bisa disesuaikan.
  return new Date().toISOString();
}

function readForm(){
  const f = document.getElementById('f');
  const data = {
    material: norm(f.material.value),
    short_text: norm(f.short_text.value),
    plant: upper(f.plant.value),
    storage_location: upper(f.storage_location.value),
    material_type: upper(f.material_type.value),
    po_long_text: norm(f.po_long_text.value),
    manufacturer: norm(f.manufacturer.value),
    mfr_part_number: norm(f.mfr_part_number.value),
    uom: upper(f.uom.value),
    avg_unit_price: numOrNull(f.avg_unit_price.value),
    purchasing_group: norm(f.purchasing_group.value),
    stock_type: upper(f.stock_type.value),
    stock_class: upper(f.stock_class.value),
    qualifier_code1: norm(f.qualifier_code1.value),
    qualifier_code2: norm(f.qualifier_code2.value),
    last_update: norm(f.last_update.value) || nowISO()
  };

  // Validasi minimum
  const errors = [];
  if(!data.material) errors.push('Material wajib diisi.');
  if(!data.short_text) errors.push('Short text wajib diisi.');
  if(!data.uom) errors.push('UoM wajib diisi.');

  return {data, errors};
}

function showPreview(obj){
  $('#preview').textContent = JSON.stringify(obj, null, 2);
}

function setMsg(html, cls='note'){
  const el = $('#msg');
  el.className = cls;
  el.innerHTML = html;
}

async function fetchDB(){
  const res = await fetch('../materials.json', {cache:'no-store'}).catch(()=>null);
  if(!res || !res.ok) throw new Error('Gagal ambil materials.json');
  return await res.json();
}

function downloadJSON(filename, jsonObj){
  const blob = new Blob([JSON.stringify(jsonObj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

$('#btnPreview').addEventListener('click', ()=>{
  const {data, errors} = readForm();
  if(errors.length){
    setMsg('Periksa input:<br>• ' + errors.join('<br>• '), 'err');
    return;
  }
  setMsg('Preview siap. Jika sudah benar, klik <b>Gabungkan & Unduh</b>.', 'ok');
  showPreview(data);
});

$('#btnCopy').addEventListener('click', async ()=>{
  const {data, errors} = readForm();
  if(errors.length){
    setMsg('Periksa input:<br>• ' + errors.join('<br>• '), 'err');
    return;
  }
  const text = JSON.stringify(data, null, 2);
  try{
    await navigator.clipboard.writeText(text);
    setMsg('JSON disalin ke clipboard.', 'ok');
  }catch{
    setMsg('Gagal menyalin. Salin manual dari kotak Preview.', 'warn');
  }
  showPreview(data);
});

$('#btnDownload').addEventListener('click', async ()=>{
  const replaceIfExists = document.getElementById('replaceIfExists').checked;
  const {data, errors} = readForm();
  if(errors.length){
    setMsg('Periksa input:<br>• ' + errors.join('<br>• '), 'err');
    return;
  }
  showPreview(data);
  setMsg('Mengambil materials.json...', 'note');

  try{
    let db = await fetchDB();

    const idx = db.findIndex(x => (x.material||'') === data.material);
    if(idx >= 0){
      if(replaceIfExists){
        db[idx] = data;
        setMsg(`Material ${data.material} sudah ada → <b>diganti</b>. Klik download untuk menyimpan.`, 'warn');
      } else {
        setMsg(`Material ${data.material} sudah ada. Centang opsi "Ganti data jika Material sudah ada" jika ingin overwrite.`, 'warn');
        return;
      }
    } else {
      db.push(data);
      setMsg(`Material ${data.material} ditambahkan. Klik download untuk menyimpan.`, 'ok');
    }

    // Optional: urutkan berdasarkan material
    db.sort((a,b)=> String(a.material).localeCompare(String(b.material)));

    downloadJSON('materials.json', db);
    setMsg('Berhasil menggabungkan. File <b>materials.json</b> telah diunduh. Upload file tersebut ke repo untuk memperbarui data.', 'ok');
  }catch(e){
    console.error(e);
    setMsg('Gagal memproses. Pastikan file materials.json bisa diakses dari / (root).', 'err');
  }
});
