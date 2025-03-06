import { closePopups  } from './utils.js';
// -----------------------------------------------------------AGGREGATE TOOL-----------------------------------------------------------

// Aggregate Tool State
let aggregateToolEnabled = false;

// Function to get the state of the Aggregate Tool
export function isAggregateToolEnabled() {
    return aggregateToolEnabled;
}

// Determine active area
function getActiveArea() {
    const currentCenter = map.getCenter();
    const isAfrica = Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5;
    return isAfrica ? 'africa' : 'asia';
}
// Function to toggle the Aggregate Tool
export function toggleAggregateTool(map) {
    aggregateToolEnabled = !aggregateToolEnabled;

    const aggregateButton = document.getElementById('aggregateTool');
    const bufferSizeSelector = document.getElementById('bufferSizeSelector');
    const tooltip = document.getElementById('tooltip');

    if (aggregateToolEnabled) {
        aggregateButton.style.backgroundColor = '#d3d3d3'; // Active state color
        map.getCanvas().style.cursor = 'crosshair'; // Change cursor
        tooltip.style.display = 'block';
        bufferSizeSelector.style.display = 'block';
        closePopups(); // Close any existing popups
        console.log("Aggregate Tool enabled - popups disabled");
    } else {
        aggregateButton.style.backgroundColor = 'white'; // Reset color
        map.getCanvas().style.cursor = ''; // Reset cursor
        tooltip.style.display = 'none';
        bufferSizeSelector.style.display = 'none';
        clearBuffer(map);
        console.log("Aggregate Tool disabled - popups enabled");
    }
}


// Function to clear the buffer layer from the map
export function clearBuffer(map) {
    if (map.getLayer('bufferLayer')) map.removeLayer('bufferLayer');
    if (map.getSource('bufferSource')) map.removeSource('bufferSource');
}

// Function to initialize the aggregate tool button event listener
export function initAggregateTool(map) {
    const aggregateButton = document.getElementById('aggregateTool');
    aggregateButton.addEventListener('click', () => toggleAggregateTool(map));

    // Handle map click event for aggregation
    map.on('click', (e) => {
        if (aggregateToolEnabled) {
            handleAggregation(map, e.lngLat);
        }
    });
}

