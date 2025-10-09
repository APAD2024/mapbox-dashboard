import { closePopups  } from './utils.js';
// -----------------------------------------------------------AGGREGATE TOOL-----------------------------------------------------------


// Aggregate Tool State
let aggregateToolEnabled = false;
let emissionsChart;
let countsChart;

// Brick kiln layers (add all variants here)
const BRICK_KILN_LAYERS = [
  "brick_kilns_PK",
  "brick_kilns_IND",
  "brick_kilns_BAN",
  "brick_kilns_DRC",
  "brick_kilns_GHA",
  "brick_kilns_UGA",
  "brick_kilns_NGA"
];

// All other emission-related layers
const COUNTABLE_LAYERS = [
  'coal',
  'coal_africa',
  'fossil',
  'furnace_oil_IGP',
  'steel_IGP',
  'steel_africa',
  'paper_pulp_IGP',
  'paper_pulp_africa',
  'cement_IGP',
  'cement_africa',
  'boilers',
  'solid_waste_IGP',
  'gpw'
];

const layerNames = {
    'coal': 'Coal Plants',
    'coal_africa': 'Coal Plants',
    'fossil': 'Fossil Fuel',
    'furnace_oil_IGP': 'Furnace Oil',
    'steel_IGP': 'Steel IGP',
    'steel_africa': 'Steel Africa',
    'paper_pulp_IGP': 'Paper Pulp',
    'paper_pulp_africa': 'Paper Pulp',
    'cement_IGP': 'Cement',
    'cement_africa': 'Cement',
    'boilers': 'Boilers',
    'solid_waste_IGP': 'Solid Waste',
    'gpw': 'GPW',
};

function getCSSColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName);
}

