import { chartStore } from './charts.js';
import { MAX_DATA_POINTS, SHARES_UPDATE_INTERVAL } from './constants.js';
import { formatHashrate, formatUptime } from './formatters.js';
import { getLocale, t } from './i18n.js';
import { saveExportHistory, saveHistory } from './storage.js';
import { state } from './state.js';
import { setStatus, triggerPulse } from './ui.js';

export async function fetchData() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(state.settings.apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error('API Error');
        const json = await res.json();

        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.classList.replace('border-gray-700', 'border-emerald-500/50');
        }
        document.querySelector('.status-dot')?.classList.add('status-ok');
        setStatus('online');
        document.getElementById('statusText')?.classList.add('text-emerald-400');
        document.getElementById('statusText')?.classList.remove('text-red-400');

        const hrArray = json.hashrate?.total || [0, 0, 0];
        const sGood = json.results?.shares_good || 0;
        const sTotal = json.results?.shares_total || 0;
        const sBad = sTotal - sGood;
        const sAvgTime = json.results?.avg_time || 0;

        const hashrateText = formatHashrate(hrArray[0]);
        document.getElementById('hashrate10s').textContent = hashrateText;
        document.getElementById('sharesGood').textContent = sGood.toLocaleString();
        document.getElementById('sharesRejected').textContent = sBad.toLocaleString();
        document.getElementById('avgShareTime').textContent = sAvgTime + 's';
        document.getElementById('uptime').textContent = formatUptime(json.uptime);
        document.getElementById('diff').textContent = (json.results?.diff_current || 0).toLocaleString();
        document.getElementById('totalSharesLabel').textContent = sTotal.toLocaleString();

        document.getElementById('workerId').textContent = json.worker_id || '-';
        document.getElementById('algo').textContent = json.algo || '-';

        const cpuBrand = json.cpu?.brand || '-';
        const cpuEl = document.getElementById('cpuBrand');
        cpuEl.textContent = cpuBrand;
        cpuEl.title = cpuBrand;

        document.getElementById('pool').textContent = json.connection?.pool || '-';
        document.getElementById('ping').textContent = (json.connection?.ping || 0) + ' ms';

        const hp = json.hugepages || [0, 0];
        const hpUsed = hp[0];
        const hpTotal = hp[1];
        const hpEl = document.getElementById('hugePages');

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
        state.exportHistory.push({
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

        chartStore.hashrateChart.data.labels.push(now);
        chartStore.hashrateChart.data.datasets[0].data.push(hrArray[0]);
        chartStore.hashrateChart.data.datasets[1].data.push(hrArray[1]);
        chartStore.hashrateChart.data.datasets[2].data.push(hrArray[2]);

        if (chartStore.hashrateChart.data.labels.length > MAX_DATA_POINTS) {
            chartStore.hashrateChart.data.labels.shift();
            chartStore.hashrateChart.data.datasets.forEach((d) => d.data.shift());
        }
        chartStore.hashrateChart.update('none');

        if (state.lastHashrate !== hrArray[0]) {
            const card = document.getElementById('hashrate10s')?.closest('.glass-panel');
            triggerPulse(card);
            state.lastHashrate = hrArray[0];
        }

        const currentTime = Date.now();
        if (currentTime - state.lastSharesUpdate >= SHARES_UPDATE_INTERVAL) {
            chartStore.sharesHistoryChart.data.labels.push(now);
            chartStore.sharesHistoryChart.data.datasets[0].data.push(sGood);
            chartStore.sharesHistoryChart.data.datasets[1].data.push(sTotal);

            if (chartStore.sharesHistoryChart.data.labels.length > 20) {
                chartStore.sharesHistoryChart.data.labels.shift();
                chartStore.sharesHistoryChart.data.datasets.forEach((d) => d.data.shift());
            }

            chartStore.sharesHistoryChart.update('none');
            state.lastSharesUpdate = currentTime;
        }

        chartStore.sharesPie.data.datasets[0].data = [sGood, sBad];
        chartStore.sharesPie.update();

        saveHistory();
    } catch (err) {
        console.error(err);
        document.querySelector('.status-dot')?.classList.remove('status-ok');
        document.querySelector('.status-dot')?.classList.add('status-error');
        setStatus('offline');
        const statusText = document.getElementById('statusText');
        statusText?.classList.replace('text-emerald-400', 'text-red-400');
    }
}
