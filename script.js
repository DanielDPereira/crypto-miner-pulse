const STORAGE_KEY_SETTINGS = 'DDP_CryptoMinerPulseSettings_1';
const STORAGE_KEY_DATA = 'DDP_CryptoMinerPulseData_1';
const STORAGE_KEY_EXPORT = 'DDP_CryptoMinerPulseExport_1';
const STORAGE_KEY_LANGUAGE = 'DDP_CryptoMinerPulseLang_1';
const MAX_DATA_POINTS = 60;
const SHARES_UPDATE_INTERVAL = 3 * 60 * 1000;

let settings = {
    apiUrl: 'http://127.0.0.1:20100/2/summary',
    refreshInterval: 3000
};

const DEFAULT_LANG = 'pt-BR';
const translations = {
    'pt-BR': {
        settingsTitle: 'Configurações',
        apiUrlLabel: 'API URL',
        refreshIntervalLabel: 'Intervalo de atualização (ms)',
        clearHistory: 'Limpar Histórico',
        save: 'Salvar',
        tagline: 'O dashboard do seu garimpo digital.',
        statusConnecting: 'A conectar...',
        statusOnline: 'Online',
        statusOffline: 'Offline',
        exportCsv: 'Exportar CSV',
        languageToggle: 'EN',
        hashrate10sCard: 'Hashrate (10s)',
        hashrate10sTooltip: 'Velocidade atual. Indica quantos cálculos seu PC faz por segundo. Quanto maior, melhor.',
        sharesAccepted: 'Shares Aceitos',
        sharesAcceptedTooltip: 'Trabalhos válidos entregues. São eles que confirmam seu esforço e geram sua recompensa.',
        sharesRejected: 'Rejeitados',
        sharesRejectedTooltip: 'Trabalhos inválidos. Geralmente causados por internet ruim ou configuração errada. Desperdício de energia.',
        avgShareTime: 'Tempo Médio Share',
        avgShareTimeTooltip: 'Tempo médio para seu PC encontrar uma solução. Máquinas mais rápidas têm tempos menores.',
        uptimeLabel: 'Uptime',
        uptimeTooltip: 'Tempo total que o minerador está rodando sem desligar ou travar.',
        hashrateEvolution: 'Evolução do Hashrate',
        sharesDistribution: 'Distribuição de Shares',
        totalLabel: 'Total',
        diffLabel: 'Diff',
        diffTooltip: 'Dificuldade. Define o quão difícil é resolver o problema matemático atual.',
        sharesEvolution: 'Evolução dos Shares',
        miningStation: 'Estação de Mineração',
        workerIdLabel: 'Worker ID',
        workerIdTooltip: 'Nome que identifica esta máquina na sua conta ou na Pool de mineração.',
        cpuLabel: 'CPU',
        cpuTooltip: 'Modelo do processador que está realizando o trabalho de mineração.',
        algoLabel: 'Algoritmo',
        algoTooltip: 'A fórmula matemática específica usada para minerar esta moeda (ex: rx/0 para Monero).',
        poolLabel: 'Pool',
        poolTooltip: 'Servidor coletivo onde vários mineradores se unem para aumentar a frequência de ganhos.',
        pingLabel: 'Ping',
        pingTooltip: 'Latência da conexão. Tempo de resposta entre você e a Pool. Quanto menor, melhor.',
        hugePagesLabel: 'Huge Pages',
        hugePagesTooltip: 'Otimização de memória avançada. Se estiver 100%, sua velocidade de mineração aumenta muito.',
        footerBy: 'Desenvolvido por',
        exportEmptyAlert: 'Nenhuma leitura disponível para exportar.',
        notAvailable: 'Não disponível',
        hashrate10sDataset: 'Hashrate (10s)',
        hashrate60sDataset: 'Hashrate (60s)',
        hashrate15mDataset: 'Hashrate (15m)',
        sharesAcceptedDataset: 'Aceitos',
        sharesTotalDataset: 'Totais'
    },
    'en-US': {
        settingsTitle: 'Settings',
        apiUrlLabel: 'API URL',
        refreshIntervalLabel: 'Refresh interval (ms)',
        clearHistory: 'Clear History',
        save: 'Save',
        tagline: 'Your digital mining dashboard.',
        statusConnecting: 'Connecting...',
        statusOnline: 'Online',
        statusOffline: 'Offline',
        exportCsv: 'Export CSV',
        languageToggle: 'PT',
        hashrate10sCard: 'Hashrate (10s)',
        hashrate10sTooltip: 'Current speed. Shows how many calculations your PC does per second. Higher is better.',
        sharesAccepted: 'Accepted Shares',
        sharesAcceptedTooltip: 'Valid jobs delivered. They confirm your effort and generate your reward.',
        sharesRejected: 'Rejected',
        sharesRejectedTooltip: 'Invalid jobs. Usually caused by poor internet or wrong settings. Wasted energy.',
        avgShareTime: 'Avg Share Time',
        avgShareTimeTooltip: 'Average time for your PC to find a solution. Faster machines have lower times.',
        uptimeLabel: 'Uptime',
        uptimeTooltip: 'Total time the miner has been running without stopping or crashing.',
        hashrateEvolution: 'Hashrate Evolution',
        sharesDistribution: 'Share Distribution',
        totalLabel: 'Total',
        diffLabel: 'Diff',
        diffTooltip: 'Difficulty. Defines how hard it is to solve the current math problem.',
        sharesEvolution: 'Shares Evolution',
        miningStation: 'Mining Station',
        workerIdLabel: 'Worker ID',
        workerIdTooltip: 'Name that identifies this machine in your account or mining pool.',
        cpuLabel: 'CPU',
        cpuTooltip: 'Processor model that is performing the mining work.',
        algoLabel: 'Algorithm',
        algoTooltip: 'Specific math formula used to mine this coin (e.g., rx/0 for Monero).',
        poolLabel: 'Pool',
        poolTooltip: 'Collective server where multiple miners join to increase payout frequency.',
        pingLabel: 'Ping',
        pingTooltip: 'Connection latency. Response time between you and the pool. Lower is better.',
        hugePagesLabel: 'Huge Pages',
        hugePagesTooltip: 'Advanced memory optimization. If it is 100%, your mining speed increases a lot.',
        footerBy: 'Built by',
        exportEmptyAlert: 'No readings available to export.',
        notAvailable: 'Not available',
        hashrate10sDataset: 'Hashrate (10s)',
        hashrate60sDataset: 'Hashrate (60s)',
        hashrate15mDataset: 'Hashrate (15m)',
        sharesAcceptedDataset: 'Accepted',
        sharesTotalDataset: 'Total'
    }
};

