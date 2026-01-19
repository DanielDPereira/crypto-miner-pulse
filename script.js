const STORAGE_KEY_SETTINGS = 'DanielDPereira';
const STORAGE_KEY_DATA = 'DanielDPereira';
const MAX_DATA_POINTS = 60;
const SHARES_UPDATE_INTERVAL = 3 * 60 * 1000;

let settings = {
    apiUrl: 'http://127.0.0.1:20100/2/summary',
    refreshInterval: 3000
};

// Carregar definições salvas
const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
if (savedSettings) {
    try { settings = { ...settings, ...JSON.parse(savedSettings) }; } 
    catch(e) { console.error("Erro config", e); }
}

let fetchTimer = null;
let lastSharesUpdate = 0; // Marca quando foi a última atualização dos shares

// --- Chart Defaults ---
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = 'ui-sans-serif, system-ui, sans-serif';

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
        document.getElementById('statusText').textContent = 'Online';
        document.getElementById('statusText').classList.add('text-emerald-400');

        // Dados
        const hrArray = json.hashrate?.total || [0, 0, 0];
        const sGood = json.results?.shares_good || 0;
        const sTotal = json.results?.shares_total || 0;
        const sBad = sTotal - sGood;
        
        // Atualizar Textos
        document.getElementById('hashrate10s').textContent = formatHashrate(hrArray[0]);
        document.getElementById('sharesGood').textContent = sGood.toLocaleString();
        document.getElementById('sharesRejected').textContent = sBad.toLocaleString();
        document.getElementById('uptime').textContent = formatUptime(json.uptime);
        document.getElementById('diff').textContent = (json.results?.diff_current || 0).toLocaleString();
        document.getElementById('totalSharesLabel').textContent = sTotal.toLocaleString();
        
        document.getElementById('workerId').textContent = json.worker_id || '-';
        document.getElementById('algo').textContent = json.algo || '-';
        document.getElementById('pool').textContent = json.connection?.pool || '-';
        document.getElementById('ping').textContent = (json.connection?.ping || 0) + ' ms';

        const now = new Date().toLocaleTimeString('pt-BR');

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
        document.getElementById('statusText').textContent = 'Offline';
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
    location.reload();
};

loadHistory();
fetchData();
fetchTimer = setInterval(fetchData, settings.refreshInterval);