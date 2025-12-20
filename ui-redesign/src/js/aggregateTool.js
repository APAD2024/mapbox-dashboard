import { layerStyles } from './layerVisibility.js';
import { closePopups } from './utils.js';

// -----------------------------------------------------------AGGREGATE TOOL-----------------------------------------------------------

// Aggregate Tool State
let aggregateToolEnabled = false;
let emissionsChart;
let countsChart;

// Brick kiln layers (add all variants here)
export const BRICK_KILN_LAYERS = [
  "brick_kilns_PK",
  "brick_kilns_IND",
  "brick_kilns_BAN",
  "brick_kilns_DRC",
  "brick_kilns_GHA",
  "brick_kilns_UGA",
  "brick_kilns_NGA"
];

// Single source of truth
export const COUNTABLE_LAYERS_INFO = {
  coal: 'Coal Plants',
  coal_africa: 'Coal Plants',
  fossil_fuel: 'Fossil Fuel',
  furnace_oil_IGP: 'Furnace Oil',
  furnace_oil_biofuel:'Biofuel',
  furnace_oil_oil:'Oil',
  furnace_oil_natural_gas:'Natural Gas',
  steel_IGP: 'Steel IGP',
  steel_africa: 'Steel Africa',
  paper_pulp_IGP: 'Paper Pulp',
  paper_pulp_africa: 'Paper Pulp',
  cement_IGP: 'Cement',
  cement_africa: 'Cement',
  boilers: 'Boilers',
  solid_waste_IGP: 'Solid Waste',
  solid_waste_africa: 'Solid Waste',
  gpw: 'GPW'
};

// Map map layer IDs → layerStyles keys
export const layerIdToStyleKey = {
    coal: 'coal',
    coal_africa: 'coal',
    fossil_fuel: 'fossilFuel',
    furnace_oil_IGP: 'furnaceOil',
    furnace_oil_biofuel:'furnaceOil',
    furnace_oil_oil:'furnaceOil',
    furnace_oil_natural_gas:'furnaceOil',
    steel_IGP: 'steel',
    steel_africa: 'steel',
    paper_pulp_IGP: 'paperPulp',
    paper_pulp_africa: 'paperPulp',
    cement_IGP: 'cement',
    cement_africa: 'cement',
    boilers: 'boilers',
    solid_waste_IGP: 'landFillWaste',
    solid_waste_africa: 'landFillWaste',
    gpw: 'gpw'
};

// Derived lists
const COUNTABLE_LAYERS = Object.keys(COUNTABLE_LAYERS_INFO);
const layerNames = { ...COUNTABLE_LAYERS_INFO };

function getCSSColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName);
}


export const layerColors = {};

// Map each layer ID to the circle color
for (const [layerId, style] of Object.entries(layerStyles)) {
    layerColors[layerId] = style.circleColor;
}

const chartFont = getComputedStyle(document.documentElement).getPropertyValue('--body01').trim();


// Get aggregate tool state
export function isAggregateToolEnabled() {
    return aggregateToolEnabled;
}

// Toggle aggregate tool
export function toggleAggregateTool(map) {
    aggregateToolEnabled = !aggregateToolEnabled;
    
    const resultBox = document.getElementById('aggregateResults');
    const bufferSizeSelector = document.getElementById('bufferSizeSelector');
    const tooltip = document.getElementById('tooltipAggregate');

    if (aggregateToolEnabled) {
        map.getCanvas().style.cursor = 'crosshair';
        tooltip.style.display = 'block';
        bufferSizeSelector.style.display = 'block';
        closePopups(); // disable popups during aggregation

        // 👇 Hide tooltip when user clicks on map (first interaction)
        const hideTooltipOnClick = () => {
            tooltip.style.display = 'none';
            map.off('click', hideTooltipOnClick); // remove listener after first click
        };
        map.on('click', hideTooltipOnClick);

    } else {
        map.getCanvas().style.cursor = '';
        tooltip.style.display = 'none';
        bufferSizeSelector.style.display = 'none';
        clearBuffer(map); // also hides results
    }
}

// Clear buffer and hide results
export function clearBuffer(map) {
    if (map.getLayer('bufferLayer')) map.removeLayer('bufferLayer');
    if (map.getSource('bufferSource')) map.removeSource('bufferSource');

    const resultBox = document.getElementById('aggregateResults');
    resultBox.style.display = 'none';
    resultBox.innerHTML = '';
}


// Initialize aggregate tool
export function initAggregateTool(map) {
    const aggregateButton = document.getElementById('aggregateToolButton');
    aggregateButton.addEventListener('click', () => toggleAggregateTool(map));

    map.on('click', (e) => {
        if (aggregateToolEnabled) {
            handleAggregation(map, e.lngLat);
        }
    });
}

