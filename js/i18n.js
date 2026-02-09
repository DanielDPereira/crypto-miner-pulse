import { DEFAULT_LANG, STORAGE_KEY_LANGUAGE, translations } from './constants.js';
import { chartStore } from './charts.js';
import { state } from './state.js';

export function t(key) {
    return translations[state.currentLang]?.[key] || translations[DEFAULT_LANG][key] || key;
}

export function getLocale() {
    return state.currentLang === 'pt-BR' ? 'pt-BR' : 'en-US';
}

export function applyLanguage() {
    const lang = translations[state.currentLang] ? state.currentLang : DEFAULT_LANG;
    state.currentLang = lang;
    document.documentElement.lang = lang;

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

    if (chartStore.hashrateChart) {
        chartStore.hashrateChart.data.datasets[0].label = t('hashrate10sDataset');
        chartStore.hashrateChart.data.datasets[1].label = t('hashrate60sDataset');
        chartStore.hashrateChart.data.datasets[2].label = t('hashrate15mDataset');
        chartStore.hashrateChart.update('none');
    }

    if (chartStore.sharesPie) {
        chartStore.sharesPie.data.labels = [t('sharesAccepted'), t('sharesRejected')];
        chartStore.sharesPie.update();
    }

    if (chartStore.sharesHistoryChart) {
        chartStore.sharesHistoryChart.data.datasets[0].label = t('sharesAcceptedDataset');
        chartStore.sharesHistoryChart.data.datasets[1].label = t('sharesTotalDataset');
        chartStore.sharesHistoryChart.update('none');
    }
}

export function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    state.currentLang = translations[lang] ? lang : DEFAULT_LANG;
    applyLanguage();
}
