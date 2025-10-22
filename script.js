// Forçar fallback com cidade com dados (São Paulo)
const LAT = -23.55;
const LON = -46.63;


// ====== Gráficos por estação (simulados) ======
const ctxPM25 = document.getElementById('pm25PorEstacao');
const ctxPM10 = document.getElementById('pm10PorEstacao');

new Chart(ctxPM25, {
  type: 'bar',
  data: {
    labels: ['Centro (sim.)', 'Zona Norte (sim.)', 'Zona Sul (sim.)'],
    datasets: [{
      label: 'PM2.5 (µg/m³)',
      data: [22, 18, 26],
      borderWidth: 0,
      backgroundColor: 'rgba(32, 227, 255, 0.6)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#cfe8f1' } }, y: { ticks: { color: '#cfe8f1' } } }
  }
});

new Chart(ctxPM10, {
  type: 'bar',
  data: {
    labels: ['Centro (sim.)', 'Zona Norte (sim.)', 'Zona Sul (sim.)'],
    datasets: [{
      label: 'PM10 (µg/m³)',
      data: [45, 34, 52],
      borderWidth: 0,
      backgroundColor: 'rgba(94, 234, 212, 0.6)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#cfe8f1' } }, y: { ticks: { color: '#cfe8f1' } } }
  }
});