function handleAggregation(map, lngLat) {
    const bufferRadius = parseFloat(document.getElementById('bufferSizeSelector').value);
    if (isNaN(bufferRadius) || bufferRadius <= 0) return;

    const buffer = turf.buffer(turf.point([lngLat.lng, lngLat.lat]), bufferRadius, { units: 'kilometers' });
    if (!buffer || buffer.geometry.coordinates.length === 0) return;

    // Clear previous buffer
    clearBuffer(map);

    // Add new buffer
    map.addSource('bufferSource', { type: 'geojson', data: buffer });
    map.addLayer({
        id: 'bufferLayer',
        type: 'fill',
        source: 'bufferSource',
        paint: { 'fill-color': 'hsla(167, 13.2%, 79.2%, 0.5)', 'fill-outline-color': 'hsla(182, 47.7%, 12.7%, 1)' }
    });

    // Show results container
    const resultBox = document.getElementById('aggregateResults');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <div class="aggregate-header">
            <h5>Aggregated Data (${bufferRadius} km buffer)</h5>
            <button id="closeAggregateResults" class="closeButton">&times;</button>
        </div>
        <p>Brick Kilns: </p>
        <canvas id="emissionsChart" width="400" height="250"></canvas>
        <canvas id="countsChart" width="400" height="250"></canvas>
    `;

      document.getElementById('closeAggregateResults').addEventListener('click', () => {
        resultBox.style.display = 'none';
        clearBuffer(map);
    });

    // Delay to ensure canvas is rendered
    setTimeout(() => {
        generateCountsChart(map, buffer);

        // Sum emissions from all visible layers
        const totalEmissions = { nox: 0, so2: 0, pm10: 0, pm25: 0 };
        map.getStyle().layers.forEach(layer => {
            if (map.getLayer(layer.id) && map.getLayoutProperty(layer.id, 'visibility') === 'visible') {
                const features = map.queryRenderedFeatures({ layers: [layer.id] });
                features.forEach(f => {
                    if (f.geometry.type === 'Point' && turf.booleanPointInPolygon(turf.point(f.geometry.coordinates), buffer)) {
                        if ('nox_t_yr' in f.properties || 'so2_t_yr' in f.properties || 'pm10_t_yr' in f.properties || 'pm25_t_yr' in f.properties) {
                            totalEmissions.nox += f.properties.nox_t_yr || 0;
                            totalEmissions.so2 += f.properties.so2_t_yr || f.properties.sox || 0;
                            totalEmissions.pm10 += f.properties.pm10_t_yr || 0;
                            totalEmissions.pm25 += f.properties.pm25_t_yr || 0;
                        }
                    }
                });
            }
        });

        console.log(totalEmissions);
        generateEmissionsChart(totalEmissions);

    }, 50);
}


function generateCountsChart(map, buffer) {
    const layerCounts = {};
    let brickKilnsCount = 0;

    map.getStyle().layers.forEach(layer => {
        const id = layer.id;

        // Skip layers not in either list
        if (!BRICK_KILN_LAYERS.includes(id) && !COUNTABLE_LAYERS.includes(id)) return;

        if (map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible') {
            const features = map.queryRenderedFeatures({ layers: [id] });

            let count = features.filter(f => f.geometry.type === 'Point' &&
                turf.booleanPointInPolygon(turf.point(f.geometry.coordinates), buffer)
            ).length;

            if (count > 0) {
                if (BRICK_KILN_LAYERS.includes(id)) {
                    brickKilnsCount += count;
                } else {
                    layerCounts[id] = count;
                }
            }
        }
    });

    

    // Update Brick Kilns text
    const resultBox = document.getElementById('aggregateResults');
    const brickKilnsParagraph = resultBox.querySelector('p');
    brickKilnsParagraph.textContent = `Brick Kilns: ${brickKilnsCount.toLocaleString()}`;

    // Prepare chart data
    const chartLabels = Object.keys(layerCounts).map(id => COUNTABLE_LAYERS_INFO[id]);
    const chartValues = Object.values(layerCounts);
    
    const chartColors = Object.keys(layerCounts).map(id => {
    const styleKey = layerIdToStyleKey[id];           // map layerId → layerStyles key
    const style = layerStyles[styleKey];
    return {
        fill: style?.circleColor || 'gray',           // fallback gray if missing
        stroke: style?.strokeColor || 'black'        // fallback black if missing
    };
});
    const ctx = document.getElementById('countsChart').getContext('2d');
    if (countsChart) countsChart.destroy();

    countsChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: Object.keys(layerCounts).map(id => layerNames[id] || id),
        datasets: [{
            data: Object.values(layerCounts),
            backgroundColor: chartColors.map(c => c.fill),
            borderColor: chartColors.map(c => c.stroke),
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: { display: true, text: 'Point Counts per Layer' },
            legend: { display: false }
        },
        scales: { y: { beginAtZero: true } }
    }
});
}


function generateEmissionsChart(emissionsData) {
    const emissionProperties = ['nox', 'so2', 'pm10', 'pm25'];

    const labels = emissionProperties.map(p => p.toUpperCase());
    const values = emissionProperties.map(p => emissionsData[p] || 0); // default to 0 if missing

    const ctx = document.getElementById('emissionsChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Emissions (tn/year)',
                data: values,
                backgroundColor: [
                    getCSSColor('--light-green')
                ],
                borderColor: [
                    getCSSColor('--dark-green')
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // horizontal bars
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { font: { family: chartFont } }
                },
                y: {
                    ticks: { font: { family: chartFont } }
                }
            },
            responsive: true,
            plugins: {
                legend: { display: false, labels: { font: { family: chartFont } } },
                title: { display: false, font: { family: chartFont } }
            }
        }
    });
}



