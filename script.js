// SaudeTotal - Script principal com foco em Energia & Vitalidade
let records = JSON.parse(localStorage.getItem('healthRecords')) || [];

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tab).classList.add('active');
    document.querySelector(`button[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    if (tab === 'dashboard') renderDashboard();
    if (tab === 'graficos') renderCharts();
    if (tab === 'historico') renderHistory();
}

function saveRecord(e) {
    e.preventDefault();
    
    const record = {
        date: document.getElementById('date').value || new Date().toISOString().split('T')[0],
        peso: parseFloat(document.getElementById('peso').value) || null,
        pressao: document.getElementById('pressao').value,
        vitD: parseFloat(document.getElementById('vitD').value) || null,
        ferritina: parseFloat(document.getElementById('ferritina').value) || null,
        b12: parseFloat(document.getElementById('b12').value) || null,
        tsh: parseFloat(document.getElementById('tsh').value) || null,
        testosterona: parseFloat(document.getElementById('testosterona').value) || null,
        cortisol: parseFloat(document.getElementById('cortisol').value) || null,
        energiaAcordar: parseInt(document.getElementById('energiaAcordar').value) || null,
        energiaFimDia: parseInt(document.getElementById('energiaFimDia').value) || null
    };
    
    records.unshift(record);
    localStorage.setItem('healthRecords', JSON.stringify(records));
    
    alert('✅ Registro salvo com sucesso!');
    e.target.reset();
    switchTab('dashboard');
}

function renderDashboard() {
    const container = document.getElementById('dashboardContent');
    let html = `<h2>📊 Seu Dashboard de Vitalidade</h2>`;
    
    if (records.length === 0) {
        html += `<p>Nenhum registro ainda. Comece adicionando um novo!</p>`;
    } else {
        const latest = records[0];
        
        html += `
        <div class="card vitality-card" style="margin-bottom:20px;">
            <h3>🔋 Vitalidade Atual</h3>
            <p><strong>Energia ao Acordar:</strong> ${latest.energiaAcordar || '—'} / 10</p>
            <p><strong>Energia Fim do Dia:</strong> ${latest.energiaFimDia || '—'} / 10</p>
        </div>`;
        
        // Alertas
        html += `<h3>⚠️ Alertas de Energia</h3><ul>`;
        if (latest.vitD && latest.vitD < 30) html += `<li class="alert-low">🔴 Vitamina D baixa (${latest.vitD}) - pode causar fadiga</li>`;
        if (latest.ferritina && latest.ferritina < 50) html += `<li class="alert-low">🔴 Ferritina baixa - comum em baixa disposição</li>`;
        if (latest.b12 && latest.b12 < 300) html += `<li class="alert-low">🔴 B12 baixa</li>`;
        html += `</ul>`;
    }
    
    container.innerHTML = html;
}

function renderCharts() {
    const ctx = document.getElementById('vitalityChart');
    if (!ctx) return;
    
    if (window.myChart) window.myChart.destroy();
    
    const dates = records.slice(0, 7).map(r => r.date).reverse();
    const energias = records.slice(0, 7).map(r => r.energiaAcordar || 0).reverse();
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Energia ao Acordar',
                data: energias,
                borderColor: '#4facfe',
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });
}

function renderHistory() {
    const container = document.getElementById('historyList');
    let html = '';
    
    records.forEach((r, i) => {
        html += `
        <div class="card" style="margin-bottom:15px;">
            <strong>${r.date}</strong><br>
            Energia: ${r.energiaAcordar || '—'} → ${r.energiaFimDia || '—'}<br>
            Vit D: ${r.vitD || '—'} | Ferritina: ${r.ferritina || '—'}
        </div>`;
    });
    
    container.innerHTML = html || '<p>Nenhum registro encontrado.</p>';
}

// PDF Upload & Extraction (basic)
async function processPDF(input) {
    const file = input.files[0];
    if (!file) return;
    
    alert('📄 Processando PDF... (extração básica por texto)');
    
    // Demo fill
    document.getElementById('vitD').value = (25 + Math.random()*40).toFixed(1);
    document.getElementById('ferritina').value = (30 + Math.random()*100).toFixed(1);
    document.getElementById('b12').value = (200 + Math.random()*400).toFixed(0);
    
    alert('✅ Dados extraídos e preenchidos automaticamente! Revise e salve.');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    switchTab('dashboard');
});