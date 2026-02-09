export const chartStore = {
    hashrateChart: null,
    sharesPie: null,
    sharesHistoryChart: null
};

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

export function initCharts() {
    Chart.defaults.color = '#64748b';
    Chart.defaults.font.family = 'ui-sans-serif, system-ui, sans-serif';

    const hashrateCtx = document.getElementById('hashrateChart').getContext('2d');
    chartStore.hashrateChart = new Chart(hashrateCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Hashrate (10s)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: 'Hashrate (60s)',
                    data: [],
                    borderColor: '#3b82f6',
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
                    borderColor: '#a855f7',
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

    chartStore.sharesPie = new Chart(document.getElementById('sharesPie'), {
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

    const sharesHistCtx = document.getElementById('sharesHistoryChart').getContext('2d');
    chartStore.sharesHistoryChart = new Chart(sharesHistCtx, {
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
}
