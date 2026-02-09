import { state } from './state.js';
import { t } from './i18n.js';

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
    const lines = [columns.map((col) => col.label).join(',')];
    for (const row of rows) {
        lines.push(columns.map((col) => csvEscape(row[col.key])).join(','));
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

export function exportAllReadingsCsv() {
    if (!state.exportHistory.length) {
        alert(t('exportEmptyAlert'));
        return;
    }
    const csv = buildCsvContent(state.exportHistory);
    downloadCsvFile(csv);
}
