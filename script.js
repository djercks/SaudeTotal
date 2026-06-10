// ===================================
// VITALIDADE 360 - Sistema Profissional
// Análise de Energia e Clareza Mental
// ===================================

let registros = JSON.parse(localStorage.getItem('saudeRegistros')) || [];

// Referências clínicas e limites de alerta
const REFERENCIAS = {
    tsh: { min: 0.4, max: 4, normal_min: 0.8, normal_max: 3.5, unit: 'mUI/L' },
    vitaminaD: { min: 30, max: 100, optimal: 40, unit: 'ng/mL' },
    ferritina: { min: 50, max: 200, optimal: 100, unit: 'ng/mL' },
    b12: { min: 200, max: 900, optimal: 500, unit: 'pg/mL' },
    glicose: { min: 70, max: 100, unit: 'mg/dL' },
    hemoglobina: { min: 13, max: 17, unit: 'g/dL' },
    magnesio: { min: 1.7, max: 2.2, unit: 'mg/dL' },
    zinco: { min: 70, max: 150, unit: 'µg/dL' },
    testosterona: { min: 8, max: 27, unit: 'ng/dL' },
    cortisol: { min: 5, max: 23, unit: 'µg/dL' },
    homocisteina: { min: 0, max: 10, unit: 'µmol/L' },
    pcr: { min: 0, max: 3, unit: 'mg/L' }
};

// Configurar date input com data atual
document.getElementById('date').valueAsDate = new Date();

// Atualizar valores de range em tempo real
document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', function() {
        const value = this.parentElement.querySelector('.range-value');
        if (value) value.textContent = this.value;
    });
});

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

// ===================================
// ANÁLISE INTELIGENTE DE EXAMES
// ===================================