// ====== Clima atual (Open‑Meteo — requisição real) ======
async function carregarClimaAtual(){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature&timezone=auto`;
    const r = await fetch(url);
    const j = await r.json();
    const c = j.current;
    document.getElementById('temp').textContent = `${c.temperature_2m?.toFixed(1)}ºC`;
    document.getElementById('sensacao').textContent = `${c.apparent_temperature?.toFixed(1)}ºC`;
    document.getElementById('umidade').textContent = `${c.relative_humidity_2m}%`;
    document.getElementById('vento').textContent = `${c.wind_speed_10m?.toFixed(1)} km/h`;
  }catch(e){
    document.getElementById('climaAtual').insertAdjacentHTML('beforeend', '<div class="pill">Falha ao carregar clima</div>');
    console.error('Erro clima:', e);
  }
}
carregarClimaAtual();

// ====== Histórico da Qualidade do Ar (Open‑Meteo Air Quality — real) ======
async function carregarHistoricoAirQuality(){
  const anos = [2019, 2020, 2021, 2022, 2023, 2024];
  const mediasPM25 = [];
  const mediasPM10 = [];

  async function mediaAnual(ano, campo){
    const start = `${ano}-01-01`;
    const end = `${ano}-12-31`;
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&start_date=${start}&end_date=${end}&hourly=pm10,pm2_5&timezone=auto`;
    const r = await fetch(url);
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j = await r.json();
    const arr = j.hourly?.[campo];
    if(!arr || !arr.length) throw new Error('Sem dados para '+campo+' '+ano);
    const valido = arr.filter(v => typeof v === 'number' && isFinite(v));
    const sum = valido.reduce((a,b)=>a+b,0);
    return sum/valido.length;
  }

  let falhou = false;
  for(const ano of anos){
    try{
      const m25 = await mediaAnual(ano, 'pm2_5');
      const m10 = await mediaAnual(ano, 'pm10');
      mediasPM25.push(Number(m25.toFixed(2)));
      mediasPM10.push(Number(m10.toFixed(2)));
    }catch(e){
      console.warn('Falha no ano', ano, e);
      falhou = true;
      // fallback (simulado) se falhar aquele ano
      mediasPM25.push(22 + Math.max(0, 2024-ano));
      mediasPM10.push(44 + Math.max(0, 2024-ano));
    }
  }

  const ctx = document.getElementById('graficoHistorico');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: anos.map(String),
      datasets: [
        {
          label: 'PM2.5 (µg/m³)',
          data: mediasPM25,
          borderColor: '#20e3ff',
          backgroundColor: 'rgba(32,227,255,.15)',
          fill: true,
          tension: .25
        },
        {
          label: 'PM10 (µg/m³)',
          data: mediasPM10,
          borderColor: '#5eead4',
          backgroundColor: 'rgba(94,234,212,.12)',
          fill: true,
          tension: .25
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#cfe8f1' } },
        title: { display: true, text: 'Evolução anual • Guarulhos/SP', color: '#e6e8ea' },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue} µg/m³` } }
      },
      scales: {
        x: { ticks: { color: '#cfe8f1' }, grid: { color: 'rgba(255,255,255,.06)'} },
        y: { ticks: { color: '#cfe8f1' }, grid: { color: 'rgba(255,255,255,.06)'}, title: { display:true, text:'µg/m³', color:'#9aa4af' } }
      }
    }
  });

  if(falhou){
    const note = document.createElement('p');
    note.className = 'sub center';
    note.textContent = 'Aviso: Alguns anos usaram valores de fallback por indisponibilidade temporária da API.';
    document.getElementById('historico').appendChild(note);
  }
}
carregarHistoricoAirQuality();

// ========= Conversa & Problemas (localStorage) =========
const CHAVE_CONVERSA = 'ci1000_conversa';

function carregarConversa(){
  const area = document.getElementById('listaConversa');
  area.innerHTML = '';
  const itens = JSON.parse(localStorage.getItem(CHAVE_CONVERSA) || '[]');
  itens.forEach(it => {
    const div = document.createElement('div');
    div.className = 'item-msg';
    div.innerHTML = `<div class="meta">${it.data} • ${it.tema}${it.nome ? ' • '+it.nome : ''}</div><div>${it.texto}</div>`;
    area.appendChild(div);
  });
}

document.getElementById('formConversa')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const tema = document.getElementById('tema').value;
  const texto = document.getElementById('mensagem').value.trim();
  if(!texto) return;
  const itens = JSON.parse(localStorage.getItem(CHAVE_CONVERSA) || '[]');
  itens.unshift({
    nome, tema, texto,
    data: new Date().toLocaleString()
  });
  localStorage.setItem(CHAVE_CONVERSA, JSON.stringify(itens));
  document.getElementById('mensagem').value='';
  carregarConversa();
});
carregarConversa();

// ========= Transparência de Impostos (API local /data/transparencia.json) =========
// Observação: ao abrir direto com file://, alguns navegadores bloqueiam fetch local.
// Use um servidor local (ex.: VS Code Live Server) para evitar CORS.

// Forçar o uso da API local sempre (simulada)
carregarImpostosLocal();

async function carregarImpostosLocal(){
  try{
    const r = await fetch('data/transparencia.json');
    const j = await r.json();
    const labels = j.meses;
    const arrec = j.arrecadacao;
    const ctx = document.getElementById('graficoImpostos');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Arrecadação (R$ milhões)',
          data: arrec,
          borderColor: '#f0abfc',
          backgroundColor: 'rgba(240,171,252,.12)',
          fill: true,
          tension: .25
        }]
      },
      options: {
        responsive:true,
        plugins:{
          legend:{position:'bottom', labels:{color:'#cfe8f1'}},
          title:{display:true, text:'Arrecadação Municipal (simulada)', color:'#e6e8ea'}
        },
        scales:{
          x:{ticks:{color:'#cfe8f1'}},
          y:{ticks:{color:'#cfe8f1'}, grid:{color:'rgba(255,255,255,.06)'}, title:{display:true, text:'R$ (milhões)', color:'#9aa4af'}}
        }
      }
    });

    // Anual (simulado a partir do mensal)
    const anual = arrec.reduce((acc,v,i)=>{
      const ano = 2024; // exemplo
      acc[ano] = (acc[ano]||0) + v;
      return acc;
    }, {});
    const ctx2 = document.getElementById('graficoImpostosAnual');
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: Object.keys(anual),
        datasets: [{ label:'Total anual (R$ mi)', data:Object.values(anual), backgroundColor:'rgba(94,234,212,.4)', borderColor:'#5eead4', borderWidth:2 }]
      },
      options: { responsive:true, plugins:{legend:{position:'bottom', labels:{color:'#cfe8f1'}}, title:{display:true, text:'Total Anual (fallback)', color:'#e6e8ea'}}, scales:{x:{ticks:{color:'#cfe8f1'}}, y:{ticks:{color:'#cfe8f1'}}} }
    });

    const ctx3 = document.getElementById('graficoImpostosBreakdown');
    new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: ['IPTU','ISS','Outros'],
        datasets: [{ data: [45, 35, 20], backgroundColor: ['#60a5fa','#a78bfa','#f0abfc'] }]
      },
      options: { responsive:true, plugins:{legend:{position:'bottom', labels:{color:'#cfe8f1'}}, title:{display:true, text:'Breakdown por Tributo (fallback)', color:'#e6e8ea'}} }
    });
  }catch(e){
    console.error('Falha também no fallback:', e);
  }
}


function setApiStatus(ok){ const el=document.getElementById('apiStatus'); if(!el) return; el.textContent = ok? '✅ API conectada — dados reais' : '⚠️ Offline — dados locais'; el.style.background = ok? 'rgba(94,234,212,.12)' : 'rgba(244,63,94,.15)'; el.style.borderColor = ok? '#2bb39a' : '#f43f5e'; }

// ======== API Real: Prefeitura de São Paulo (apilib) ========
async function carregarImpostos(){
  try{
    let ok=true; let r; try{ r = await fetch('https://apilib.prefeitura.sp.gov.br/api/receita/arrecadacao'); }catch(e){ ok=false; setApiStatus(false); throw e; }
    const data = await r.json(); setApiStatus(true);

    // Normalizar nomes de meses em ordem
    const ordemMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const idxMes = m => ordemMeses.indexOf(m);

    // Filtrar últimos anos (2019-2024)
    const alvoAnos = new Set([2019,2020,2021,2022,2023,2024]);

    // Agregar mensal (total por mês do ano corrente mais recente disponível)
    const anosDisponiveis = Array.from(new Set(data.map(d => d.ano))).sort();
    const anoMaisRecente = anosDisponiveis[anosDisponiveis.length - 1];
    const mensal = Array(12).fill(0);
    data.filter(d => d.ano === anoMaisRecente).forEach(d => {
      const i = idxMes(d.mes);
      if(i>=0) mensal[i] += (d.valor || 0) / 1_000_000;
    });

    // Gráfico mensal (ano mais recente)
    const ctx = document.getElementById('graficoImpostos');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ordemMeses,
        datasets: [{
          label: `Arrecadação ${anoMaisRecente} (R$ milhões)`,
          data: mensal,
          backgroundColor: 'rgba(32,227,255,.35)',
          borderColor: '#20e3ff',
          borderWidth: 2
        }]
      },
      options: {
        responsive:true,
        plugins:{
          legend:{position:'bottom', labels:{color:'#cfe8f1'}},
          title:{display:true, text:`Arrecadação Municipal - São Paulo (${anoMaisRecente})`, color:'#e6e8ea'}
        },
        scales:{ x:{ticks:{color:'#cfe8f1'}}, y:{ticks:{color:'#cfe8f1'}, title:{display:true, text:'R$ milhões', color:'#9aa4af'}} }
      }
    });

    // Agregar anual (2019–2024)
    const anualMap = {};
    data.forEach(d => {
      if(alvoAnos.has(d.ano)){
        anualMap[d.ano] = (anualMap[d.ano] || 0) + (d.valor || 0);
      }
    });
    const anos = Object.keys(anualMap).map(a=>+a).sort((a,b)=>a-b);
    const totaisMi = anos.map(a => anualMap[a] / 1_000_000);

    const ctx2 = document.getElementById('graficoImpostosAnual');
    new Chart(ctx2, {
      type: 'line',
      data: {
        labels: anos.map(String),
        datasets: [{
          label: 'Total anual (R$ milhões)',
          data: totaisMi,
          borderColor: '#5eead4',
          backgroundColor: 'rgba(94,234,212,.12)',
          fill: true,
          tension: .25
        }]
      },
      options: {
        responsive:true,
        plugins:{legend:{position:'bottom', labels:{color:'#cfe8f1'}}, title:{display:true, text:'Evolução 2019–2024', color:'#e6e8ea'}},
        scales:{ x:{ticks:{color:'#cfe8f1'}}, y:{ticks:{color:'#cfe8f1'}} }
      }
    });

    // Breakdown por tributo (IPTU, ISS, Outros) no ano mais recente
    const porReceita = {};
    data.filter(d => d.ano === anoMaisRecente).forEach(d => {
      const key = (d.receita || 'Outros').toUpperCase();
      porReceita[key] = (porReceita[key] || 0) + (d.valor || 0);
    });

    const iptu = porReceita['IPTU'] || 0;
    const iss  = porReceita['ISS']  || 0;
    const outros = Object.keys(porReceita).filter(k => k!=='IPTU' && k!=='ISS').reduce((acc,k)=>acc+porReceita[k],0);

    const ctx3 = document.getElementById('graficoImpostosBreakdown');
    new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: ['IPTU','ISS','Outros'],
        datasets: [{ data: [iptu, iss, outros].map(v=>v/1_000_000), backgroundColor: ['#60a5fa','#a78bfa','#f0abfc'] }]
      },
      options: {
        responsive:true,
        plugins:{legend:{position:'bottom', labels:{color:'#cfe8f1'}}, title:{display:true, text:`Participação por tributo (${anoMaisRecente})`, color:'#e6e8ea'}},
        cutout: '55%'
      }
    });

  }catch(e){
    console.error('Erro ao carregar API real, usando fallback local:', e);
    carregarImpostosLocal();
  }
}
carregarImpostos();