// Function to handle aggregation
function handleAggregation(map, lngLat) {
    const clickCoordinates = [lngLat.lng, lngLat.lat];
    const bufferRadius = parseFloat(document.getElementById('bufferSizeSelector').value);

    if (isNaN(bufferRadius) || bufferRadius <= 0) {
        console.error("Invalid buffer size selected.");
        return;
    }

    const buffer = turf.buffer(turf.point(clickCoordinates), bufferRadius, { units: 'kilometers' });

    if (!buffer || buffer.geometry.coordinates.length === 0) {
        console.error("Buffer generation failed.");
        return;
    }

    // Add the buffer to the map as a new layer
    clearBuffer(map);
    map.addSource('bufferSource', { type: 'geojson', data: buffer });
    map.addLayer({
        id: 'bufferLayer',
        type: 'fill',
        source: 'bufferSource',
        paint: {
            'fill-color': 'rgba(128, 128, 128, 0.5)',
            'fill-outline-color': 'black'
        }
    });

    let popupContent = `<div class="popup-table"><h3>Aggregated Data (${bufferRadius} km buffer)</h3>`;

     // 1. Aggregate brick kilns based on visibility
    let totalBrickKilns = 0;
    const brickKilnsLayers = ['BK_PK', 'BK_IND', 'BK_BAN', 'Brick_kilns_DRC', 'Brick_kilns_GHA', 'Brick_kilns_NGA', 'Brick_kilns_UGA'];
    
    brickKilnsLayers.forEach(layerId => {
        if (map.getLayer(layerId) && map.getLayoutProperty(layerId, 'visibility') === 'visible') {
            const features = map.queryRenderedFeatures({ layers: [layerId] });
            features.forEach(feature => {
                if (turf.booleanPointInPolygon(turf.point(feature.geometry.coordinates), buffer)) {
                    totalBrickKilns++;
                }
            });
        }
    });

    if (totalBrickKilns > 0) {
        popupContent += `<p>Brick Kilns: ${totalBrickKilns}</p>`;
    }
    console.log('Total Brick Kilns Count:', totalBrickKilns);
    


      // 2. Aggregate coal plants within the buffer
      let totalCoalEmissions = {
          nox: 0,
          so2: 0,
          pm10: 0,
          pm25: 0
      };
      let totalCoalPlants = 0;

      if (map.getLayer('coal')) {
          const coalVisibility = map.getLayoutProperty('coal', 'visibility');
          if (coalVisibility === 'visible') {
              const coalLayerFeatures = map.queryRenderedFeatures({ layers: ['coal'] });

              coalLayerFeatures.forEach((feature) => {
                  const coalPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon(coalPoint, buffer)) {
                      totalCoalEmissions.nox += feature.properties.nox_tn_y || 0;
                      totalCoalEmissions.so2 += feature.properties.so2_tn_y || 0;
                      totalCoalEmissions.pm10 += feature.properties.p10_tn_y || 0;
                      totalCoalEmissions.pm25 += feature.properties.p25_tn_y || 0;
                      totalCoalPlants++; // Count coal plants within the buffer
                  }
              });
          }
      }

      if (map.getLayer('coal_africa')) {
          const coalVisibility = map.getLayoutProperty('coal_africa', 'visibility');
          if (coalVisibility === 'visible') {
              const coalLayerFeatures = map.queryRenderedFeatures({ layers: ['coal_africa'] });

              coalLayerFeatures.forEach((feature) => {
                  const coalPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon(coalPoint, buffer)) {
                      totalCoalEmissions.nox += feature.properties.nox || 0;
                      totalCoalEmissions.so2 += feature.properties.sox || 0;
                      totalCoalEmissions.pm10 += feature.properties.pm10 || 0;
                      totalCoalEmissions.pm25 += feature.properties.pm25 || 0;
                      totalCoalPlants++; // Count coal plants within the buffer
                  }
              });

            
          }
      }

      // if (totalCoalPlants > 0) {
      //     popupContent += `<p>Coal Points: ${totalCoalPlants}</p>`;
      // }

      // 2. Aggregate cement IGP data within the buffer
      let cementIGPCount = 0;
      if (map.getLayer('cement_IGP')) {
          const  cementIGPVisibility = map.getLayoutProperty('cement_IGP', 'visibility');
          if ( cementIGPVisibility === 'visible') {
              const  cementIGPFeatures = map.queryRenderedFeatures({ layers: ['cement_IGP'] });

              cementIGPFeatures.forEach((feature) => {
                  const  cementIGPPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( cementIGPPoint, buffer)) {
                      cementIGPCount += 1;
                  }
              });

              // if ( cementIGPCount > 0) {
              //     popupContent += `<p>Cement Plants: ${ cementIGPCount}</p>`;
              // }
          }
      }


      // 3. Aggregate africa cement data within the buffer
      let cementAfricaCount = 0;
      if (map.getLayer('cement_africa')) {
          const cementAfricaVisibility = map.getLayoutProperty('cement_africa', 'visibility');
          if (cementAfricaVisibility === 'visible') {
              const cementAfricaFeatures = map.queryRenderedFeatures({ layers: ['cement_africa'] });

              cementAfricaFeatures.forEach((feature) => {
                  const cementAfricaPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon(cementAfricaPoint, buffer)) {
                      cementAfricaCount += 1;
                  }
              });

              // if (cementAfricaCount > 0) {
              //     popupContent += `<p>Cement Plants: ${cementAfricaCount}</p>`;
              // }
          }
      }

      // 4. Aggregate IGP paper pulp data within the buffer
      let paperPulpIGPCount = 0;
      if (map.getLayer('paper_pulp_IGP')) {
          const  paperPulpIGPVisibility = map.getLayoutProperty('paper_pulp_IGP', 'visibility');
          if ( paperPulpIGPVisibility === 'visible') {
              const  paperPulpIGPFeatures = map.queryRenderedFeatures({ layers: ['paper_pulp_IGP'] });

              paperPulpIGPFeatures.forEach((feature) => {
                  const  paperPulpIGPPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( paperPulpIGPPoint, buffer)) {
                      paperPulpIGPCount += 1;
                  }
              });

              // if ( paperPulpIGPCount > 0) {
              //     popupContent += `<p>Paper Pulp Plants: ${ paperPulpIGPCount}</p>`;
              // }
          }
      }

      // 5. Aggregate africa paper pulp data within the buffer
      let paperPulpAfricaCount = 0;
      if (map.getLayer('paper_pulp_africa')) {
          const  paperPulpAfricaVisibility = map.getLayoutProperty('paper_pulp_africa', 'visibility');
          if ( paperPulpAfricaVisibility === 'visible') {
              const  paperPulpAfricaFeatures = map.queryRenderedFeatures({ layers: ['paper_pulp_africa'] });

              paperPulpAfricaFeatures.forEach((feature) => {
                  const  paperPulpAfricaPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( paperPulpAfricaPoint, buffer)) {
                      paperPulpAfricaCount += 1;
                  }
              });

              if ( paperPulpAfricaCount > 0) {
                  popupContent += `<p>Paper Pulp Plants: ${ paperPulpAfricaCount}</p>`;
              }
          }
      }

      // 6. Aggregate africa steel plants data within the buffer
      let steelIGPCount = 0;
      if (map.getLayer('steel_IGP')) {
          const  steelIGPVisibility = map.getLayoutProperty('steel_IGP', 'visibility');
          if (steelIGPVisibility === 'visible') {
              const  steelIGPFeatures = map.queryRenderedFeatures({ layers: ['steel_IGP'] });

              steelIGPFeatures.forEach((feature) => {
                  const  steelIGPPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( steelIGPPoint, buffer)) {
                      steelIGPCount += 1;
                  }
              });

              // if ( steelIGPCount > 0) {
              //     popupContent += `<p>Steel Plants: ${ steelIGPCount}</p>`;
              // }
          }
      }

      // 7. Aggregate africa steel plants data within the buffer
      let steelAfricaCount = 0;
      if (map.getLayer('steel_africa')) {
          const  steelAfricaVisibility = map.getLayoutProperty('steel_africa', 'visibility');
          if (steelAfricaVisibility === 'visible') {
              const  steelAfricaFeatures = map.queryRenderedFeatures({ layers: ['steel_africa'] });

              steelAfricaFeatures.forEach((feature) => {
                  const  steelAfricaPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( steelAfricaPoint, buffer)) {
                      steelAfricaCount += 1;
                  }
              });

              // if ( steelAfricaCount > 0) {
              //     popupContent += `<p>Steel Plants: ${ steelAfricaCount}</p>`;
              // }
          }
      }

      // 8. Aggregate fossil fuel data within the buffer
      let fossilFuelCount = 0;
      if (map.getLayer('fossil')) {
          const fossilFuelVisibility = map.getLayoutProperty('fossil', 'visibility');
          if (fossilFuelVisibility === 'visible') {
              const fossilFuelLayerFeatures = map.queryRenderedFeatures({ layers: ['fossil'] });

              fossilFuelLayerFeatures.forEach((feature) => {
                  const fossilFuelPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon(fossilFuelPoint, buffer)) {
                      fossilFuelCount += 1;
                  }
              });

              // if (fossilFuelCount > 0) {
              //     popupContent += `<p>Fossil Fuel Points: ${fossilFuelCount}</p>`;
              // }
          }
      }

      // 9. Aggregate GPW data (population or area) within the buffer
      let totalPopulation = 0;
      let totalGPWPoints = 0;
      if (map.getLayer('gpw')) {
          const gpwVisibility = map.getLayoutProperty('gpw', 'visibility');
          if (gpwVisibility === 'visible') {
              const gpwLayerFeatures = map.queryRenderedFeatures({ layers: ['gpw'] });

              gpwLayerFeatures.forEach((feature) => {
                  const gpwPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon(gpwPoint, buffer)) {
                      totalPopulation += feature.properties.area_new || 0; // Sum the area values (replace with population if available)
                      totalGPWPoints++; // Count GPW points
                  }
              });

              // if (totalGPWPoints > 0) {
              //     popupContent += `<p>Total GPW Points: ${totalGPWPoints}</p>`;
              // }
          }
      }

      // 10. Aggregate africa steel plants data within the buffer
      let oilGasIGPCount = 0;
      if (map.getLayer('oil_gas_IGP')) {
          const  oilGasIGPVisibility = map.getLayoutProperty('oil_gas_IGP', 'visibility');
          if (oilGasIGPVisibility === 'visible') {
              const  oilGasIGPFeatures = map.queryRenderedFeatures({ layers: ['oil_gas_IGP'] });

              oilGasIGPFeatures.forEach((feature) => {
                  const  oilGasIGPPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( oilGasIGPPoint, buffer)) {
                      oilGasIGPCount += 1;
                  }
              });

              // if ( oilGasIGPCount > 0) {
              //     popupContent += `<p>Oil Gas Refineries: ${ oilGasIGPCount}</p>`;
              // }
          }
      }

      // 11. Aggregate africa steel plants data within the buffer
      let plasticWasteIGPCount = 0;
      if (map.getLayer('plastic_waste_IGP')) {
          const  plasticWasteIGPVisibility = map.getLayoutProperty('plastic_waste_IGP', 'visibility');
          if (plasticWasteIGPVisibility === 'visible') {
              const  plasticWasteIGPFeatures = map.queryRenderedFeatures({ layers: ['plastic_waste_IGP'] });

              plasticWasteIGPFeatures.forEach((feature) => {
                  const  plasticWasteIGPPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( plasticWasteIGPPoint, buffer)) {
                      plasticWasteIGPCount += 1;
                  }
              });

              // if ( plasticWasteIGPCount > 0) {
              //     popupContent += `<p>Plastic Waste Burning Sites: ${ plasticWasteIGPCount}</p>`;
              // }
          }
      }

      // 11. Aggregate africa steel plants data within the buffer
      let solidWasteIGPCount = 0;
      if (map.getLayer('solid_waste_IGP')) {
          const  solidWasteIGPVisibility = map.getLayoutProperty('solid_waste_IGP', 'visibility');
          if (solidWasteIGPVisibility === 'visible') {
              const  solidWasteIGPFeatures = map.queryRenderedFeatures({ layers: ['solid_waste_IGP'] });

              solidWasteIGPFeatures.forEach((feature) => {
                  const  solidWasteIGPPoint = turf.point(feature.geometry.coordinates);
                  if (turf.booleanPointInPolygon( solidWasteIGPPoint, buffer)) {
                      solidWasteIGPCount += 1;
                  }
              });

              // if ( solidWasteIGPCount > 0) {
              //     popupContent += `<p>Solid Waste Burning Sites: ${ solidWasteIGPCount}</p>`;
              // }
          }
      }

          // End the popup content and add canvas for the charts
              popupContent += `
              <canvas id="emissionsChart" width="250" height="250"></canvas>
              <canvas id="countsChart" width="250" height="250"></canvas>
              </div>
          `;
      

    // Show popup
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(popupContent)
        .addTo(map);

    // Generate charts after popup renders
    setTimeout(() => generateCharts(totalCoalEmissions, totalCoalPlants, totalBrickKilns, totalGPWPoints, fossilFuelCount,
        cementIGPCount,cementAfricaCount,paperPulpIGPCount,paperPulpAfricaCount, steelIGPCount, steelAfricaCount,oilGasIGPCount,
        plasticWasteIGPCount, solidWasteIGPCount
    ), 100);
}