const layerColors = {
    'coal': getCSSColor('--red'),
    'coal_africa': getCSSColor('--red'),
    'fossil': getCSSColor('--orange'),
    'furnace_oil_IGP': getCSSColor('--blue'),
    'steel_IGP': getCSSColor('--blue-t'),
    'steel_africa': getCSSColor('--blue-t'),
    'paper_pulp_IGP': getCSSColor('--pink-t'),
    'paper_pulp_africa': getCSSColor('--pink-t'),
    'cement_IGP': getCSSColor('--vivid-green-t'),
    'cement_africa': getCSSColor('--vivid-green-t'),
    'boilers': getCSSColor('--red-t'),
    'solid_waste_IGP': getCSSColor('--orange'),
    'gpw': getCSSColor('--light-blue')
};

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
    const tooltip = document.getElementById('tooltip');

    if (aggregateToolEnabled) {
        map.getCanvas().style.cursor = 'crosshair';
        tooltip.style.display = 'block';
        bufferSizeSelector.style.display = 'block';
        closePopups(); // disable popups during aggregation
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
        paint: { 'fill-color': 'rgba(128,128,128,0.5)', 'fill-outline-color': 'black' }
    });

    // Show results container
    const resultBox = document.getElementById('aggregateResults');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <h5>Aggregated Data (${bufferRadius} km buffer)</h5>
        <p>Brick Kilns: </p>
        <canvas id="emissionsChart" width="400" height="250"></canvas>
        <canvas id="countsChart" width="400" height="250"></canvas>
    `;

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
                        if ('nox' in f.properties || 'so2' in f.properties || 'pm10' in f.properties || 'pm25' in f.properties) {
                            totalEmissions.nox += f.properties.nox || 0;
                            totalEmissions.so2 += f.properties.so2 || f.properties.sox || 0;
                            totalEmissions.pm10 += f.properties.pm10 || 0;
                            totalEmissions.pm25 += f.properties.pm25 || 0;
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

        // skip layers not in either list
        if (!BRICK_KILN_LAYERS.includes(id) && !COUNTABLE_LAYERS.includes(id)) return;

        if (map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible') {
            const features = map.queryRenderedFeatures({ layers: [id] });

            let count = 0;
            features.forEach(feature => {
                if (
                    feature.geometry.type === 'Point' &&
                    turf.booleanPointInPolygon(turf.point(feature.geometry.coordinates), buffer)
                ) {
                    count++;
                }
            });

            if (count > 0) {
                if (BRICK_KILN_LAYERS.includes(id)) {
                    brickKilnsCount += count; // count but don’t add to chart
                } else if (COUNTABLE_LAYERS.includes(id)) {
                    layerCounts[id] = count;
                }
            }
        }
    });

    // Update “Brick Kilns” text
    const resultBox = document.getElementById('aggregateResults');
    const brickKilnsParagraph = resultBox.querySelector('p');
    brickKilnsParagraph.textContent = `Brick Kilns: ${brickKilnsCount.toLocaleString()}`;

    // Create bar chart for the other layers
    const labels = Object.keys(layerCounts).map(id => layerNames[id] || id);
    const values = Object.values(layerCounts);
    const colors = Object.keys(layerCounts).map(id => layerColors[id] || 'gray');

    const ctx = document.getElementById('countsChart').getContext('2d');
    if (countsChart) countsChart.destroy();

    countsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Number of Points',
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.6', '1')),
                borderWidth: 1,
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

// Usage example
// generateEmissionsChart(totalCoalEmissions);


// // Function to handle aggregation
// function handleAggregation(map, lngLat) {
//     const clickCoordinates = [lngLat.lng, lngLat.lat];
//     const bufferRadius = parseFloat(document.getElementById('bufferSizeSelector').value);

//     if (isNaN(bufferRadius) || bufferRadius <= 0) {
//         console.error("Invalid buffer size selected.");
//         return;
//     }

//     const buffer = turf.buffer(turf.point(clickCoordinates), bufferRadius, { units: 'kilometers' });

//     if (!buffer || buffer.geometry.coordinates.length === 0) {
//         console.error("Buffer generation failed.");
//         return;
//     }

//     // Add the buffer to the map as a new layer
//     clearBuffer(map);
//     map.addSource('bufferSource', { type: 'geojson', data: buffer });
//     map.addLayer({
//         id: 'bufferLayer',
//         type: 'fill',
//         source: 'bufferSource',
//         paint: {
//             'fill-color': 'rgba(128, 128, 128, 0.5)',
//             'fill-outline-color': 'black'
//         }
//     });

//     let popupContent = `<div class="popup-table"><h3>Aggregated Data (${bufferRadius} km buffer)</h3>`;

//      // 1. Aggregate brick kilns based on visibility
//     let totalBrickKilns = 0;
//     const brickKilnsLayers = ['BK_PK', 'BK_IND', 'BK_BAN', 'Brick_kilns_DRC', 'Brick_kilns_GHA', 'Brick_kilns_NGA', 'Brick_kilns_UGA'];
    
//     brickKilnsLayers.forEach(layerId => {
//         if (map.getLayer(layerId) && map.getLayoutProperty(layerId, 'visibility') === 'visible') {
//             const features = map.queryRenderedFeatures({ layers: [layerId] });
//             features.forEach(feature => {
//                 if (turf.booleanPointInPolygon(turf.point(feature.geometry.coordinates), buffer)) {
//                     totalBrickKilns++;
//                 }
//             });
//         }
//     });

//     if (totalBrickKilns > 0) {
//         popupContent += `<p>Brick Kilns: ${totalBrickKilns}</p>`;
//     }
//     console.log('Total Brick Kilns Count:', totalBrickKilns);
    


//       // 2. Aggregate coal plants within the buffer
//       let totalCoalEmissions = {
//           nox: 0,
//           so2: 0,
//           pm10: 0,
//           pm25: 0
//       };
//       let totalCoalPlants = 0;

//       if (map.getLayer('coal')) {
//           const coalVisibility = map.getLayoutProperty('coal', 'visibility');
//           if (coalVisibility === 'visible') {
//               const coalLayerFeatures = map.queryRenderedFeatures({ layers: ['coal'] });

//               coalLayerFeatures.forEach((feature) => {
//                   const coalPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(coalPoint, buffer)) {
//                       totalCoalEmissions.nox += feature.properties.nox_tn_y || 0;
//                       totalCoalEmissions.so2 += feature.properties.so2_tn_y || 0;
//                       totalCoalEmissions.pm10 += feature.properties.p10_tn_y || 0;
//                       totalCoalEmissions.pm25 += feature.properties.p25_tn_y || 0;
//                       totalCoalPlants++; // Count coal plants within the buffer
//                   }
//               });
//           }
//       }

//       if (map.getLayer('coal_africa')) {
//           const coalVisibility = map.getLayoutProperty('coal_africa', 'visibility');
//           if (coalVisibility === 'visible') {
//               const coalLayerFeatures = map.queryRenderedFeatures({ layers: ['coal_africa'] });

//               coalLayerFeatures.forEach((feature) => {
//                   const coalPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(coalPoint, buffer)) {
//                       totalCoalEmissions.nox += feature.properties.nox || 0;
//                       totalCoalEmissions.so2 += feature.properties.sox || 0;
//                       totalCoalEmissions.pm10 += feature.properties.pm10 || 0;
//                       totalCoalEmissions.pm25 += feature.properties.pm25 || 0;
//                       totalCoalPlants++; // Count coal plants within the buffer
//                   }
//               });

            
//           }
//       }

//       // if (totalCoalPlants > 0) {
//       //     popupContent += `<p>Coal Points: ${totalCoalPlants}</p>`;
//       // }

//       // 2. Aggregate cement IGP data within the buffer
//       let cementIGPCount = 0;
//       if (map.getLayer('cement_IGP')) {
//           const  cementIGPVisibility = map.getLayoutProperty('cement_IGP', 'visibility');
//           if ( cementIGPVisibility === 'visible') {
//               const  cementIGPFeatures = map.queryRenderedFeatures({ layers: ['cement_IGP'] });

//               cementIGPFeatures.forEach((feature) => {
//                   const  cementIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( cementIGPPoint, buffer)) {
//                       cementIGPCount += 1;
//                   }
//               });

//               // if ( cementIGPCount > 0) {
//               //     popupContent += `<p>Cement Plants: ${ cementIGPCount}</p>`;
//               // }
//           }
//       }


//       // 3. Aggregate africa cement data within the buffer
//       let cementAfricaCount = 0;
//       if (map.getLayer('cement_africa')) {
//           const cementAfricaVisibility = map.getLayoutProperty('cement_africa', 'visibility');
//           if (cementAfricaVisibility === 'visible') {
//               const cementAfricaFeatures = map.queryRenderedFeatures({ layers: ['cement_africa'] });

//               cementAfricaFeatures.forEach((feature) => {
//                   const cementAfricaPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(cementAfricaPoint, buffer)) {
//                       cementAfricaCount += 1;
//                   }
//               });

//               // if (cementAfricaCount > 0) {
//               //     popupContent += `<p>Cement Plants: ${cementAfricaCount}</p>`;
//               // }
//           }
//       }

//       // 4. Aggregate IGP paper pulp data within the buffer
//       let paperPulpIGPCount = 0;
//       if (map.getLayer('paper_pulp_IGP')) {
//           const  paperPulpIGPVisibility = map.getLayoutProperty('paper_pulp_IGP', 'visibility');
//           if ( paperPulpIGPVisibility === 'visible') {
//               const  paperPulpIGPFeatures = map.queryRenderedFeatures({ layers: ['paper_pulp_IGP'] });

//               paperPulpIGPFeatures.forEach((feature) => {
//                   const  paperPulpIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( paperPulpIGPPoint, buffer)) {
//                       paperPulpIGPCount += 1;
//                   }
//               });

//               // if ( paperPulpIGPCount > 0) {
//               //     popupContent += `<p>Paper Pulp Plants: ${ paperPulpIGPCount}</p>`;
//               // }
//           }
//       }

//       // 5. Aggregate africa paper pulp data within the buffer
//       let paperPulpAfricaCount = 0;
//       if (map.getLayer('paper_pulp_africa')) {
//           const  paperPulpAfricaVisibility = map.getLayoutProperty('paper_pulp_africa', 'visibility');
//           if ( paperPulpAfricaVisibility === 'visible') {
//               const  paperPulpAfricaFeatures = map.queryRenderedFeatures({ layers: ['paper_pulp_africa'] });

//               paperPulpAfricaFeatures.forEach((feature) => {
//                   const  paperPulpAfricaPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( paperPulpAfricaPoint, buffer)) {
//                       paperPulpAfricaCount += 1;
//                   }
//               });

//               if ( paperPulpAfricaCount > 0) {
//                   popupContent += `<p>Paper Pulp Plants: ${ paperPulpAfricaCount}</p>`;
//               }
//           }
//       }

//       // 6. Aggregate africa steel plants data within the buffer
//       let steelIGPCount = 0;
//       if (map.getLayer('steel_IGP')) {
//           const  steelIGPVisibility = map.getLayoutProperty('steel_IGP', 'visibility');
//           if (steelIGPVisibility === 'visible') {
//               const  steelIGPFeatures = map.queryRenderedFeatures({ layers: ['steel_IGP'] });

//               steelIGPFeatures.forEach((feature) => {
//                   const  steelIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( steelIGPPoint, buffer)) {
//                       steelIGPCount += 1;
//                   }
//               });

//               // if ( steelIGPCount > 0) {
//               //     popupContent += `<p>Steel Plants: ${ steelIGPCount}</p>`;
//               // }
//           }
//       }

//       // 7. Aggregate africa steel plants data within the buffer
//       let steelAfricaCount = 0;
//       if (map.getLayer('steel_africa')) {
//           const  steelAfricaVisibility = map.getLayoutProperty('steel_africa', 'visibility');
//           if (steelAfricaVisibility === 'visible') {
//               const  steelAfricaFeatures = map.queryRenderedFeatures({ layers: ['steel_africa'] });

//               steelAfricaFeatures.forEach((feature) => {
//                   const  steelAfricaPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( steelAfricaPoint, buffer)) {
//                       steelAfricaCount += 1;
//                   }
//               });

//               // if ( steelAfricaCount > 0) {
//               //     popupContent += `<p>Steel Plants: ${ steelAfricaCount}</p>`;
//               // }
//           }
//       }

//       // 8. Aggregate fossil fuel data within the buffer
//       let fossilFuelCount = 0;
//       if (map.getLayer('fossil')) {
//           const fossilFuelVisibility = map.getLayoutProperty('fossil', 'visibility');
//           if (fossilFuelVisibility === 'visible') {
//               const fossilFuelLayerFeatures = map.queryRenderedFeatures({ layers: ['fossil'] });

//               fossilFuelLayerFeatures.forEach((feature) => {
//                   const fossilFuelPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(fossilFuelPoint, buffer)) {
//                       fossilFuelCount += 1;
//                   }
//               });

//               // if (fossilFuelCount > 0) {
//               //     popupContent += `<p>Fossil Fuel Points: ${fossilFuelCount}</p>`;
//               // }
//           }
//       }

//       // 9. Aggregate GPW data (population or area) within the buffer
//       let totalPopulation = 0;
//       let totalGPWPoints = 0;
//       if (map.getLayer('gpw')) {
//           const gpwVisibility = map.getLayoutProperty('gpw', 'visibility');
//           if (gpwVisibility === 'visible') {
//               const gpwLayerFeatures = map.queryRenderedFeatures({ layers: ['gpw'] });

//               gpwLayerFeatures.forEach((feature) => {
//                   const gpwPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(gpwPoint, buffer)) {
//                       totalPopulation += feature.properties.area_new || 0; // Sum the area values (replace with population if available)
//                       totalGPWPoints++; // Count GPW points
//                   }
//               });

//               // if (totalGPWPoints > 0) {
//               //     popupContent += `<p>Total GPW Points: ${totalGPWPoints}</p>`;
//               // }
//           }
//       }

//       // 10. Aggregate africa steel plants data within the buffer
//       let oilGasIGPCount = 0;
//       if (map.getLayer('oil_gas_IGP')) {
//           const  oilGasIGPVisibility = map.getLayoutProperty('oil_gas_IGP', 'visibility');
//           if (oilGasIGPVisibility === 'visible') {
//               const  oilGasIGPFeatures = map.queryRenderedFeatures({ layers: ['oil_gas_IGP'] });

//               oilGasIGPFeatures.forEach((feature) => {
//                   const  oilGasIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( oilGasIGPPoint, buffer)) {
//                       oilGasIGPCount += 1;
//                   }
//               });

//               // if ( oilGasIGPCount > 0) {
//               //     popupContent += `<p>Oil Gas Refineries: ${ oilGasIGPCount}</p>`;
//               // }
//           }
//       }

//       // 11. Aggregate africa steel plants data within the buffer
//       let plasticWasteIGPCount = 0;
//       if (map.getLayer('plastic_waste_IGP')) {
//           const  plasticWasteIGPVisibility = map.getLayoutProperty('plastic_waste_IGP', 'visibility');
//           if (plasticWasteIGPVisibility === 'visible') {
//               const  plasticWasteIGPFeatures = map.queryRenderedFeatures({ layers: ['plastic_waste_IGP'] });

//               plasticWasteIGPFeatures.forEach((feature) => {
//                   const  plasticWasteIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( plasticWasteIGPPoint, buffer)) {
//                       plasticWasteIGPCount += 1;
//                   }
//               });

//               // if ( plasticWasteIGPCount > 0) {
//               //     popupContent += `<p>Plastic Waste Burning Sites: ${ plasticWasteIGPCount}</p>`;
//               // }
//           }
//       }

//       // 11. Aggregate africa steel plants data within the buffer
//       let solidWasteIGPCount = 0;
//       if (map.getLayer('solid_waste_IGP')) {
//           const  solidWasteIGPVisibility = map.getLayoutProperty('solid_waste_IGP', 'visibility');
//           if (solidWasteIGPVisibility === 'visible') {
//               const  solidWasteIGPFeatures = map.queryRenderedFeatures({ layers: ['solid_waste_IGP'] });

//               solidWasteIGPFeatures.forEach((feature) => {
//                   const  solidWasteIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( solidWasteIGPPoint, buffer)) {
//                       solidWasteIGPCount += 1;
//                   }
//               });

//               // if ( solidWasteIGPCount > 0) {
//               //     popupContent += `<p>Solid Waste Burning Sites: ${ solidWasteIGPCount}</p>`;
//               // }
//           }
//       }

//           // End the popup content and add canvas for the charts
//               popupContent += `
//               <canvas id="emissionsChart" width="250" height="250"></canvas>
//               <canvas id="countsChart" width="250" height="250"></canvas>
//               </div>
//           `;
      