let currentLang = localStorage.getItem(STORAGE_KEY_LANGUAGE) || DEFAULT_LANG;
let statusState = 'connecting';

const PARTICLE_COLOR = 'rgba(16, 185, 129, 0.55)';

// Carregar definições salvas
const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
if (savedSettings) {
    try { settings = { ...settings, ...JSON.parse(savedSettings) }; } 
    catch(e) { console.error("Erro config", e); }
}

let fetchTimer = null;
let lastSharesUpdate = 0; // Marca quando foi a última atualização dos shares
let lastPulseAt = 0;
let lastHashrate = null;
let particleColor = PARTICLE_COLOR;
let exportHistory = [];

// --- Chart Defaults ---
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = 'ui-sans-serif, system-ui, sans-serif';

function t(key) {
    return translations[currentLang]?.[key] || translations[DEFAULT_LANG][key] || key;
}

function getLocale() {
    return currentLang === 'pt-BR' ? 'pt-BR' : 'en-US';
}

function setStatus(state) {
    statusState = state;
    const statusEl = document.getElementById('statusText');
    if (!statusEl) return;
    if (state === 'online') statusEl.textContent = t('statusOnline');
    else if (state === 'offline') statusEl.textContent = t('statusOffline');
    else statusEl.textContent = t('statusConnecting');
}

