// Global variables to store the last known pollutant data
let lastPm10 = 0;
let lastPm25 = 0;
let lastSo2 = 0;
let lastNo2 = 0;

// Function to initialize overlay charts
export function initializeOverlayCharts(map) {
    // Collapse button functionality
    const collapseBtn = document.getElementById('collapseBtn');
    const expandBtn = document.getElementById('expandBtn');
    const chartContent = document.getElementById('chartContent');
    const featuresDiv = document.getElementById('features');
    const frequencySelect = document.getElementById('frequencySelect');
    let dataFrequency = 'year'; // Default is per year

    // Ensure charts are collapsed initially
    chartContent.style.display = 'none';
    collapseBtn.style.display = 'none';
    expandBtn.style.display = 'block';
    featuresDiv.style.height = 'auto';
    featuresDiv.style.padding = '5px';
    featuresDiv.style.width = '200px'; // Set initial collapsed width

    collapseBtn.addEventListener('click', () => {
        chartContent.style.display = 'none';
        collapseBtn.style.display = 'none';
        expandBtn.style.display = 'block';
        featuresDiv.style.height = 'auto';
        featuresDiv.style.padding = '5px';
        featuresDiv.style.width = '200px'; // Adjust width when collapsed
    });

    expandBtn.addEventListener('click', () => {
        chartContent.style.display = 'block';
        collapseBtn.style.display = 'block';
        expandBtn.style.display = 'none';
        featuresDiv.style.height = 'auto';
        featuresDiv.style.padding = '15px';
        featuresDiv.style.width = '400px'; // Adjust width when expanded
    });

    function getConvertedData(value) {
        return dataFrequency === 'day' ? value / 365 : value;
    }

    let pollutantChart1, pollutantChart2;

    function updatePollutantCharts(pm10, pm25, so2, no2) {
        const ctx1 = document.getElementById('pollutantChart1').getContext('2d');
        const ctx2 = document.getElementById('pollutantChart2').getContext('2d');

        if (pollutantChart1) pollutantChart1.destroy();
        if (pollutantChart2) pollutantChart2.destroy();

        const pm10Converted = getConvertedData(pm10);
        const pm25Converted = getConvertedData(pm25);
        const so2Converted = getConvertedData(so2);
        const no2Converted = getConvertedData(no2);

        pollutantChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['PM₁₀', 'PM₂.₅'],
                datasets: [{
                    data: [pm10Converted, pm25Converted],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: `Tonnes per ${dataFrequency === 'year' ? 'Year' : 'Day'}` }
                    }
                }
            }
        });

        pollutantChart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['SO₂', 'NO₂'],
                datasets: [{
                    data: [so2Converted, no2Converted],
                    backgroundColor: ['rgba(255, 206, 86, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: `Tonnes per ${dataFrequency === 'year' ? 'Year' : 'Day'}` }
                    }
                }
            }
        });
    }

    frequencySelect.addEventListener('change', () => {
        dataFrequency = frequencySelect.value;
        updatePollutantCharts(lastPm10, lastPm25, lastSo2, lastNo2);
    });

    map.on('mousemove', (event) => {
        if (map.getLayer('coal') || map.getLayer('coal_africa')) {
            const states = map.queryRenderedFeatures(event.point, { layers: ['coal', 'coal_africa'] });

            if (states.length) {
                const properties = states[0].properties;
                const isAfrica = states[0].layer.id === 'coal_africa';

                const pm10 = isAfrica ? properties.pm10 : properties.p10_tn_y;
                const pm25 = isAfrica ? properties.pm25 : properties.p25_tn_y;
                const so2 = isAfrica ? properties.sox : properties.so2_tn_y;
                const no2 = isAfrica ? properties.nox : properties.nox_tn_y;
                const plantName = properties.plant_name;
                const country = properties.country;

                document.getElementById('plantInfo').innerHTML = `<h3>${plantName}, ${country}</h3>`;

                lastPm10 = pm10;
                lastPm25 = pm25;
                lastSo2 = so2;
                lastNo2 = no2;

                updatePollutantCharts(pm10, pm25, so2, no2);
                document.getElementById('hoverText').style.display = 'none';
            } else {
                document.getElementById('hoverText').style.display = 'block';
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        updatePollutantCharts(0, 0, 0, 0);
        document.getElementById('pollutantChart1').style.display = 'block';
        document.getElementById('pollutantChart2').style.display = 'block';

        // Ensure it is collapsed initially
        chartContent.style.display = 'none';
        collapseBtn.style.display = 'none';
        expandBtn.style.display = 'block';

        featuresDiv.style.height = 'auto';
        featuresDiv.style.padding = '5px';
        featuresDiv.style.width = '200px';
    });
}