//     // Show popup
//     // new mapboxgl.Popup()
//     //     .setLngLat(lngLat)
//     //     .setHTML(popupContent)
//     //     .addTo(map);
//     const resultBox = document.getElementById('aggregateResults');
//     resultBox.innerHTML = popupContent;


//     // Generate charts after popup renders
//     setTimeout(() => generateCharts(totalCoalEmissions, totalCoalPlants, totalBrickKilns, totalGPWPoints, fossilFuelCount,
//         cementIGPCount,cementAfricaCount,paperPulpIGPCount,paperPulpAfricaCount, steelIGPCount, steelAfricaCount,oilGasIGPCount,
//         plasticWasteIGPCount, solidWasteIGPCount
//     ), 100);
// }

// // Function to generate charts
// function generateCharts(totalCoalEmissions, totalCoalPlants, totalBrickKilns, totalGPWPoints, fossilFuelCount, cementIGPCount,cementAfricaCount,paperPulpIGPCount,paperPulpAfricaCount, steelIGPCount, steelAfricaCount,oilGasIGPCount,plasticWasteIGPCount, solidWasteIGPCount) {
//     const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
//     new Chart(emissionsCtx, {
//         type: 'pie',
//         data: {
//             labels: ['NO₂', 'SO₂', 'PM₁₀', 'PM₂.₅'],
//             datasets: [{
//                 label: 'Emissions (tons/year)',
//                 data: [
//                     totalCoalEmissions.nox.toFixed(2),
//                     totalCoalEmissions.so2.toFixed(2),
//                     totalCoalEmissions.pm10.toFixed(2),
//                     totalCoalEmissions.pm25.toFixed(2)
//                 ],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.6)', // NO₂ color
//                     'rgba(54, 162, 235, 0.6)', // SO₂ color
//                     'rgba(255, 206, 86, 0.6)', // PM₁₀ color
//                     'rgba(75, 192, 192, 0.6)'  // PM₂.₅ color
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Coal Emissions (tons/year)'
//                 }
//             }
//         }
//     });

