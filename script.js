// Dados
let records = [];

// Inicializar data de hoje no formulário
document.getElementById('date').valueAsDate = new Date();

// Carregar dados do localStorage
function loadData() {
    const saved = localStorage.getItem('healthRecords');
    records = saved ? JSON.parse(saved) : [];
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('healthRecords', JSON.stringify(records));
}

// Calcular IMC
function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
}

// Trocar de aba
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'graficos') renderGraficos();
    if (tabName === 'historico') renderHistorico();
}

// Renderizar Dashboard
function renderDashboard() {
    const content = document.getElementById('dashboardContent');
    
    if (records.length === 0) {
        content.innerHTML = `
            <div class="dashboard-empty">
                <p>Ainda não há registros</p>
                <button class="btn btn-primary" onclick="switchTab('novo')">Criar Primeiro Registro</button>
            </div>
        `;
        return;
    }
    
    const lastRecord = records[records.length - 1];
    const previousRecord = records.length > 1 ? records[records.length - 2] : null;
    
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-BR');
    
    const getChange = (field) => {
        if (!previousRecord || !lastRecord[field] || !previousRecord[field]) return null;
        const diff = lastRecord[field] - previousRecord[field];
        return diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
    };
    
    const getStatusClass = (field, value) => {
        if (field === 'bmi' && value) {
            if (value < 18.5) return 'status-blue';
            if (value < 25) return 'status-green';
            if (value < 30) return 'status-yellow';
            return 'status-red';
        }
        if (field === 'systolic' && value) {
            if (value < 120) return 'status-green';
            if (value < 140) return 'status-yellow';
            return 'status-red';
        }
        if (field === 'cholesterol' && value) {
            if (value < 200) return 'status-green';
            if (value < 240) return 'status-yellow';
            return 'status-red';
        }
        if (field === 'glucose' && value) {
            if (value < 100) return 'status-green';
            if (value < 126) return 'status-yellow';
            return 'status-red';
        }
        return '';
    };
    
    let html = `<h2 class="dashboard-title">Último Check-up: ${formatDate(lastRecord.date)}</h2>`;
    
    // Seção Sinais Vitais
    html += '<h3 class="dashboard-section-title">📊 Sinais Vitais</h3>';
    html += '<div class="cards-grid">';
    
    const vitalMetrics = [
        { label: 'Peso', value: lastRecord.weight, unit: 'kg', field: 'weight', icon: '⚖️' },
        { label: 'IMC', value: lastRecord.bmi, unit: '', field: 'bmi', icon: '📏' },
        { label: 'Pressão', value: lastRecord.systolic && lastRecord.diastolic ? `${lastRecord.systolic}/${lastRecord.diastolic}` : null, unit: 'mmHg', field: 'systolic', icon: '💓' },
        { label: 'Freq. Cardíaca', value: lastRecord.heartRate, unit: 'bpm', field: 'heartRate', icon: '❤️' }
    ];
    
    vitalMetrics.forEach(metric => {
        const statusClass = getStatusClass(metric.field, metric.value);
        const change = getChange(metric.field);
        
        html += `
            <div class="card">
                <div class="card-icon">${metric.icon}</div>
                <div class="card-label">${metric.label}</div>
                <div class="card-value ${statusClass}">${metric.value ?? '—'}</div>
                <div class="card-unit">${metric.unit}</div>
                ${change ? `<div class="card-change" style="color: ${change.startsWith('+') ? '#dc2626' : '#16a34a'}">${change} desde último</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    
    // Seção Lipídios e Glicemia
    html += '<h3 class="dashboard-section-title">🧪 Lipídios e Glicemia</h3>';
    html += '<div class="cards-grid">';
    
    const lipidMetrics = [
        { label: 'Colesterol Total', value: lastRecord.cholesterol, unit: 'mg/dL', field: 'cholesterol', icon: '🧬' },
        { label: 'HDL (Bom)', value: lastRecord.hdl, unit: 'mg/dL', field: 'hdl', icon: '✅' },
        { label: 'LDL (Ruim)', value: lastRecord.ldl, unit: 'mg/dL', field: 'ldl', icon: '⚠️' },
        { label: 'Triglicerídeos', value: lastRecord.triglycerides, unit: 'mg/dL', field: 'triglycerides', icon: '📈' },
        { label: 'Glicemia', value: lastRecord.glucose, unit: 'mg/dL', field: 'glucose', icon: '🩸' }
    ];
    
    lipidMetrics.forEach(metric => {
        const statusClass = getStatusClass(metric.field, metric.value);
        const change = getChange(metric.field);
        
        html += `
            <div class="card">
                <div class="card-icon">${metric.icon}</div>
                <div class="card-label">${metric.label}</div>
                <div class="card-value ${statusClass}">${metric.value ?? '—'}</div>
                <div class="card-unit">${metric.unit}</div>
                ${change ? `<div class="card-change" style="color: ${change.startsWith('+') ? '#dc2626' : '#16a34a'}">${change} desde último</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    
    // Seção Hemograma
    html += '<h3 class="dashboard-section-title">🔴 Hemograma</h3>';
    html += '<div class="cards-grid">';
    
    const hematologyMetrics = [
        { label: 'Hemoglobina', value: lastRecord.hemoglobin, unit: 'g/dL', field: 'hemoglobin', icon: '🔴' },
        { label: 'Hematócrito', value: lastRecord.hematocrit, unit: '%', field: 'hematocrit', icon: '📊' },
        { label: 'Glóbulos Vermelhos', value: lastRecord.rbc, unit: 'milhões/µL', field: 'rbc', icon: '●' },
        { label: 'Glóbulos Brancos', value: lastRecord.wbc, unit: 'mil/µL', field: 'wbc', icon: '⚪' },
        { label: 'Plaquetas', value: lastRecord.platelets, unit: 'mil/µL', field: 'platelets', icon: '◆' }
    ];
    
    hematologyMetrics.forEach(metric => {
        const statusClass = getStatusClass(metric.field, metric.value);
        const change = getChange(metric.field);
        
        html += `
            <div class="card">
                <div class="card-icon">${metric.icon}</div>
                <div class="card-label">${metric.label}</div>
                <div class="card-value ${statusClass}">${metric.value ?? '—'}</div>
                <div class="card-unit">${metric.unit}</div>
                ${change ? `<div class="card-change" style="color: ${change.startsWith('+') ? '#dc2626' : '#16a34a'}">${change} desde último</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    
    // Seção Função Renal e Hepática
    html += '<h3 class="dashboard-section-title">🫘 Função Renal e Hepática</h3>';
    html += '<div class="cards-grid">';
    
    const organMetrics = [
        { label: 'Creatinina', value: lastRecord.creatinine, unit: 'mg/dL', field: 'creatinine', icon: '🫘' },
        { label: 'Ureia', value: lastRecord.urea, unit: 'mg/dL', field: 'urea', icon: '💧' },
        { label: 'TGO/AST', value: lastRecord.ast, unit: 'U/L', field: 'ast', icon: '🧬' },
        { label: 'TGP/ALT', value: lastRecord.alt, unit: 'U/L', field: 'alt', icon: '🧬' },
        { label: 'Bilirrubina', value: lastRecord.bilirubin, unit: 'mg/dL', field: 'bilirubin', icon: '🟡' },
        { label: 'Albumina', value: lastRecord.albumin, unit: 'g/dL', field: 'albumin', icon: '🧪' },
        { label: 'Proteína Total', value: lastRecord.totalProtein, unit: 'g/dL', field: 'totalProtein', icon: '🧬' }
    ];
    
    organMetrics.forEach(metric => {
        const statusClass = getStatusClass(metric.field, metric.value);
        const change = getChange(metric.field);
        
        html += `
            <div class="card">
                <div class="card-icon">${metric.icon}</div>
                <div class="card-label">${metric.label}</div>
                <div class="card-value ${statusClass}">${metric.value ?? '—'}</div>
                <div class="card-unit">${metric.unit}</div>
                ${change ? `<div class="card-change" style="color: ${change.startsWith('+') ? '#dc2626' : '#16a34a'}">${change} desde último</div>` : ''}
            </div>
        `;
    });
    
    if (lastRecord.notes) {
        html += `
            <div class="notes-card">
                <h3>Observações</h3>
                <p>${lastRecord.notes}</p>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

// Renderizar Gráficos
function renderGraficos() {
    const content = document.getElementById('graficosContent');
    
    if (records.length < 2) {
        content.innerHTML = '<div class="empty-state">Precisa de pelo menos 2 registros para visualizar gráficos</div>';
        return;
    }
    
    const chartConfigs = [
        { key: 'weight', label: 'Peso (kg)', color: '#10b981' },
        { key: 'bmi', label: 'IMC', color: '#3b82f6' },
        { key: 'systolic', label: 'Pressão Sistólica (mmHg)', color: '#ef4444' },
        { key: 'cholesterol', label: 'Colesterol Total (mg/dL)', color: '#f59e0b' },
        { key: 'hdl', label: 'HDL - Colesterol Bom (mg/dL)', color: '#10b981' },
        { key: 'ldl', label: 'LDL - Colesterol Ruim (mg/dL)', color: '#ef4444' },
        { key: 'triglycerides', label: 'Triglicerídeos (mg/dL)', color: '#f97316' },
        { key: 'glucose', label: 'Glicemia (mg/dL)', color: '#ec4899' },
        { key: 'hemoglobin', label: 'Hemoglobina (g/dL)', color: '#dc2626' },
        { key: 'hematocrit', label: 'Hematócrito (%)', color: '#991b1b' },
        { key: 'rbc', label: 'Glóbulos Vermelhos (milhões/µL)', color: '#b91c1c' },
        { key: 'wbc', label: 'Glóbulos Brancos (mil/µL)', color: '#7c2d12' },
        { key: 'platelets', label: 'Plaquetas (mil/µL)', color: '#92400e' },
        { key: 'creatinine', label: 'Creatinina (mg/dL)', color: '#6b7280' },
        { key: 'urea', label: 'Ureia (mg/dL)', color: '#78716c' },
        { key: 'ast', label: 'TGO/AST (U/L)', color: '#854d0e' },
        { key: 'alt', label: 'TGP/ALT (U/L)', color: '#92400e' },
        { key: 'bilirubin', label: 'Bilirrubina Total (mg/dL)', color: '#fbbf24' },
        { key: 'albumin', label: 'Albumina (g/dL)', color: '#06b6d4' },
        { key: 'totalProtein', label: 'Proteína Total (g/dL)', color: '#0891b2' },
        { key: 'heartRate', label: 'Freq. Cardíaca (bpm)', color: '#8b5cf6' }
    ];
    
    let html = '<div class="charts-container">';
    
    chartConfigs.forEach((config, idx) => {
        const chartData = records
            .filter(r => r[config.key])
            .map(r => ({
                date: new Date(r.date).toLocaleDateString('pt-BR'),
                value: r[config.key]
            }));
        
        if (chartData.length === 0) return;
        
        const canvasId = `chart-${idx}`;
        html += `
            <div class="chart-card">
                <h3>${config.label}</h3>
                <div class="chart-wrapper">
                    <canvas id="${canvasId}"></canvas>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
    
    // Renderizar gráficos após atualizar HTML
    setTimeout(() => {
        chartConfigs.forEach((config, idx) => {
            const chartData = records
                .filter(r => r[config.key])
                .map(r => ({
                    date: new Date(r.date).toLocaleDateString('pt-BR'),
                    value: r[config.key]
                }));
            
            if (chartData.length === 0) return;
            
            const ctx = document.getElementById(`chart-${idx}`);
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: chartData.map(d => d.date),
                        datasets: [{
                            label: config.label,
                            data: chartData.map(d => d.value),
                            borderColor: config.color,
                            backgroundColor: config.color + '10',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: config.color,
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }
        });
    }, 0);
}

// Renderizar Histórico
function renderHistorico() {
    const content = document.getElementById('historicoContent');
    
    if (records.length === 0) {
        content.innerHTML = '<div class="empty-state">Nenhum registro ainda</div>';
        return;
    }
    
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-BR');
    
    let html = '<div class="historico-list">';
    
    [...records].reverse().forEach(record => {
        html += `
            <div class="historico-item">
                <div class="historico-header">
                    <span class="historico-date">${formatDate(record.date)}</span>
                    <button class="historico-delete" onclick="deleteRecord(${record.id})" title="Deletar">🗑️</button>
                </div>
                <div class="historico-data">
                    ${record.weight ? `<div class="historico-data-item"><div class="historico-data-label">Peso</div><div class="historico-data-value">${record.weight} kg</div></div>` : ''}
                    ${record.bmi ? `<div class="historico-data-item"><div class="historico-data-label">IMC</div><div class="historico-data-value">${record.bmi}</div></div>` : ''}
                    ${record.systolic ? `<div class="historico-data-item"><div class="historico-data-label">Pressão</div><div class="historico-data-value">${record.systolic}/${record.diastolic}</div></div>` : ''}
                    ${record.heartRate ? `<div class="historico-data-item"><div class="historico-data-label">FC</div><div class="historico-data-value">${record.heartRate} bpm</div></div>` : ''}
                    ${record.cholesterol ? `<div class="historico-data-item"><div class="historico-data-label">Colesterol</div><div class="historico-data-value">${record.cholesterol} mg/dL</div></div>` : ''}
                    ${record.glucose ? `<div class="historico-data-item"><div class="historico-data-label">Glicemia</div><div class="historico-data-value">${record.glucose} mg/dL</div></div>` : ''}
                    ${record.hemoglobin ? `<div class="historico-data-item"><div class="historico-data-label">Hemoglobina</div><div class="historico-data-value">${record.hemoglobin} g/dL</div></div>` : ''}
                    ${record.hematocrit ? `<div class="historico-data-item"><div class="historico-data-label">Hematócrito</div><div class="historico-data-value">${record.hematocrit}%</div></div>` : ''}
                    ${record.rbc ? `<div class="historico-data-item"><div class="historico-data-label">Glób. Vermelhos</div><div class="historico-data-value">${record.rbc}</div></div>` : ''}
                    ${record.wbc ? `<div class="historico-data-item"><div class="historico-data-label">Glób. Brancos</div><div class="historico-data-value">${record.wbc}</div></div>` : ''}
                    ${record.platelets ? `<div class="historico-data-item"><div class="historico-data-label">Plaquetas</div><div class="historico-data-value">${record.platelets}</div></div>` : ''}
                    ${record.hdl ? `<div class="historico-data-item"><div class="historico-data-label">HDL</div><div class="historico-data-value">${record.hdl} mg/dL</div></div>` : ''}
                    ${record.ldl ? `<div class="historico-data-item"><div class="historico-data-label">LDL</div><div class="historico-data-value">${record.ldl} mg/dL</div></div>` : ''}
                    ${record.triglycerides ? `<div class="historico-data-item"><div class="historico-data-label">Triglicerídeos</div><div class="historico-data-value">${record.triglycerides}</div></div>` : ''}
                    ${record.creatinine ? `<div class="historico-data-item"><div class="historico-data-label">Creatinina</div><div class="historico-data-value">${record.creatinine}</div></div>` : ''}
                    ${record.urea ? `<div class="historico-data-item"><div class="historico-data-label">Ureia</div><div class="historico-data-value">${record.urea}</div></div>` : ''}
                    ${record.ast ? `<div class="historico-data-item"><div class="historico-data-label">TGO/AST</div><div class="historico-data-value">${record.ast}</div></div>` : ''}
                    ${record.alt ? `<div class="historico-data-item"><div class="historico-data-label">TGP/ALT</div><div class="historico-data-value">${record.alt}</div></div>` : ''}
                    ${record.bilirubin ? `<div class="historico-data-item"><div class="historico-data-label">Bilirrubina</div><div class="historico-data-value">${record.bilirubin}</div></div>` : ''}
                    ${record.albumin ? `<div class="historico-data-item"><div class="historico-data-label">Albumina</div><div class="historico-data-value">${record.albumin}</div></div>` : ''}
                    ${record.totalProtein ? `<div class="historico-data-item"><div class="historico-data-label">Proteína Total</div><div class="historico-data-value">${record.totalProtein}</div></div>` : ''}
                </div>
                ${record.notes ? `<div class="historico-notes">${record.notes}</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Deletar registro
function deleteRecord(id) {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
        records = records.filter(r => r.id !== id);
        saveData();
        renderHistorico();
    }
}

// Submeter formulário
document.getElementById('healthForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const weight = parseFloat(document.getElementById('weight').value) || null;
    const height = parseFloat(document.getElementById('height').value) || null;
    
    const newRecord = {
        id: Date.now(),
        date: document.getElementById('date').value,
        weight: weight,
        height: height,
        bmi: calculateBMI(weight, height),
        systolic: parseInt(document.getElementById('systolic').value) || null,
        diastolic: parseInt(document.getElementById('diastolic').value) || null,
        heartRate: parseInt(document.getElementById('heartRate').value) || null,
        cholesterol: parseInt(document.getElementById('cholesterol').value) || null,
        glucose: parseInt(document.getElementById('glucose').value) || null,
        hemoglobin: parseFloat(document.getElementById('hemoglobin').value) || null,
        hematocrit: parseFloat(document.getElementById('hematocrit').value) || null,
        rbc: parseFloat(document.getElementById('rbc').value) || null,
        wbc: parseFloat(document.getElementById('wbc').value) || null,
        platelets: parseInt(document.getElementById('platelets').value) || null,
        hdl: parseInt(document.getElementById('hdl').value) || null,
        ldl: parseInt(document.getElementById('ldl').value) || null,
        triglycerides: parseInt(document.getElementById('triglycerides').value) || null,
        creatinine: parseFloat(document.getElementById('creatinine').value) || null,
        urea: parseInt(document.getElementById('urea').value) || null,
        ast: parseInt(document.getElementById('ast').value) || null,
        alt: parseInt(document.getElementById('alt').value) || null,
        bilirubin: parseFloat(document.getElementById('bilirubin').value) || null,
        albumin: parseFloat(document.getElementById('albumin').value) || null,
        totalProtein: parseFloat(document.getElementById('totalProtein').value) || null,
        notes: document.getElementById('notes').value
    };
    
    records.push(newRecord);
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveData();
    
    // Limpar formulário
    document.getElementById('healthForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Voltar para dashboard
    switchTab('dashboard');
});

// Event listeners das abas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        switchTab(this.getAttribute('data-tab'));
    });
});

// Inicializar
loadData();
renderDashboard();
