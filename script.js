// SaudeTotal - Script completo com Vitalidade e PDF

let registros = JSON.parse(localStorage.getItem('saudeRegistros')) || [];

// Tab navigation
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(tab).classList.add('active');
  
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'graficos') loadGraficos();
  if (tab === 'historico') loadHistorico();
}

// PDF Upload
function uploadExamPDF() {
  document.getElementById('pdfUpload').click();
}

async function processPDF(input) {
  const file = input.files[0];
  if (!file) return;
  
  const loading = document.createElement('div');
  loading.textContent = 'Processando PDF...';
  document.body.appendChild(loading);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    
    // Extração com regex
    const data = {
      vitaminaD: extractValue(fullText, /vitamina\s*d.*?(\d+[.,]?\d*)/i),
      ferritina: extractValue(fullText, /ferritina.*?(\d+[.,]?\d*)/i),
      b12: extractValue(fullText, /b12|b12.*?(\d+[.,]?\d*)/i),
      tsh: extractValue(fullText, /tsh.*?(\d+[.,]?\d*)/i),
      testosterona: extractValue(fullText, /testosterona.*?(\d+[.,]?\d*)/i),
    };
    
    // Preencher formulário
    if (data.vitaminaD) document.getElementById('vitaminaD').value = data.vitaminaD;
    if (data.ferritina) document.getElementById('ferritina').value = data.ferritina;
    if (data.b12) document.getElementById('b12').value = data.b12;
    if (data.tsh) document.getElementById('tsh').value = data.tsh;
    if (data.testosterona) document.getElementById('testosterona').value = data.testosterona;
    
    alert('✅ Extração concluída! Verifique e ajuste os valores.');
  } catch (e) {
    alert('Erro ao processar PDF: ' + e.message);
  } finally {
    loading.remove();
  }
}

function extractValue(text, regex) {
  const match = text.match(regex);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

// Form submit
document.getElementById('healthForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = {
    date: document.getElementById('date').value || new Date().toISOString().split('T')[0],
    energiaAcordar: parseInt(document.getElementById('energiaAcordar')?.value || 5),
    energiaMeioDia: parseInt(document.getElementById('energiaMeioDia')?.value || 5),
    energiaFimDia: parseInt(document.getElementById('energiaFimDia')?.value || 5),
    vitaminaD: parseFloat(document.getElementById('vitaminaD')?.value) || null,
    ferritina: parseFloat(document.getElementById('ferritina')?.value) || null,
    b12: parseFloat(document.getElementById('b12')?.value) || null,
    tsh: parseFloat(document.getElementById('tsh')?.value) || null,
    testosterona: parseFloat(document.getElementById('testosterona')?.value) || null,
    cortisol: parseFloat(document.getElementById('cortisol')?.value) || null,
    observacoes: document.getElementById('observacoes')?.value || ''
  };
  
  registros.unshift(formData);
  localStorage.setItem('saudeRegistros', JSON.stringify(registros));
  
  alert('Registro salvo com sucesso!');
  switchTab('dashboard');
  this.reset();
});

// Load functions
function loadDashboard() {
  const content = document.getElementById('dashboardContent');
  if (registros.length === 0) {
    content.innerHTML = `
      <h2>📊 Dashboard - Vitalidade</h2>
      <div class="vitality-card">
        <h3>🔋 Sua Vitalidade Atual</h3>
        <p>Preencha seu primeiro registro para ver scores e alertas de energia.</p>
      </div>
    `;
    return;
  }

  const ultimo = registros[0];
  let alertas = '';

  if (ultimo.vitaminaD && ultimo.vitaminaD < 30) alertas += `<p style="color:orange">⚠️ Vitamina D baixa (${ultimo.vitaminaD}) → pode explicar cansaço</p>`;
  if (ultimo.ferritina && ultimo.ferritina < 50) alertas += `<p style="color:orange">⚠️ Ferritina baixa (${ultimo.ferritina}) → energia baixa</p>`;
  if (ultimo.testosterona && ultimo.testosterona < 8) alertas += `<p style="color:orange">⚠️ Testosterona Livre baixa</p>`;

  content.innerHTML = `
    <h2>📊 Dashboard - Vitalidade</h2>
    <div class="vitality-card">
      <h3>🔋 Último Registro (${ultimo.date})</h3>
      <p><strong>Energia ao acordar:</strong> ${ultimo.energiaAcordar}/10</p>
      <p><strong>Meio-dia:</strong> ${ultimo.energiaMeioDia}/10</p>
      <p><strong>Fim do dia:</strong> ${ultimo.energiaFimDia}/10</p>
      <hr>
      <p><strong>Vit D:</strong> ${ultimo.vitaminaD || '—'}</p>
      <p><strong>Ferritina:</strong> ${ultimo.ferritina || '—'}</p>
      <p><strong>B12:</strong> ${ultimo.b12 || '—'}</p>
      <p><strong>Testosterona Livre:</strong> ${ultimo.testosterona || '—'}</p>
      <p><strong>Cortisol:</strong> ${ultimo.cortisol || '—'}</p>
      ${alertas}
    </div>
  `;
}

function loadGraficos() {
  document.getElementById('graficosContent').innerHTML = '<h2>📈 Gráficos de Evolução em breve</h2>';
}

function loadHistorico() {
  const content = document.getElementById('historicoContent');
  let html = `<h2>📋 Histórico Completo - Energia &amp; Vitalidade</h2>`;

  if (registros.length === 0) {
    html += `<p>Nenhum registro ainda.</p>`;
  } else {
    registros.forEach((reg, index) => {
      html += `
        <div class="registro-item" style="background:white; padding:15px; margin:10px 0; border-radius:8px; border-left:5px solid #4a90e2;">
          <strong>${reg.date}</strong><br>
          Energia: Acordar ${reg.energiaAcordar} | Meio ${reg.energiaMeioDia} | Fim ${reg.energiaFimDia}<br>
          Vit D: ${reg.vitaminaD || '—'} | Ferritina: ${reg.ferritina || '—'} | B12: ${reg.b12 || '—'}<br>
          Testosterona Livre: ${reg.testosterona || '—'} | Cortisol: ${reg.cortisol || '—'}
          ${reg.observacoes ? `<br><small>Obs: ${reg.observacoes}</small>` : ''}
        </div>
      `;
    });
  }

  content.innerHTML = html;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
  
  loadDashboard();
});

console.log('✅ SaudeTotal carregado com sucesso!');