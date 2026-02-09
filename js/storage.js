import {
    STORAGE_KEY_DATA,
    STORAGE_KEY_EXPORT,
    STORAGE_KEY_SETTINGS
} from './constants.js';
import { chartStore } from './charts.js';
import { state } from './state.js';

export function loadSettings() {
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
        try {
            state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
        } catch (e) {
            console.error('Erro config', e);
        }
    }
}

export function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(state.settings));
}

export function loadHistory() {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (!raw) return;
    try {
        const history = JSON.parse(raw);
        if (Date.now() - history.timestamp > 3600000) return;

        chartStore.hashrateChart.data.labels = history.labels || [];
        chartStore.hashrateChart.data.datasets[0].data = history.hash10s || [];
        chartStore.hashrateChart.data.datasets[1].data = history.hash60s || [];
        chartStore.hashrateChart.data.datasets[2].data = history.hash15m || [];

        if (history.sharesLabels) {
            chartStore.sharesHistoryChart.data.labels = history.sharesLabels || [];
            chartStore.sharesHistoryChart.data.datasets[0].data = history.sharesGood || [];
            chartStore.sharesHistoryChart.data.datasets[1].data = history.sharesTotal || [];
            state.lastSharesUpdate = history.lastSharesUpdate || Date.now();
        }

        chartStore.hashrateChart.update();
        chartStore.sharesHistoryChart.update();
    } catch (e) {
        console.warn('Histórico inválido');
    }
}

export function saveHistory() {
    const data = {
        timestamp: Date.now(),
        labels: chartStore.hashrateChart.data.labels,
        hash10s: chartStore.hashrateChart.data.datasets[0].data,
        hash60s: chartStore.hashrateChart.data.datasets[1].data,
        hash15m: chartStore.hashrateChart.data.datasets[2].data,
        sharesLabels: chartStore.sharesHistoryChart.data.labels,
        sharesGood: chartStore.sharesHistoryChart.data.datasets[0].data,
        sharesTotal: chartStore.sharesHistoryChart.data.datasets[1].data,
        lastSharesUpdate: state.lastSharesUpdate
    };
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
}

export function loadExportHistory() {
    const raw = localStorage.getItem(STORAGE_KEY_EXPORT);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) state.exportHistory = parsed;
    } catch (e) {
        console.warn('Histórico de exportação inválido');
    }
}

export function saveExportHistory() {
    localStorage.setItem(STORAGE_KEY_EXPORT, JSON.stringify(state.exportHistory));
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_EXPORT);
}