//      // Map layer colors for different features
//      const layerColors = {
//         'Coal Plants': '#616161',
//         'GPW Points': 'black',
//         'Fossil Fuel Points': 'blue',
//         'Cement IGP': 'purple',
//         'Cement Africa': 'purple',  // Assuming same color as IGP for simplicity
//         'Paper Pulp IGP': 'rgb(112, 206, 202)',
//         'Paper Pulp Africa': 'rgb(112, 206, 202)',  // Assuming same color as IGP
//         'Steel IGP': 'rgb(24, 54, 84)',
//         'Steel Africa': 'rgb(24, 54, 84)',  // Assuming same color as IGP
//         'Oil Gas Refineries': 'brown',
//         'Plastic Waste': 'rgb(165, 146, 23)',
//         'Solid Waste': 'rgb(206, 131, 19)'
//     };

//     // Prepare data for the Counts Chart by filtering non-zero counts
//     const countsData = [
//         { label: 'Coal Plants', value: totalCoalPlants },
//         { label: 'GPW Points', value: totalGPWPoints },
//         { label: 'Fossil Fuel Points', value: fossilFuelCount },
//         { label: 'Cement IGP', value: cementIGPCount },
//         { label: 'Cement Africa', value: cementAfricaCount },
//         { label: 'Paper Pulp IGP', value: paperPulpIGPCount },
//         { label: 'Paper Pulp Africa', value: paperPulpAfricaCount },
//         { label: 'Steel IGP', value: steelIGPCount },
//         { label: 'Steel Africa', value: steelAfricaCount },
//         { label: 'Oil Gas Refineries', value: oilGasIGPCount },
//         { label: 'Plastic Waste', value: plasticWasteIGPCount },
//         { label: 'Solid Waste', value: solidWasteIGPCount }
//     ].filter(entry => entry.value > 0);  // Filter out zero-count entries
    