function applyLanguage(lang) {
    currentLang = translations[lang] ? lang : DEFAULT_LANG;
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (!key) return;
        el.setAttribute('placeholder', t(key));
    });

    hashrateChart.data.datasets[0].label = t('hashrate10sDataset');
    hashrateChart.data.datasets[1].label = t('hashrate60sDataset');
    hashrateChart.data.datasets[2].label = t('hashrate15mDataset');
    sharesPie.data.labels = [t('sharesAccepted'), t('sharesRejected')];
    sharesHistoryChart.data.datasets[0].label = t('sharesAcceptedDataset');
    sharesHistoryChart.data.datasets[1].label = t('sharesTotalDataset');

    hashrateChart.update('none');
    sharesPie.update();
    sharesHistoryChart.update('none');
    setStatus(statusState);
}

function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    applyLanguage(lang);
}

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            displayColors: true
        }
    },
    scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, border: { display: false } }
    }
};

// --- 1. Gráfico Hashrate ---
const hashrateCtx = document.getElementById('hashrateChart').getContext('2d');
const hashrateChart = new Chart(hashrateCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Hashrate (10s)',
                data: [],
                borderColor: '#10b981', // Emerald
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: true
            },
            {
                label: 'Hashrate (60s)',
                data: [],
                borderColor: '#3b82f6', // Blue
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                borderDash: [5, 5],
                hidden: false
            },
            {
                label: 'Hashrate (15m)',
                data: [],
                borderColor: '#a855f7', // Purple
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                hidden: false
            }
        ]
    },
    options: {
        ...commonOptions,
        scales: {
            ...commonOptions.scales,
            y: { ...commonOptions.scales.y, beginAtZero: true }
        }
    }
});

// --- 2. Gráfico Shares Distribution (Pizza) ---
const sharesPie = new Chart(document.getElementById('sharesPie'), {
    type: 'doughnut',
    data: {
        labels: ['Aceitos', 'Rejeitados'],
        datasets: [{
            data: [1, 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false } }
    }
});

// --- 3. Gráfico Shares Evolution (Line) ---
const sharesHistCtx = document.getElementById('sharesHistoryChart').getContext('2d');
const sharesHistoryChart = new Chart(sharesHistCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Aceitos',
                data: [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderWidth: 2,
                tension: 0.1,
                fill: true,
                stepped: true
            },
            {
                label: 'Totais',
                data: [],
                borderColor: '#64748b',
                borderWidth: 2,
                tension: 0.1,
                fill: false,
                stepped: true
            }
        ]
    },
    options: commonOptions
});

// --- Particulas ---

let particleCanvas = null;
let particleCtx = null;
let particles = [];
const PARTICLE_COUNT = 60;

function resizeParticles() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

function seedParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            r: Math.random() * 2.6 + 0.6,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.6 + 0.2
        });
    }
}