// Function to generate charts
function generateCharts(totalCoalEmissions, totalCoalPlants, totalBrickKilns, totalGPWPoints, fossilFuelCount, cementIGPCount,cementAfricaCount,paperPulpIGPCount,paperPulpAfricaCount, steelIGPCount, steelAfricaCount,oilGasIGPCount,plasticWasteIGPCount, solidWasteIGPCount) {
    const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
    new Chart(emissionsCtx, {
        type: 'pie',
        data: {
            labels: ['NO₂', 'SO₂', 'PM₁₀', 'PM₂.₅'],
            datasets: [{
                label: 'Emissions (tons/year)',
                data: [
                    totalCoalEmissions.nox.toFixed(2),
                    totalCoalEmissions.so2.toFixed(2),
                    totalCoalEmissions.pm10.toFixed(2),
                    totalCoalEmissions.pm25.toFixed(2)
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)', // NO₂ color
                    'rgba(54, 162, 235, 0.6)', // SO₂ color
                    'rgba(255, 206, 86, 0.6)', // PM₁₀ color
                    'rgba(75, 192, 192, 0.6)'  // PM₂.₅ color
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Coal Emissions (tons/year)'
                }
            }
        }
    });

     // Map layer colors for different features
     const layerColors = {
        'Coal Plants': '#616161',
        'GPW Points': 'black',
        'Fossil Fuel Points': 'blue',
        'Cement IGP': 'purple',
        'Cement Africa': 'purple',  // Assuming same color as IGP for simplicity
        'Paper Pulp IGP': 'rgb(112, 206, 202)',
        'Paper Pulp Africa': 'rgb(112, 206, 202)',  // Assuming same color as IGP
        'Steel IGP': 'rgb(24, 54, 84)',
        'Steel Africa': 'rgb(24, 54, 84)',  // Assuming same color as IGP
        'Oil Gas Refineries': 'brown',
        'Plastic Waste': 'rgb(165, 146, 23)',
        'Solid Waste': 'rgb(206, 131, 19)'
    };

    // Prepare data for the Counts Chart by filtering non-zero counts
    const countsData = [
        { label: 'Coal Plants', value: totalCoalPlants },
        { label: 'GPW Points', value: totalGPWPoints },
        { label: 'Fossil Fuel Points', value: fossilFuelCount },
        { label: 'Cement IGP', value: cementIGPCount },
        { label: 'Cement Africa', value: cementAfricaCount },
        { label: 'Paper Pulp IGP', value: paperPulpIGPCount },
        { label: 'Paper Pulp Africa', value: paperPulpAfricaCount },
        { label: 'Steel IGP', value: steelIGPCount },
        { label: 'Steel Africa', value: steelAfricaCount },
        { label: 'Oil Gas Refineries', value: oilGasIGPCount },
        { label: 'Plastic Waste', value: plasticWasteIGPCount },
        { label: 'Solid Waste', value: solidWasteIGPCount }
    ].filter(entry => entry.value > 0);  // Filter out zero-count entries
    
    const countsLabels = countsData.map(entry => entry.label);
        const countsValues = countsData.map(entry => entry.value);
        const backgroundColors = countsLabels.map(label => layerColors[label]);
        const borderColors = countsLabels.map(label => layerColors[label]);
    
        // Counts Chart
        const countsCtx = document.getElementById('countsChart').getContext('2d');
        new Chart(countsCtx, {
            type: 'bar',
            data: {
                labels: countsLabels,
                datasets: [{
                    label: 'Counts',
                    data: countsValues,
                    backgroundColor: backgroundColors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.6)')),
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Counts for Selected Layers',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'none',
                    }
                }
            }
        });
}




