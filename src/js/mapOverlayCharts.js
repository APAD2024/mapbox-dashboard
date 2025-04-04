// Global variables to store the last known pollutant data
let lastPm10 = 0;
let lastPm25 = 0;
let lastSo2 = 0;
let lastNo2 = 0;

// Layers to monitor
const pollutantLayers = [
    'coal', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'cement_IGP', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'solid_waste_IGP',
    'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
];




export function initializeOverlayCharts(map) {
    const collapseBtn = document.getElementById('collapseBtn');
    const expandBtn = document.getElementById('expandBtn');
    const chartContent = document.getElementById('chartContent');
    const featuresDiv = document.getElementById('features');
    const frequencySelect = document.getElementById('frequencySelect');
    const hoverText = document.getElementById('hoverText');
    const plantInfo = document.getElementById('plantInfo');

    let dataFrequency = 'year';
    let pollutantChart1, pollutantChart2;

    // Collapse / Expand controls
    chartContent.style.display = 'none';
    collapseBtn.style.display = 'none';
    expandBtn.style.display = 'block';
    featuresDiv.style.width = '200px';
    featuresDiv.style.padding = '5px';

    collapseBtn.addEventListener('click', () => {
        chartContent.style.display = 'none';
        collapseBtn.style.display = 'none';
        expandBtn.style.display = 'block';
        featuresDiv.style.width = '200px';
        featuresDiv.style.padding = '5px';
    });

    expandBtn.addEventListener('click', () => {
        chartContent.style.display = 'block';
        collapseBtn.style.display = 'block';
        expandBtn.style.display = 'none';
        featuresDiv.style.width = '400px';
        featuresDiv.style.padding = '15px';
    });


    const layerNames = {
        coal: 'Coal Plant',
        fossil: 'Fossil Fuel Facility',
        gpw: 'Population Source',
        brick_kilns_PK: 'Brick Kilns (Pakistan)',
        brick_kilns_IND: 'Brick Kilns (India)',
        brick_kilns_BAN: 'Brick Kilns (Bangladesh)',
        cement_IGP: 'Cement Plant',
        oil_gas_IGP: 'Oil & Gas Facility',
        paper_pulp_IGP: 'Paper Pulp Plant',
        steel_IGP: 'Steel Plant',
        solid_waste_IGP: 'Solid Waste Facility',
        coal_africa: 'Coal Plant (Africa)',
        cement_africa: 'Cement Plant (Africa)',
        paper_pulp_africa: 'Paper Pulp (Africa)',
        steel_africa: 'Steel Plant (Africa)',
        brick_kilns_DRC: 'Brick Kilns (DRC)',
        brick_kilns_GHA: 'Brick Kilns (Ghana)',
        brick_kilns_UGA: 'Brick Kilns (Uganda)',
        brick_kilns_NGA: 'Brick Kilns (Nigeria)'
    };





    // Convert yearly/day frequency
    function getConvertedData(value) {
        const num = Number(value);
        return dataFrequency === 'day' ? (isNaN(num) ? 0 : num / 365) : (isNaN(num) ? 0 : num);
    }

    function updatePollutantCharts(pm10, pm25, so2, no2) {
        const ctx1 = document.getElementById('pollutantChart1').getContext('2d');
        const ctx2 = document.getElementById('pollutantChart2').getContext('2d');

        if (pollutantChart1) pollutantChart1.destroy();
        if (pollutantChart2) pollutantChart2.destroy();

        pollutantChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['PM₁₀', 'PM₂.₅'],
                datasets: [{
                    data: [getConvertedData(pm10), getConvertedData(pm25)],
                    backgroundColor: ['rgba(75, 192, 192, 0.3)', 'rgba(54, 162, 235, 0.3)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: `Tonnes per ${dataFrequency}` }
                    }
                }
            }
        });

        pollutantChart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['SO₂', 'NO₂'],
                datasets: [{
                    data: [getConvertedData(so2), getConvertedData(no2)],
                    backgroundColor: ['rgba(255, 206, 86, 0.3)', 'rgba(255, 99, 132, 0.3)'],
                    borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: `Tonnes per ${dataFrequency}` }
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
        let found = false;

        for (const layerId of pollutantLayers) {
            if (!map.getLayer(layerId)) continue;

            const features = map.queryRenderedFeatures(event.point, { layers: [layerId] });
            if (!features.length) continue;

            const props = features[0].properties || {};
            const hasPollution = ['pm10', 'pm25', 'so2', 'nox'].some(key => key in props);
  

            const parseOrZero = (val) => isNaN(Number(val)) ? 0 : Number(val);

            lastPm10 = parseOrZero(props.pm10);
            lastPm25 = parseOrZero(props.pm25);
            lastSo2  = parseOrZero(props.so2);
            lastNo2  = parseOrZero(props.nox);



            const name = props.name || props.NAME_3 || 'Unnamed';
            const country = props.country || props.COUNTRY || '';

            plantInfo.innerHTML = `<h3>${name}, ${country}</h3>`;
            updatePollutantCharts(lastPm10, lastPm25, lastSo2, lastNo2);
            hoverText.style.display = 'none';

            // ✅ Set source title dynamically here
            const layerTitle = layerNames[layerId] || 'Unknown Source';
            const sourceTitle = document.getElementById('pollutantSourceTitle');
            if (sourceTitle) sourceTitle.innerText = `Pollutants from ${layerTitle}`;

            found = true;
            break;
        }

        if (!found) {
            hoverText.style.display = 'block';
        }
    });




    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        updatePollutantCharts(0, 0, 0, 0);
        chartContent.style.display = 'none';
        collapseBtn.style.display = 'none';
        expandBtn.style.display = 'block';
    });
}