function animateParticles() {
    if (!particleCtx) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particleCtx.fillStyle = particleColor;
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = particleCanvas.width + 20;
        if (p.x > particleCanvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = particleCanvas.height + 20;
        if (p.y > particleCanvas.height + 20) p.y = -20;

        particleCtx.globalAlpha = p.alpha;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
}

function initParticles() {
    particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particleCanvas';
    particleCanvas.className = 'particle-layer';
    document.body.appendChild(particleCanvas);
    particleCtx = particleCanvas.getContext('2d');
    resizeParticles();
    seedParticles();
    window.addEventListener('resize', () => {
        resizeParticles();
        seedParticles();
    });
    requestAnimationFrame(animateParticles);
}

// --- Funções UI ---

function formatHashrate(h) {
    if (!h) return '0 H/s';
    if (h >= 1000000) return (h / 1000000).toFixed(2) + ' MH/s';
    if (h >= 1000) return (h / 1000).toFixed(2) + ' kH/s';
    return h.toFixed(0) + ' H/s';
}

function formatUptime(seconds) {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
}

function triggerPulse(targetEl) {
    if (!targetEl) return;
    const now = Date.now();
    if (now - lastPulseAt < 650) return;
    lastPulseAt = now;
    targetEl.classList.remove('pulse-flash');
    void targetEl.offsetWidth;
    targetEl.classList.add('pulse-flash');
}

// Toggle das linhas do gráfico Hashrate
window.toggleDataset = function(index) {
    const isHidden = !hashrateChart.isDatasetVisible(index);
    if (isHidden) hashrateChart.show(index);
    else hashrateChart.hide(index);
    
    const ids = ['btn-10s', 'btn-60s', 'btn-15m'];
    const btn = document.getElementById(ids[index]);
    if (isHidden) {
        btn.classList.remove('opacity-50', 'grayscale');
    } else {
        btn.classList.add('opacity-50', 'grayscale');
    }
};

// --- Persistência de Dados ---

function loadHistory() {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (!raw) return;
    try {
        const history = JSON.parse(raw);
        if (Date.now() - history.timestamp > 3600000) return; // Expira após 1h

        hashrateChart.data.labels = history.labels || [];
        hashrateChart.data.datasets[0].data = history.hash10s || [];
        hashrateChart.data.datasets[1].data = history.hash60s || [];
        hashrateChart.data.datasets[2].data = history.hash15m || [];

        // Carrega histórico de shares se existir
        if (history.sharesLabels) {
            sharesHistoryChart.data.labels = history.sharesLabels || [];
            sharesHistoryChart.data.datasets[0].data = history.sharesGood || [];
            sharesHistoryChart.data.datasets[1].data = history.sharesTotal || [];
            
            // Restaura o timestamp da última atualização para não duplicar ponto imediatamente
            lastSharesUpdate = history.lastSharesUpdate || Date.now();
        }

        hashrateChart.update();
        sharesHistoryChart.update();
    } catch(e) {
        console.warn("Histórico inválido");
    }
}

function saveHistory() {
    const data = {
        timestamp: Date.now(),
        // Dados Hashrate
        labels: hashrateChart.data.labels,
        hash10s: hashrateChart.data.datasets[0].data,
        hash60s: hashrateChart.data.datasets[1].data,
        hash15m: hashrateChart.data.datasets[2].data,
        // Dados Shares (separados pois têm tempos diferentes)
        sharesLabels: sharesHistoryChart.data.labels,
        sharesGood: sharesHistoryChart.data.datasets[0].data,
        sharesTotal: sharesHistoryChart.data.datasets[1].data,
        lastSharesUpdate: lastSharesUpdate
    };
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
}

function loadExportHistory() {
    const raw = localStorage.getItem(STORAGE_KEY_EXPORT);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) exportHistory = parsed;
    } catch (e) {
        console.warn('Histórico de exportação inválido');
    }
}

function saveExportHistory() {
    localStorage.setItem(STORAGE_KEY_EXPORT, JSON.stringify(exportHistory));
}

function csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
}

function buildCsvContent(rows) {
    const columns = [
        { key: 'timestamp', label: 'timestamp_iso' },
        { key: 'timeLocal', label: 'timestamp_local' },
        { key: 'hashrate10s', label: 'hashrate_10s' },
        { key: 'hashrate60s', label: 'hashrate_60s' },
        { key: 'hashrate15m', label: 'hashrate_15m' },
        { key: 'sharesGood', label: 'shares_good' },
        { key: 'sharesTotal', label: 'shares_total' },
        { key: 'sharesRejected', label: 'shares_rejected' },
        { key: 'avgShareTime', label: 'avg_share_time_s' },
        { key: 'diffCurrent', label: 'diff_current' },
        { key: 'uptime', label: 'uptime_s' },
        { key: 'workerId', label: 'worker_id' },
        { key: 'algo', label: 'algo' },
        { key: 'pool', label: 'pool' },
        { key: 'ping', label: 'ping_ms' },
        { key: 'cpuBrand', label: 'cpu_brand' },
        { key: 'hugePagesUsed', label: 'hugepages_used' },
        { key: 'hugePagesTotal', label: 'hugepages_total' }
    ];
    const lines = [columns.map(col => col.label).join(',')];
    for (const row of rows) {
        lines.push(columns.map(col => csvEscape(row[col.key])).join(','));
    }
    return lines.join('\n');
}

