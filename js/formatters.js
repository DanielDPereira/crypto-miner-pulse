export function formatHashrate(h) {
    if (!h) return '0 H/s';
    if (h >= 1000000) return (h / 1000000).toFixed(2) + ' MH/s';
    if (h >= 1000) return (h / 1000).toFixed(2) + ' kH/s';
    return h.toFixed(0) + ' H/s';
}

export function formatUptime(seconds) {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
}
