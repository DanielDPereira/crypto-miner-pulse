import {
    DEFAULT_LANG,
    PARTICLE_COLOR,
    STORAGE_KEY_LANGUAGE
} from './constants.js';

export const state = {
    settings: {
        apiUrl: 'http://127.0.0.1:20100/2/summary',
        refreshInterval: 3000
    },
    currentLang: localStorage.getItem(STORAGE_KEY_LANGUAGE) || DEFAULT_LANG,
    statusState: 'connecting',
    fetchTimer: null,
    lastSharesUpdate: 0,
    lastPulseAt: 0,
    lastHashrate: null,
    particleColor: PARTICLE_COLOR,
    exportHistory: []
};
