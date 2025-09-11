const MAX_DATA_POINTS = 30;
const API_URL = 'http://127.0.0.1:20100/2/summary';
const SHARES_UPDATE_INTERVAL = 1 * 60 * 1000;
let lastSharesUpdate = 0;

const statusEl = document.getElementById('status');
const connectionErrorEl = document.getElementById('connectionError');

const getChartOptions = (isPie = false) => {
    const options = {
        responsive: true,
        maintainAspectRatio: isPie, 
        animation: false,
        plugins: { legend: { labels: { color: '#e5e7eb' } } }
    };
    if (!isPie) {
        options.scales = {
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        };
    }
    return options;
};

const hashrateChart = new Chart(document.getElementById('hashrateChart'), {
  type: 'line',
  data: { labels: [], datasets: [
        { label: 'Hashrate (10s)', data: [], borderColor: '#facc15', backgroundColor: '#facc1520', fill: true, tension: 0.3 },
        { label: 'Hashrate (60s)', data: [], borderColor: '#60a5fa', tension: 0.3, hidden: true },
        { label: 'Hashrate (15m)', data: [], borderColor: '#a78bfa', tension: 0.3, hidden: true }
  ] },
  options: getChartOptions(false)
});

const sharesPie = new Chart(document.getElementById('sharesPie'), {
  type: 'pie',
  data: { labels: ['Aceitos', 'Rejeitados'], datasets: [{ data: [0, 0], backgroundColor: ['#4ade80','#f87171'], borderWidth: 0 }] },
  options: getChartOptions(true)
});

const sharesHistoryChartOptions = getChartOptions(false);
sharesHistoryChartOptions.scales.y.ticks = { color: '#9ca3af', stepSize: 1, precision: 0 };
sharesHistoryChartOptions.scales.y.beginAtZero = true;

const sharesHistoryChart = new Chart(document.getElementById('sharesHistoryChart'), {
  type: 'line',
  data: { labels: [], datasets: [
    { label: 'Aceitos', data: [], borderColor: '#4ade80', fill: false, tension: 0.1 },
    { label: 'Totais', data: [], borderColor: '#60a5fa', fill: false, tension: 0.1 }
  ]},
  options: sharesHistoryChartOptions
});

function formatUptime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0s';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
}

function updateLineChart(chart, label, newDataArray) {
    chart.data.labels.push(label);
    newDataArray.forEach((value, index) => {
        chart.data.datasets[index].data.push(value);
    });
    if (chart.data.labels.length > MAX_DATA_POINTS) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(dataset => dataset.data.shift());
    }
    chart.update();
}

async function fetchData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    
    connectionErrorEl.style.display = 'none';
    statusEl.innerHTML = '<span class="status-dot status-ok"></span>Online';
    
    const hashrates = json.hashrate?.total || [0, 0, 0];
    const sharesGood = json.results?.shares_good || 0;
    const sharesTotal = json.results?.shares_total || 0;
    const sharesRejected = sharesTotal - sharesGood;
    const avgTimeMs = json.results?.avg_time_ms || 0;
    const avgTimeInSeconds = (avgTimeMs / 1000).toFixed(1);

    document.getElementById('hashrate10s').textContent = `${hashrates[0].toLocaleString()} H/s`;
    document.getElementById('sharesGood').textContent = sharesGood.toLocaleString();
    document.getElementById('sharesRejected').textContent = sharesRejected.toLocaleString();
    document.getElementById('avgTime').textContent = `${avgTimeInSeconds} s`;
    document.getElementById('hashrateHighest').textContent = `${(json.hashrate?.highest || 0).toLocaleString()} H/s`;
    document.getElementById('diff').textContent = (json.results?.diff_current || 0).toLocaleString();
    document.getElementById('uptime').textContent = formatUptime(json.uptime || 0);
    
    document.getElementById('workerId').textContent = json.worker_id || '-';
    document.getElementById('cpuBrand').textContent = json.cpu?.brand || '-';
    document.getElementById('cpuThreads').textContent = json.cpu?.threads || '-';
    document.getElementById('algo').textContent = json.algo || '-';
    document.getElementById('pool').textContent = json.connection?.pool || '-';
    document.getElementById('ping').textContent = json.connection?.ping || '0';
    document.getElementById('version').textContent = json.version || '-';

    const currentTime = Date.now();
    const readableTime = new Date().toLocaleTimeString('pt-BR');

    updateLineChart(hashrateChart, readableTime, hashrates);
    
    if (lastSharesUpdate === 0 || (currentTime - lastSharesUpdate > SHARES_UPDATE_INTERVAL)) {
      updateLineChart(sharesHistoryChart, readableTime, [sharesGood, sharesTotal]);
      lastSharesUpdate = currentTime;
    }
    
    sharesPie.data.datasets[0].data = [sharesGood, sharesRejected];
    sharesPie.update();

  } catch (err) {
    connectionErrorEl.style.display = 'flex';
    statusEl.innerHTML = '<span class="status-dot status-error"></span>Offline';
    console.error('Erro ao buscar dados da API:', err);
  }
}

setInterval(fetchData, 3000);
fetchData();