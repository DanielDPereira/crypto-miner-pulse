import { chartStore } from './charts.js';
import { t } from './i18n.js';
import { state } from './state.js';

export function setStatus(stateValue) {
    state.statusState = stateValue;
    const statusEl = document.getElementById('statusText');
    if (!statusEl) return;
    if (stateValue === 'online') statusEl.textContent = t('statusOnline');
    else if (stateValue === 'offline') statusEl.textContent = t('statusOffline');
    else statusEl.textContent = t('statusConnecting');
}

export function triggerPulse(targetEl) {
    if (!targetEl) return;
    const now = Date.now();
    if (now - state.lastPulseAt < 650) return;
    state.lastPulseAt = now;
    targetEl.classList.remove('pulse-flash');
    void targetEl.offsetWidth;
    targetEl.classList.add('pulse-flash');
}

export function setupDatasetToggles() {
    window.toggleDataset = function(index) {
        const isHidden = !chartStore.hashrateChart.isDatasetVisible(index);
        if (isHidden) chartStore.hashrateChart.show(index);
        else chartStore.hashrateChart.hide(index);

        const ids = ['btn-10s', 'btn-60s', 'btn-15m'];
        const btn = document.getElementById(ids[index]);
        if (!btn) return;
        if (isHidden) {
            btn.classList.remove('opacity-50', 'grayscale');
        } else {
            btn.classList.add('opacity-50', 'grayscale');
        }
    };
}
