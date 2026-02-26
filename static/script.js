/* script.js — render list + pencarian + modal detail */

const $ = s => document.querySelector(s);

let DB = [];

async function load(){
  try{
    const res = await fetch('materials.json', { cache: 'no-store' });
    DB = await res.json();
    render(DB);
  }catch(e){
    console.error('Gagal memuat materials.json', e);
    $('#results').innerHTML = '<div class="card">Gagal memuat materials.json</div>';
  }
}

function render(list){
  const wrap = $('#results');
  wrap.innerHTML = '';
  list.forEach(row => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <h3>${row.material ?? '-'} — ${row.short_text ?? '-'}</h3>
      <div class="meta">
        <span class="badge">Plant: ${row.plant || '-'}</span>
        <span class="badge">SLoc: ${row.storage_location || '-'}</span>
        <span class="badge">UoM: ${row.uom || '-'}</span>
        <span class="badge">Avg Price: ${row.avg_unit_price ?? '-'}</span>
      </div>
      <button type="button">Detail</button>
    `;
    el.querySelector('button').addEventListener('click', () => show(row));
    wrap.appendChild(el);
  });
}

function normalize(s){ return (s||'').toString().toLowerCase(); }

$('#search').addEventListener('input', e => {
  const q = normalize(e.target.value);
  if(!q) return render(DB);
  const results = DB.filter(r =>
    normalize(r.material).includes(q) ||
    normalize(r.short_text).includes(q) ||
    normalize(r.po_long_text).includes(q) ||
    normalize(r.manufacturer).includes(q) ||
    normalize(r.mfr_part_number).includes(q)
  );
  render(results);
});

function show(row){
  const pretty = JSON.stringify(row, null, 2);
  $('#detail').textContent = pretty;
  $('#modal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

$('#closeModal').addEventListener('click', () => {
  $('#modal').classList.add('hidden');
  document.body.classList.remove('modal-open');
});

window.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    $('#modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
});

// Tutup modal saat klik area gelap (backdrop)
document.getElementById('modal').addEventListener('click', (e) => {
  const card = document.querySelector('.modal-card');
  if (!card.contains(e.target)) {
    document.getElementById('modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
});

load();
