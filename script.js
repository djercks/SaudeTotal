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
    html += '<div class="cards-grid">';
    
    const metrics = [
        { label: 'Peso', value: lastRecord.weight, unit: 'kg', field: 'weight', icon: '⚖️' },
        { label: 'IMC', value: lastRecord.bmi, unit: '', field: 'bmi', icon: '📏' },
        { label: 'Pressão', value: lastRecord.systolic && lastRecord.diastolic ? `${lastRecord.systolic}/${lastRecord.diastolic}` : null, unit: 'mmHg', field: 'systolic', icon: '💓' },
        { label: 'Freq. Cardíaca', value: lastRecord.heartRate, unit: 'bpm', field: 'heartRate', icon: '❤️' },
        { label: 'Colesterol', value: lastRecord.cholesterol, unit: 'mg/dL', field: 'cholesterol', icon: '🧬' },
        { label: 'Glicemia', value: lastRecord.glucose, unit: 'mg/dL', field: 'glucose', icon: '🩸' }
    ];
    
    metrics.forEach(metric => {
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
        { key: 'cholesterol', label: 'Colesterol (mg/dL)', color: '#f59e0b' },
        { key: 'glucose', label: 'Glicemia (mg/dL)', color: '#ec4899' },
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