//     const countsLabels = countsData.map(entry => entry.label);
//         const countsValues = countsData.map(entry => entry.value);
//         const backgroundColors = countsLabels.map(label => layerColors[label]);
//         const borderColors = countsLabels.map(label => layerColors[label]);
    
//         // Counts Chart
//         const countsCtx = document.getElementById('countsChart').getContext('2d');
//         new Chart(countsCtx, {
//             type: 'bar',
//             data: {
//                 labels: countsLabels,
//                 datasets: [{
//                     label: 'Counts',
//                     data: countsValues,
//                     backgroundColor: backgroundColors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.6)')),
//                     borderColor: borderColors,
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 scales: {
//                     y: {
//                         beginAtZero: true
//                     }
//                 },
//                 plugins: {
//                     title: {
//                         display: true,
//                         text: 'Counts for Selected Layers',
//                         font: {
//                             size: 14,
//                             weight: 'bold'
//                         },
//                         padding: {
//                             top: 10,
//                             bottom: 20
//                         }
//                     },
//                     legend: {
//                         position: 'none',
//                     }
//                 }
//             }
//         });
// }




// //try2
// function handleAggregation(map, lngLat) {
//     const clickCoordinates = [lngLat.lng, lngLat.lat];
//     const bufferRadius = parseFloat(document.getElementById('bufferSizeSelector').value);
//     if (isNaN(bufferRadius) || bufferRadius <= 0) return;

//     const buffer = turf.buffer(turf.point(clickCoordinates), bufferRadius, { units: 'kilometers' });
//     if (!buffer) return;

//     // Clear previous buffer
//     clearBuffer(map);
//     map.addSource('bufferSource', { type: 'geojson', data: buffer });
//     map.addLayer({
//         id: 'bufferLayer',
//         type: 'fill',
//         source: 'bufferSource',
//         paint: { 'fill-color': 'rgba(128,128,128,0.5)', 'fill-outline-color': 'black' }
//     });

//     const popupData = {}; // To store counts/emissions dynamically

//     map.getStyle().layers.forEach(layer => {
//         const layerId = layer.id;

//         if (!map.getLayer(layerId)) return;

//         const visibility = map.getLayoutProperty(layerId, 'visibility') || 'none';
//         if (visibility !== 'visible') return;

//         const features = map.queryRenderedFeatures({ layers: [layerId] });
//         if (!features.length) return;

//         features.forEach(f => {
//             const point = turf.point(f.geometry.coordinates);

//             if (!turf.booleanPointInPolygon(point, buffer)) return;

//             // Check if layer has emission properties
//             let hasEmission = false;
//             const emissions = {};
//             emissionProperties.forEach(prop => {
//                 if (f.properties[prop] !== undefined) {
//                     hasEmission = true;
//                     emissions[prop] = (emissions[prop] || 0) + f.properties[prop];
//                 }
//             });

//             if (hasEmission) {
//                 if (!popupData[layerId]) popupData[layerId] = { emissions: {}, count: 0 };
//                 popupData[layerId].count++;
//                 emissionProperties.forEach(prop => {
//                     if (emissions[prop] !== undefined) {
//                         popupData[layerId].emissions[prop] = (popupData[layerId].emissions[prop] || 0) + emissions[prop];
//                     }
//                 });
//             } else {
//                 // Just count features without emissions
//                 if (!popupData[layerId]) popupData[layerId] = { count: 0 };
//                 popupData[layerId].count++;
//             }
//         });
//     });

//     // Build popup HTML
//     let popupContent = `<div class="popup-table"><h3>Aggregated Data (${bufferRadius} km buffer)</h3>`;
//     for (const [layerId, data] of Object.entries(popupData)) {
//         if (data.count > 0) {
//             popupContent += `<p>${layerId}: ${data.count} feature(s)</p>`;
//             if (data.emissions) {
//                 const emStr = Object.entries(data.emissions).map(([k, v]) => `${k.toUpperCase()}: ${v.toFixed(2)}`).join(', ');
//                 popupContent += `<p>Emissions: ${emStr}</p>`;
//             }
//         }
//     }

//     // Add canvases for charts
//     popupContent += `<canvas id="emissionsChart" width="250" height="250"></canvas>`;
//     popupContent += `<canvas id="countsChart" width="250" height="250"></canvas>`;
//     popupContent += `</div>`;

//     document.getElementById('aggregateResults').innerHTML = popupContent;

//     // Generate charts dynamically based on popupData
//     setTimeout(() => generateChartsFromPopupData(popupData), 100);
// }

// // Function to generate charts from popup data
// function generateChartsFromPopupData(popupData) {
//     // Ensure popupData exists and has default values
//     const totalCoalEmissions = popupData.totalCoalEmissions || { nox: 0, so2: 0, pm10: 0, pm25: 0 };
//     const totalCoalPlants = popupData.totalCoalPlants || 0;
//     const totalBrickKilns = popupData.totalBrickKilns || 0;
//     const totalGPWPoints = popupData.totalGPWPoints || 0;
//     const fossilFuelCount = popupData.fossilFuelCount || 0;
//     const cementIGPCount = popupData.cementIGPCount || 0;
//     const cementAfricaCount = popupData.cementAfricaCount || 0;
//     const paperPulpIGPCount = popupData.paperPulpIGPCount || 0;
//     const paperPulpAfricaCount = popupData.paperPulpAfricaCount || 0;
//     const steelIGPCount = popupData.steelIGPCount || 0;
//     const steelAfricaCount = popupData.steelAfricaCount || 0;
//     const oilGasIGPCount = popupData.oilGasIGPCount || 0;
//     const plasticWasteIGPCount = popupData.plasticWasteIGPCount || 0;
//     const solidWasteIGPCount = popupData.solidWasteIGPCount || 0;

//     // Get canvas contexts
//     const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
//     const countsCtx = document.getElementById('countsChart').getContext('2d');

//     // Destroy previous charts if they exist
//     if (emissionsChart) emissionsChart.destroy();
//     if (countsChart) countsChart.destroy();

//     // Pie chart for coal emissions
//     emissionsChart = new Chart(emissionsCtx, {
//         type: 'pie',
//         data: {
//             labels: ['NO₂', 'SO₂', 'PM₁₀', 'PM₂.₅'],
//             datasets: [{
//                 label: 'Emissions (tons/year)',
//                 data: [
//                     totalCoalEmissions.nox.toFixed(2),
//                     totalCoalEmissions.so2.toFixed(2),
//                     totalCoalEmissions.pm10.toFixed(2),
//                     totalCoalEmissions.pm25.toFixed(2)
//                 ],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.6)',
//                     'rgba(54, 162, 235, 0.6)',
//                     'rgba(255, 206, 86, 0.6)',
//                     'rgba(75, 192, 192, 0.6)'
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Coal Emissions (tons/year)'
//                 },
//                 legend: {
//                     position: 'bottom'
//                 }
//             }
//         }
//     });

//     // Layer colors for counts chart
//     const layerColors = {
//         'Coal Plants': '#616161',
//         'GPW Points': 'black',
//         'Fossil Fuel Points': 'blue',
//         'Cement IGP': 'purple',
//         'Cement Africa': 'purple',
//         'Paper Pulp IGP': 'rgb(112, 206, 202)',
//         'Paper Pulp Africa': 'rgb(112, 206, 202)',
//         'Steel IGP': 'rgb(24, 54, 84)',
//         'Steel Africa': 'rgb(24, 54, 84)',
//         'Oil Gas Refineries': 'brown',
//         'Plastic Waste': 'rgb(165, 146, 23)',
//         'Solid Waste': 'rgb(206, 131, 19)'
//     };

//     // Prepare counts data
//     const countsData = [
//         { label: 'Coal Plants', value: totalCoalPlants },
//         { label: 'GPW Points', value: totalGPWPoints },
//         { label: 'Fossil Fuel Points', value: fossilFuelCount },
//         { label: 'Cement IGP', value: cementIGPCount },
//         { label: 'Cement Africa', value: cementAfricaCount },
//         { label: 'Paper Pulp IGP', value: paperPulpIGPCount },
//         { label: 'Paper Pulp Africa', value: paperPulpAfricaCount },
//         { label: 'Steel IGP', value: steelIGPCount },
//         { label: 'Steel Africa', value: steelAfricaCount },
//         { label: 'Oil Gas Refineries', value: oilGasIGPCount },
//         { label: 'Plastic Waste', value: plasticWasteIGPCount },
//         { label: 'Solid Waste', value: solidWasteIGPCount }
//     ].filter(entry => entry.value > 0);

//     const countsLabels = countsData.map(entry => entry.label);
//     const countsValues = countsData.map(entry => entry.value);
//     const backgroundColors = countsLabels.map(label => layerColors[label]).map(c => c.replace('rgb', 'rgba').replace(')', ', 0.6)'));
//     const borderColors = countsLabels.map(label => layerColors[label]);

//     // Bar chart for counts
//     countsChart = new Chart(countsCtx, {
//         type: 'bar',
//         data: {
//             labels: countsLabels,
//             datasets: [{
//                 label: 'Counts',
//                 data: countsValues,
//                 backgroundColor: backgroundColors,
//                 borderColor: borderColors,
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: { beginAtZero: true }
//             },
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Counts for Selected Layers',
//                     font: { size: 14, weight: 'bold' },
//                     padding: { top: 10, bottom: 20 }
//                 },
//                 legend: { display: false }
//             }
//         }
//     });
// }