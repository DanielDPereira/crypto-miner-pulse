import { initCharts } from './js/charts.js';
import { fetchData } from './js/data.js';
import { exportAllReadingsCsv } from './js/export.js';
import { applyLanguage, setLanguage } from './js/i18n.js';
import { initParticles } from './js/particles.js';
import {
    clearHistory,
    loadExportHistory,
    loadHistory,
    loadSettings,
    saveSettings
} from './js/storage.js';
import { state } from './js/state.js';
import { setStatus, setupDatasetToggles } from './js/ui.js';

loadSettings();
initCharts();
setupDatasetToggles();
initParticles();
loadHistory();
loadExportHistory();
applyLanguage();
setStatus(state.statusState);

const modal = document.getElementById('settingsModal');

document.getElementById('openSettings').onclick = () => {
    document.getElementById('apiUrlInput').value = state.settings.apiUrl;
    document.getElementById('refreshRateInput').value = state.settings.refreshInterval;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
};

const closeModal = () => {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

document.getElementById('closeSettings').onclick = closeModal;

const refreshTimer = () => {
    clearInterval(state.fetchTimer);
    state.fetchTimer = setInterval(fetchData, state.settings.refreshInterval);
};

document.getElementById('saveSettingsBtn').onclick = () => {
    state.settings.apiUrl = document.getElementById('apiUrlInput').value;
    state.settings.refreshInterval = parseInt(document.getElementById('refreshRateInput').value) || 3000;
    saveSettings();
    refreshTimer();
    closeModal();
};

document.getElementById('clearHistoryBtn').onclick = () => {
    clearHistory();
    location.reload();
};

const exportBtn = document.getElementById('exportCsvBtn');
if (exportBtn) exportBtn.onclick = exportAllReadingsCsv;

const languageToggleBtn = document.getElementById('languageToggle');
if (languageToggleBtn) {
    languageToggleBtn.onclick = () => {
        const nextLang = state.currentLang === 'pt-BR' ? 'en-US' : 'pt-BR';
        setLanguage(nextLang);
    };
}

fetchData();
state.fetchTimer = setInterval(fetchData, state.settings.refreshInterval);