function analisarValor(campo, valor) {
    if (!valor || !REFERENCIAS[campo]) return { status: 'neutro', mensagem: '' };
    
    const ref = REFERENCIAS[campo];
    const min = ref.min;
    const max = ref.max;
    
    // Lógica de status por campo
    if (campo === 'vitaminaD') {
        if (valor < 20) return { status: 'crítico', mensagem: '🔴 CRÍTICO: Deficiência severa' };
        if (valor < 30) return { status: 'crítico', mensagem: '🔴 Deficiência (fadiga garantida)' };
        if (valor < 40) return { status: 'warning', mensagem: '🟡 Baixo (melhorar)' };
        if (valor >= 40 && valor <= 60) return { status: 'bom', mensagem: '✅ Ótimo' };
        if (valor > 100) return { status: 'warning', mensagem: '🟡 Muito alto' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'ferritina') {
        if (valor < 30) return { status: 'crítico', mensagem: '🔴 CRÍTICO: Anemia (fadiga extrema)' };
        if (valor < 50) return { status: 'warning', mensagem: '🟡 Baixo (cansaço)' };
        if (valor >= 50 && valor <= 150) return { status: 'bom', mensagem: '✅ Ótimo' };
        if (valor > 300) return { status: 'warning', mensagem: '🟡 Muito alto' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'b12') {
        if (valor < 200) return { status: 'crítico', mensagem: '🔴 CRÍTICO: Deficiência (confusão mental)' };
        if (valor < 300) return { status: 'warning', mensagem: '🟡 Baixo (fadiga, falta de memória)' };
        if (valor >= 400 && valor <= 800) return { status: 'bom', mensagem: '✅ Ótimo' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'tsh') {
        if (valor < 0.4 || valor > 4) return { status: 'warning', mensagem: '🟡 Fora do normal (tireoide)' };
        if (valor < 0.8 || valor > 3.5) return { status: 'warning', mensagem: '🟡 Subótimo' };
        return { status: 'bom', mensagem: '✅ Ótimo' };
    }
    
    if (campo === 'glicose') {
        if (valor < 70) return { status: 'warning', mensagem: '🟡 Hipoglicemia (tremor, fraqueza)' };
        if (valor <= 100) return { status: 'bom', mensagem: '✅ Ótimo' };
        if (valor < 126) return { status: 'warning', mensagem: '🟡 Pré-diabético' };
        return { status: 'crítico', mensagem: '🔴 Hiperglicemia' };
    }
    
    if (campo === 'hemoglobina') {
        if (valor < 13) return { status: 'crítico', mensagem: '🔴 Anemia (fadiga extrema)' };
        if (valor >= 13 && valor <= 17) return { status: 'bom', mensagem: '✅ Normal' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'magnesio') {
        if (valor < 1.7) return { status: 'warning', mensagem: '🟡 Deficiência (stress, fadiga)' };
        if (valor >= 1.7 && valor <= 2.2) return { status: 'bom', mensagem: '✅ Normal' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'zinco') {
        if (valor < 70) return { status: 'warning', mensagem: '🟡 Deficiência (imunidade baixa)' };
        if (valor >= 70 && valor <= 150) return { status: 'bom', mensagem: '✅ Normal' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'cortisol') {
        if (valor < 5) return { status: 'warning', mensagem: '🟡 Muito baixo (fadiga crônica)' };
        if (valor > 23) return { status: 'warning', mensagem: '🟡 Muito alto (stress)' };
        return { status: 'bom', mensagem: '✅ Normal' };
    }
    
    if (campo === 'pcr') {
        if (valor < 3) return { status: 'bom', mensagem: '✅ Sem inflamação' };
        if (valor < 10) return { status: 'warning', mensagem: '🟡 Inflamação leve' };
        return { status: 'crítico', mensagem: '🔴 Inflamação severa' };
    }
    
    return { status: 'neutro', mensagem: '' };
}

// ===================================
// DASHBOARD
// ===================================

function loadDashboard() {
    const content = document.getElementById('dashboardContent');
    
    if (registros.length === 0) {
        content.innerHTML = `
            <h2>📊 Dashboard - Vitalidade 360</h2>
            <div class="vitality-card">
                <h3>🔋 Sua Vitalidade Atual</h3>
                <p>Complete seu primeiro registro para receber uma análise completa de energia e clareza mental.</p>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">O sistema analisará seus exames e sinais vitais para identificar os bloqueios que impedem você de passar um plantão inteiro com energia e clareza.</p>
            </div>
        `;
        return;
    }
    
    const ultimo = registros[0];
    let alertasHtml = '';
    let scoreVitalidade = 100;
    
    // Analisar cada exame
    const examesAnalisados = [];
    for (const [campo, valor] of Object.entries(ultimo)) {
        if (!valor || campo === 'date' || campo === 'observacoes' || 
            campo.startsWith('energia') || campo.startsWith('clareza') || 
            campo.startsWith('foco') || campo === 'stress') continue;
        
        const analise = analisarValor(campo, valor);
        if (analise.mensagem) {
            examesAnalisados.push({
                campo: campo.toUpperCase(),
                valor: valor,
                analise: analise
            });
            
            // Deducir pontos do score
            if (analise.status === 'crítico') scoreVitalidade -= 15;
            if (analise.status === 'warning') scoreVitalidade -= 5;
        }
    }
    
    // Gerar HTML de alertas
    examesAnalisados.forEach(item => {
        const className = item.analise.status === 'crítico' ? 'alert-critical' : 
                         item.analise.status === 'warning' ? 'alert-warning' : 'alert-good';
        alertasHtml += `<div class="alert-text ${className}">${item.analise.mensagem} (${item.valor})</div>`;
    });
    
    // Energias subjetivas
    const energiaAcordar = parseInt(ultimo.energiaAcordar || 5);
    const energiaMeioDia = parseInt(ultimo.energiaMeioDia || 5);
    const energiaFimDia = parseInt(ultimo.energiaFimDia || 5);
    const energiaMedia = (energiaAcordar + energiaMeioDia + energiaFimDia) / 3;
    
    const clarezaMedia = parseInt(ultimo.clarezaMental || 5);
    const focoMedia = parseInt(ultimo.foco || 5);
    const stressMedia = parseInt(ultimo.stress || 5);
    
    // Score de vitalidade baseado em exames + subjetivo
    scoreVitalidade = Math.max(0, Math.min(100, scoreVitalidade + (energiaMedia * 3)));
    
    const statusVitalidade = scoreVitalidade >= 75 ? '✅ EXCELENTE' : 
                             scoreVitalidade >= 50 ? '🟡 ADEQUADO' : 
                             '🔴 CRÍTICO';
    
    const statusColor = scoreVitalidade >= 75 ? '#16a34a' : 
                        scoreVitalidade >= 50 ? '#ca8a04' : 
                        '#dc2626';
    
    content.innerHTML = `
        <h2>📊 Dashboard - Vitalidade 360</h2>
        
        <!-- CARD PRINCIPAL - SCORE -->
        <div class="dashboard-main-card">
            <div class="score-circle">
                <div class="score-number" style="color: ${statusColor};">${scoreVitalidade.toFixed(0)}</div>
                <div class="score-label">Vitalidade</div>
            </div>
            <div class="score-info">
                <h3 style="color: ${statusColor}; margin-bottom: 0.5rem;">${statusVitalidade}</h3>
                <p>Última atualização: ${ultimo.date}</p>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${scoreVitalidade}%; background-color: ${statusColor};"></div>
                </div>
            </div>
        </div>
        
        <!-- GRID DE MÉTRICAS -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">⚡</span>
                    <span class="metric-title">Energia Média</span>
                </div>
                <div class="metric-large-value">${energiaMedia.toFixed(1)}</div>
                <div class="metric-scale">/10</div>
                <div class="metric-breakdown">
                    <div class="breakdown-item">
                        <span>Acordar</span>
                        <span class="breakdown-value">${energiaAcordar}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>Meio-dia</span>
                        <span class="breakdown-value">${energiaMeioDia}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>Fim do dia</span>
                        <span class="breakdown-value">${energiaFimDia}</span>
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🧠</span>
                    <span class="metric-title">Clareza Mental</span>
                </div>
                <div class="metric-large-value">${clarezaMedia}</div>
                <div class="metric-scale">/10</div>
                <div class="metric-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${clarezaMedia * 10}%; background-color: #3b82f6;"></div>
                    </div>
                    <span class="progress-label">${clarezaMedia >= 7 ? '✅ Ótima' : clarezaMedia >= 5 ? '🟡 Adequada' : '🔴 Baixa'}</span>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">🎯</span>
                    <span class="metric-title">Foco</span>
                </div>
                <div class="metric-large-value">${focoMedia}</div>
                <div class="metric-scale">/10</div>
                <div class="metric-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${focoMedia * 10}%; background-color: #8b5cf6;"></div>
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-icon">😰</span>
                    <span class="metric-title">Nível de Stress</span>
                </div>
                <div class="metric-large-value">${stressMedia}</div>
                <div class="metric-scale">/10</div>
                <div class="metric-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stressMedia * 10}%; background-color: ${stressMedia >= 7 ? '#dc2626' : stressMedia >= 5 ? '#f59e0b' : '#10b981'};"></div>
                    </div>
                    <span class="progress-label">${stressMedia >= 7 ? '🔴 Alto' : stressMedia >= 5 ? '🟡 Moderado' : '✅ Baixo'}</span>
                </div>
            </div>
        </div>
        
        <!-- ALERTAS DE EXAMES -->
        ${examesAnalisados.length > 0 ? `
            <div class="dashboard-section">
                <h3>🧪 Análise de Exames</h3>
                <div class="alerts-container">
                    ${alertasHtml}
                </div>
            </div>
        ` : ''}
        
        <!-- OBSERVAÇÕES -->
        ${ultimo.observacoes ? `
            <div class="dashboard-section">
                <h3>📝 Suas Anotações</h3>
                <div class="observation-box">
                    ${ultimo.observacoes}
                </div>
            </div>
        ` : ''}
    `;
}

// ===================================
// GRÁFICOS
// ===================================

function loadGraficos() {
    const content = document.getElementById('graficosContent');
    
    if (registros.length < 2) {
        content.innerHTML = '<h2>📈 Gráficos de Evolução</h2><div class="vitality-card"><p>Você precisa de pelo menos 2 registros para visualizar gráficos de evolução.</p></div>';
        return;
    }
    
    // Dados para gráficos
    const labels = registros.map(r => r.date).reverse();
    const energiaMedias = registros.map(r => {
        const media = (parseInt(r.energiaAcordar || 5) + parseInt(r.energiaMeioDia || 5) + parseInt(r.energiaFimDia || 5)) / 3;
        return media;
    }).reverse();
    
    const clarezas = registros.map(r => parseInt(r.clarezaMental || 5)).reverse();
    const vitaminaDs = registros.map(r => r.vitaminaD || null).reverse().filter(v => v);
    const ferritinas = registros.map(r => r.ferritina || null).reverse().filter(v => v);
    
    content.innerHTML = `
        <h2>📈 Gráficos de Evolução</h2>
        <div class="vitality-card">
            <h3>Evolução de Energia Média</h3>
            <canvas id="energiaChart"></canvas>
        </div>
        <div class="vitality-card">
            <h3>Evolução de Clareza Mental</h3>
            <canvas id="clarezaChart"></canvas>
        </div>
        <div class="vitality-card">
            <h3>Vitamina D ao Longo do Tempo</h3>
            <canvas id="vitDChart"></canvas>
        </div>
        <div class="vitality-card">
            <h3>Ferritina ao Longo do Tempo</h3>
            <canvas id="ferritinChart"></canvas>
        </div>
    `;
    
    // Renderizar gráficos após atualizar o DOM
    setTimeout(() => {
        criarGrafico('energiaChart', 'Energia Média (1-10)', labels, energiaMedias, '#10b981');
        criarGrafico('clarezaChart', 'Clareza Mental (1-10)', labels, clarezas, '#3b82f6');
        if (vitaminaDs.length > 0) criarGrafico('vitDChart', 'Vitamina D (ng/mL)', labels.slice(-vitaminaDs.length), vitaminaDs, '#f59e0b');
        if (ferritinas.length > 0) criarGrafico('ferritinChart', 'Ferritina (ng/mL)', labels.slice(-ferritinas.length), ferritinas, '#ec4899');
    }, 100);
}

function criarGrafico(canvasId, label, labels, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, labels: { font: { size: 12 } } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: label.includes('1-10') ? 10 : undefined,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// ===================================
// HISTÓRICO
// ===================================

function loadHistorico() {
    const content = document.getElementById('historicoContent');
    
    if (registros.length === 0) {
        content.innerHTML = '<h2>📋 Histórico Completo</h2><div class="vitality-card"><p>Nenhum registro ainda.</p></div>';
        return;
    }
    
    let html = '<h2>📋 Histórico Completo - Energia & Vitalidade</h2><div class="historico-list">';
    
    registros.forEach((reg, index) => {
        const energiaMedia = ((parseInt(reg.energiaAcordar || 5) + parseInt(reg.energiaMeioDia || 5) + parseInt(reg.energiaFimDia || 5)) / 3).toFixed(1);
        const clarezaMental = reg.clarezaMental || 5;
        
        // Status geral baseado em energia
        const status = energiaMedia >= 7 ? '✅ Excelente' : energiaMedia >= 5 ? '🟡 Adequado' : '🔴 Baixo';
        const statusColor = energiaMedia >= 7 ? '#16a34a' : energiaMedia >= 5 ? '#ca8a04' : '#dc2626';
        
        html += `
            <div class="historico-accordion">
                <div class="historico-header" onclick="toggleHistorico(this)">
                    <div class="historico-resume">
                        <span class="historico-data">📅 ${reg.date}</span>
                        <span class="historico-energy">⚡ ${energiaMedia}/10</span>
                        <span class="historico-clarity">🧠 ${clarezaMental}/10</span>
                        <span class="historico-status" style="color: ${statusColor}; font-weight: 600;">${status}</span>
                    </div>
                    <span class="expand-icon">▼</span>
                </div>
                
                <div class="historico-content" style="display: none;">
                    <div class="historico-section">
                        <h4>⚡ Escalas Subjetivas</h4>
                        <div class="historico-grid">
                            <div class="historico-metric">
                                <span class="metric-label">Acordar</span>
                                <span class="metric-value">${reg.energiaAcordar}/10</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Meio-dia</span>
                                <span class="metric-value">${reg.energiaMeioDia}/10</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Fim do dia</span>
                                <span class="metric-value">${reg.energiaFimDia}/10</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Clareza</span>
                                <span class="metric-value">${reg.clarezaMental}/10</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Foco</span>
                                <span class="metric-value">${reg.foco || 5}/10</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Stress</span>
                                <span class="metric-value">${reg.stress || 5}/10</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="historico-section">
                        <h4>🔴 TIER 1 - Exames Críticos</h4>
                        <div class="historico-grid">
                            <div class="historico-metric">
                                <span class="metric-label">TSH</span>
                                <span class="metric-value">${reg.tsh || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Vitamina D</span>
                                <span class="metric-value">${reg.vitaminaD || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Ferritina</span>
                                <span class="metric-value">${reg.ferritina || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">B12</span>
                                <span class="metric-value">${reg.b12 || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Glicose</span>
                                <span class="metric-value">${reg.glicose || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Hemoglobina</span>
                                <span class="metric-value">${reg.hemoglobina || '—'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="historico-section">
                        <h4>🟡 TIER 2 - Complementares</h4>
                        <div class="historico-grid">
                            <div class="historico-metric">
                                <span class="metric-label">Magnésio</span>
                                <span class="metric-value">${reg.magnesio || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Zinco</span>
                                <span class="metric-value">${reg.zinco || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Testosterona</span>
                                <span class="metric-value">${reg.testosterona || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Cortisol</span>
                                <span class="metric-value">${reg.cortisol || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">Homocisteína</span>
                                <span class="metric-value">${reg.homocisteina || '—'}</span>
                            </div>
                            <div class="historico-metric">
                                <span class="metric-label">PCR</span>
                                <span class="metric-value">${reg.pcr || '—'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${reg.observacoes ? `
                        <div class="historico-section">
                            <h4>📝 Observações</h4>
                            <p style="padding: 0.75rem; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #3b82f6;">${reg.observacoes}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Função para expandir/retrair histórico
function toggleHistorico(element) {
    const content = element.parentElement.querySelector('.historico-content');
    const icon = element.querySelector('.expand-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// ===================================
// FORMULÁRIO
// ===================================

document.getElementById('healthForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('date').value || new Date().toISOString().split('T')[0],
        tsh: parseFloat(document.getElementById('tsh').value) || null,
        vitaminaD: parseFloat(document.getElementById('vitaminaD').value) || null,
        ferritina: parseFloat(document.getElementById('ferritina').value) || null,
        b12: parseFloat(document.getElementById('b12').value) || null,
        glicose: parseFloat(document.getElementById('glicose').value) || null,
        hemoglobina: parseFloat(document.getElementById('hemoglobina').value) || null,
        magnesio: parseFloat(document.getElementById('magnesio').value) || null,
        zinco: parseFloat(document.getElementById('zinco').value) || null,
        testosterona: parseFloat(document.getElementById('testosterona').value) || null,
        cortisol: parseFloat(document.getElementById('cortisol').value) || null,
        homocisteina: parseFloat(document.getElementById('homocisteina').value) || null,
        pcr: parseFloat(document.getElementById('pcr').value) || null,
        folatoB9: parseFloat(document.getElementById('folatoB9').value) || null,
        dhea: parseFloat(document.getElementById('dhea').value) || null,
        b6: parseFloat(document.getElementById('b6').value) || null,
        albumina: parseFloat(document.getElementById('albumina').value) || null,
        energiaAcordar: parseInt(document.getElementById('energiaAcordar').value) || 5,
        energiaMeioDia: parseInt(document.getElementById('energiaMeioDia').value) || 5,
        energiaFimDia: parseInt(document.getElementById('energiaFimDia').value) || 5,
        clarezaMental: parseInt(document.getElementById('clarezaMental').value) || 5,
        foco: parseInt(document.getElementById('foco').value) || 5,
        stress: parseInt(document.getElementById('stress').value) || 5,
        observacoes: document.getElementById('observacoes').value || ''
    };
    
    registros.unshift(formData);
    localStorage.setItem('saudeRegistros', JSON.stringify(registros));
    
    alert('✅ Registro salvo com sucesso! Vá ao Dashboard para ver sua análise.');
    document.getElementById('healthForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    switchTab('dashboard');
});

// ===================================
// INICIALIZAÇÃO
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    loadDashboard();
    console.log('✅ Vitalidade 360 carregado com sucesso!');
});