function downloadCsvFile(csvContent) {
    const fileStamp = new Date().toISOString().replace(/[:]/g, '-');
    const filename = `crypto-miner-pulse-${fileStamp}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportAllReadingsCsv() {
    if (!exportHistory.length) {
        alert(t('exportEmptyAlert'));
        return;
    }
    const csv = buildCsvContent(exportHistory);
    downloadCsvFile(csv);
}

// --- Fetch & Update Loop ---

async function fetchData() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(settings.apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("API Error");
        const json = await res.json();

        // UI Status
        document.getElementById('statusBadge').classList.replace('border-gray-700', 'border-emerald-500/50');
        document.querySelector('.status-dot').classList.add('status-ok');
        setStatus('online');
        document.getElementById('statusText').classList.add('text-emerald-400');

        // Dados
        const hrArray = json.hashrate?.total || [0, 0, 0];
        const sGood = json.results?.shares_good || 0;
        const sTotal = json.results?.shares_total || 0;
        const sBad = sTotal - sGood;
        const sAvgTime = json.results?.avg_time || 0; 
        
        // Atualizar Textos
        const hashrateText = formatHashrate(hrArray[0]);
        document.getElementById('hashrate10s').textContent = hashrateText;
        document.getElementById('sharesGood').textContent = sGood.toLocaleString();
        document.getElementById('sharesRejected').textContent = sBad.toLocaleString();
        document.getElementById('avgShareTime').textContent = sAvgTime + 's';
        document.getElementById('uptime').textContent = formatUptime(json.uptime);
        document.getElementById('diff').textContent = (json.results?.diff_current || 0).toLocaleString();
        document.getElementById('totalSharesLabel').textContent = sTotal.toLocaleString();
        
        // --- Atualizações da Estação de Mineração ---
        
        // 1. Worker ID e Algo
        document.getElementById('workerId').textContent = json.worker_id || '-';
        document.getElementById('algo').textContent = json.algo || '-';
        
        // 2. CPU Brand (Novo)
        const cpuBrand = json.cpu?.brand || '-';
        const cpuEl = document.getElementById('cpuBrand');
        cpuEl.textContent = cpuBrand;
        cpuEl.title = cpuBrand; // Tooltip caso o nome seja muito longo

        // 3. Pool e Ping
        document.getElementById('pool').textContent = json.connection?.pool || '-';
        document.getElementById('ping').textContent = (json.connection?.ping || 0) + ' ms';
        
        // 4. Huge Pages (Novo)
        const hp = json.hugepages || [0, 0];
        const hpUsed = hp[0];
        const hpTotal = hp[1];
        const hpEl = document.getElementById('hugePages');
        
        // Lógica de Status Huge Pages
        if (hpTotal > 0 && hpUsed === hpTotal) {
            hpEl.textContent = `${hpUsed}/${hpTotal} (100%)`;
            hpEl.className = 'font-mono text-emerald-400';
        } else if (hpTotal > 0) {
            const pct = ((hpUsed / hpTotal) * 100).toFixed(1);
            hpEl.textContent = `${hpUsed}/${hpTotal} (${pct}%)`;
            hpEl.className = 'font-mono text-yellow-400';
        } else {
            hpEl.textContent = t('notAvailable');
            hpEl.className = 'font-mono text-red-400';
        }

        const now = new Date().toLocaleTimeString(getLocale());
        exportHistory.push({
            timestamp: new Date().toISOString(),
            timeLocal: new Date().toLocaleString(getLocale()),
            hashrate10s: hrArray[0],
            hashrate60s: hrArray[1],
            hashrate15m: hrArray[2],
            sharesGood: sGood,
            sharesTotal: sTotal,
            sharesRejected: sBad,
            avgShareTime: sAvgTime,
            diffCurrent: json.results?.diff_current || 0,
            uptime: json.uptime || 0,
            workerId: json.worker_id || '',
            algo: json.algo || '',
            pool: json.connection?.pool || '',
            ping: json.connection?.ping || 0,
            cpuBrand: json.cpu?.brand || '',
            hugePagesUsed: hpUsed,
            hugePagesTotal: hpTotal
        });
        saveExportHistory();

        // --- Atualização Gráfico Hashrate ---
        hashrateChart.data.labels.push(now);
        hashrateChart.data.datasets[0].data.push(hrArray[0]); 
        hashrateChart.data.datasets[1].data.push(hrArray[1]);
        hashrateChart.data.datasets[2].data.push(hrArray[2]);

        if (hashrateChart.data.labels.length > MAX_DATA_POINTS) {
            hashrateChart.data.labels.shift();
            hashrateChart.data.datasets.forEach(d => d.data.shift());
        }
        hashrateChart.update('none');

        if (lastHashrate !== hrArray[0]) {
            const card = document.getElementById('hashrate10s')?.closest('.glass-panel');
            triggerPulse(card);
            lastHashrate = hrArray[0];
        }

        // --- Atualização Gráfico Shares ---
        const currentTime = Date.now();
        if (currentTime - lastSharesUpdate >= SHARES_UPDATE_INTERVAL) {
            
            sharesHistoryChart.data.labels.push(now);
            sharesHistoryChart.data.datasets[0].data.push(sGood);
            sharesHistoryChart.data.datasets[1].data.push(sTotal);

            // Mantém histórico maior para shares
            if (sharesHistoryChart.data.labels.length > 20) {
                sharesHistoryChart.data.labels.shift();
                sharesHistoryChart.data.datasets.forEach(d => d.data.shift());
            }
            
            sharesHistoryChart.update('none');
            lastSharesUpdate = currentTime;
        }

        // Gráfico Pizza
        sharesPie.data.datasets[0].data = [sGood, sBad];
        sharesPie.update();

        saveHistory();

    } catch (err) {
        console.error(err);
        document.querySelector('.status-dot').classList.remove('status-ok');
        document.querySelector('.status-dot').classList.add('status-error');
        setStatus('offline');
        document.getElementById('statusText').classList.replace('text-emerald-400', 'text-red-400');
    }
}

// --- Inicialização ---

const modal = document.getElementById('settingsModal');
document.getElementById('openSettings').onclick = () => {
    document.getElementById('apiUrlInput').value = settings.apiUrl;
    document.getElementById('refreshRateInput').value = settings.refreshInterval;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
};

const closeModal = () => {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

document.getElementById('closeSettings').onclick = closeModal;
document.getElementById('saveSettingsBtn').onclick = () => {
    settings.apiUrl = document.getElementById('apiUrlInput').value;
    settings.refreshInterval = parseInt(document.getElementById('refreshRateInput').value) || 3000;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    
    clearInterval(fetchTimer);
    fetchTimer = setInterval(fetchData, settings.refreshInterval);
    closeModal();
};
document.getElementById('clearHistoryBtn').onclick = () => {
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_EXPORT);
    location.reload();
};

const exportBtn = document.getElementById('exportCsvBtn');
if (exportBtn) exportBtn.onclick = exportAllReadingsCsv;

const languageToggleBtn = document.getElementById('languageToggle');
if (languageToggleBtn) {
    languageToggleBtn.onclick = () => {
        const nextLang = currentLang === 'pt-BR' ? 'en-US' : 'pt-BR';
        setLanguage(nextLang);
    };
}

initParticles();
loadHistory();
loadExportHistory();
applyLanguage(currentLang);
setStatus(statusState);
fetchData();
fetchTimer = setInterval(fetchData, settings.refreshInterval);