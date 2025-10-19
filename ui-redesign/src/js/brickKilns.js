import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { isAggregateToolEnabled } from './aggregateTool.js';
import { logLayerVisibility } from './layerVisibility.js';


let  brick_kilns_PK_hex, brick_kilns_IND_hex, brick_kilns_BAN_hex;
const layerIds = [
    'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'brick_kilns_PK_hex', 'brick_kilns_IND_hex', 'brick_kilns_BAN_hex', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
];

export let brickKilnPKLoaded = false;
export let brickKilnINDLoaded = false;
export let brickKilnBANLoaded = false;


function reportPoint(brickid, lng, lat) {
    const reportURL = 'https://forms.gle/cr2TzX3Fjt8bXVRv8';
    const params = `BrickID: ${brickid}, Longitude: ${lng}, Latitude: ${lat}`;

    // Copy parameters to the clipboard
    navigator.clipboard.writeText(params).then(() => {
        alert('Parameters copied to clipboard.');
        // Redirect to the report form
        window.open(reportURL, '_blank');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}


const layerStyles = {
  brickKiln: { 
    'circle-color': "rgba(255, 51, 64, 0.5)", 
    'circle-opacity': 1,
    'circle-stroke-color': "rgba(255, 51, 64, 1)",
    'circle-stroke-width': 0,
    // Zoom-based radius
    'circle-radius': [
      "interpolate",
      ["linear"],
      ["zoom"],
      2, 0.5,     // zoom 2 → radius 0.5
      6, 1,     // zoom 6 → radius 2
      10, 2,    // zoom 10 → radius 4
      14, 4,    // zoom 14 → radius 8
      18, 8    // zoom 18 → radius 16
    ]
  }
};


// Lazy load Pakistan Brick Kilns layer
export function loadBrickKilnLayerPK(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('brickKilnsPK')) {
            showLoadingSpinner(); // Show the spinner while loading

            fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_PAK_coal.geojson')
                .then(response => response.json())
                .then(data => {
                    // Add source if it doesn't exist
                    if (!map.getSource('brickKilnsPK')) {
                        map.addSource('brickKilnsPK', { type: 'geojson', data });
                    } else {
                        map.getSource('brickKilnsPK').setData(data); // update data if needed
                    }

                    // Add layer if it doesn't exist
                    if (!map.getLayer('brick_kilns_PK')) {
                        map.addLayer({
                            id: 'brick_kilns_PK',
                            type: 'circle',
                            source: 'brickKilnsPK',
                            paint: {
                                ...layerStyles.brickKiln
                            },
                            layout: {
                                visibility: 'visible'
                            }
                        });
                    } else {
                        map.setLayoutProperty('brick_kilns_PK', 'visibility', 'visible');
                    }

                    // Setup popup if tool not enabled
                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_PK', (e) => {
                            const properties = e.features[0].properties;
                            const popupContent = `
                                <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                        <tr><th>Pollutant</th><td> tons/season</td></tr>
                                        <tr><td>PM<sub>10</sub></td><td>${properties['pm10']}</td></tr>
                                        <tr><td>PM<sub>2.5</sub></td><td>${properties['pm25']}</td></tr>
                                        <tr><td>NO<sub>2</sub></td><td>${properties['nox']}</td></tr>
                                        <tr><td>SO<sub>2</sub></td><td>${properties['so2']}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${properties.id}', '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                        Report This Point
                                    </button>
                                </div>
                            `;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_PK']); // Log the visibility
                    hideLoadingSpinner(); // Hide spinner
                    resolve(); // ✅ Resolve promise when done
                })
                .catch(error => {
                    console.error('Error loading Brick Kiln data for Pakistan:', error);
                    hideLoadingSpinner();
                    reject(error); // ✅ Reject promise on error
                });
        } else {
            map.setLayoutProperty('brick_kilns_PK', 'visibility', 'visible');
            resolve(); // ✅ Already loaded, resolve immediately
        }
    });
}


// Lazy load India's Brick Kilns layer
export function loadBrickKilnLayerIND(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('brickKilnsIND')) {
            showLoadingSpinner();

            fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_IND_coal.geojson')
                .then(response => response.json())
                .then(data => {
                    if (!map.getSource('brickKillnsIND')) {
                        map.addSource('brickKillnsIND', { type: 'geojson', data });
                    } else {
                        map.getSource('brickKillnsIND').setData(data);
                    }

                    if (!map.getLayer('brick_kilns_IND')) {
                        map.addLayer({
                            id: 'brick_kilns_IND',
                            type: 'circle',
                            source: 'brickKillnsIND',
                            paint: { ...layerStyles.brickKiln },
                            layout: { visibility: 'visible' }
                        });
                    } else {
                        map.setLayoutProperty('brick_kilns_IND', 'visibility', 'visible');
                    }

                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_IND', (e) => {
                            const props = e.features[0].properties;
                            const popupHTML = `
                                <div class="popup-table">
                                    <h3>${props.id}</h3>
                                    <table>
                                        <tr><td>Pollutant</td><td> tons/season</td></tr>
                                        <tr><td>PM<sub>10</sub></td><td>${props['pm10']}</td></tr>
                                        <tr><td>PM<sub>2.5</sub></td><td>${props['pm25']}</td></tr>
                                        <tr><td>NO<sub>2</sub></td><td>${props['nox']}</td></tr>
                                        <tr><td>SO<sub>2</sub></td><td>${props['so2']}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${props.id}', '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                        Report This Point
                                    </button>
                                </div>
                            `;
                            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_IND']);
                    hideLoadingSpinner();
                    resolve();
                })
                .catch(err => {
                    console.error('Error loading Brick Kiln data for India:', err);
                    hideLoadingSpinner();
                    reject(err);
                });
        } else {
            map.setLayoutProperty('brick_kilns_IND', 'visibility', 'visible');
            resolve();
        }
    });
}

// Lazy load Bangladesh's Brick Kilns layer
export function loadBrickKilnLayerBAN(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('brickKilnsBAN')) {
            showLoadingSpinner();

            fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_BAN_coal.geojson')
                .then(response => response.json())
                .then(data => {
                    if (!map.getSource('brickKilnsBAN')) {
                        map.addSource('brickKilnsBAN', { type: 'geojson', data });
                    } else {
                        map.getSource('brickKilnsBAN').setData(data);
                    }

                    if (!map.getLayer('brick_kilns_BAN')) {
                        map.addLayer({
                            id: 'brick_kilns_BAN',
                            type: 'circle',
                            source: 'brickKilnsBAN',
                            paint: { ...layerStyles.brickKiln },
                            layout: { visibility: 'visible' }
                        });
                    } else {
                        map.setLayoutProperty('brick_kilns_BAN', 'visibility', 'visible');
                    }

                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_BAN', (e) => {
                            const props = e.features[0].properties;
                            const popupHTML = `
                                <div class="popup-table">
                                    <h3>${props.id}</h3>
                                    <table>
                                        <tr><td>Pollutant</td><td> tons/season</td></tr>
                                        <tr><td>PM<sub>10</sub></td><td>${props['pm10']}</td></tr>
                                        <tr><td>PM<sub>2.5</sub></td><td>${props['pm25']}</td></tr>
                                        <tr><td>NO<sub>2</sub></td><td>${props['nox']}</td></tr>
                                        <tr><td>SO<sub>2</sub></td><td>${props['so2']}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${props.id}', '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                        Report This Point
                                    </button>
                                </div>
                            `;
                            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_BAN']);
                    hideLoadingSpinner();
                    resolve();
                })
                .catch(err => {
                    console.error('Error loading Brick Kiln data for Bangladesh:', err);
                    hideLoadingSpinner();
                    reject(err);
                });
        } else {
            map.setLayoutProperty('brick_kilns_BAN', 'visibility', 'visible');
            resolve();
        }
    });
}

// Lazy load DRC's Brick Kilns layer
export function loadBrickKilnLayerDRC(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('bk_drc')) {
            showLoadingSpinner();
            fetch('https://gist.githubusercontent.com/Mseher/0b6eb6f902059d8f82bf8dad118ca901/raw/f331dc0d690283f4f1bbf65d5f632f25a960e636/Brick_kilns_DRC.geojson')
                .then(res => res.json())
                .then(data => {
                    if (!map.getSource('bk_drc')) map.addSource('bk_drc', { type: 'geojson', data });
                    else map.getSource('bk_drc').setData(data);

                    if (!map.getLayer('brick_kilns_DRC')) {
                        map.addLayer({
                            id: 'brick_kilns_DRC',
                            type: 'circle',
                            source: 'bk_drc',
                            paint: { ...layerStyles.brickKiln },
                            layout: { visibility: 'visible' }
                        });
                    } else map.setLayoutProperty('brick_kilns_DRC', 'visibility', 'visible');

                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_DRC', (e) => {
                            const props = e.features[0].properties;
                            const popupHTML = `
                                <div class="popup-table">
                                    <h3>${props.name}</h3>
                                    <table>
                                        <tr><td>Description</td></tr>
                                        <tr><td>${props.query}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${e.lngLat.lon}', '${e.lngLat.lat}')">Report This Point</button>
                                </div>
                            `;
                            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_DRC']);
                    hideLoadingSpinner();
                    resolve();
                })
                .catch(err => {
                    console.error('Error loading Brick Kiln data for DRC:', err);
                    hideLoadingSpinner();
                    reject(err);
                });
        } else {
            map.setLayoutProperty('brick_kilns_DRC', 'visibility', 'visible');
            resolve();
        }
    });
}

// Lazy load Ghana's Brick Kilns layer
export function loadBrickKilnLayerGHA(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('bk_gha')) {
            showLoadingSpinner();
            fetch('https://gist.githubusercontent.com/Mseher/afd4b57da73d01e87aed16c40435b265/raw/0ac4c732755089bf8a5e8f929494b78eba168407/Brick_kilns_GHA.geojson')
                .then(res => res.json())
                .then(data => {
                    if (!map.getSource('bk_gha')) map.addSource('bk_gha', { type: 'geojson', data });
                    else map.getSource('bk_gha').setData(data);

                    if (!map.getLayer('brick_kilns_GHA')) {
                        map.addLayer({
                            id: 'brick_kilns_GHA',
                            type: 'circle',
                            source: 'bk_gha',
                            paint: { ...layerStyles.brickKiln },
                            layout: { visibility: 'visible' }
                        });
                    } else map.setLayoutProperty('brick_kilns_GHA', 'visibility', 'visible');

                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_GHA', (e) => {
                            const props = e.features[0].properties;
                            const popupHTML = `
                                <div class="popup-table">
                                    <h3>${props.name}</h3>
                                    <table>
                                        <tr><th>Description</th></tr>
                                        <tr><td>${props.query}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${e.lngLat.lon}', '${e.lngLat.lat}')">Report This Point</button>
                                </div>
                            `;
                            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_GHA']);
                    hideLoadingSpinner();
                    resolve();
                })
                .catch(err => {
                    console.error('Error loading Brick Kiln data for Ghana:', err);
                    hideLoadingSpinner();
                    reject(err);
                });
        } else {
            map.setLayoutProperty('brick_kilns_GHA', 'visibility', 'visible');
            resolve();
        }
    });
}

// Lazy load Nigeria's Brick Kilns layer
export function loadBrickKilnLayerNGA(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('bk_nga')) {
            showLoadingSpinner();
            fetch('https://gist.githubusercontent.com/Mseher/60e33f59b421102d50ec291bc971a7ac/raw/f7c627d730122481dc0a321db1db26ae677ecfef/Brick_Kilns_NGA.geojson')
                .then(res => res.json())
                .then(data => {
                    if (!map.getSource('bk_nga')) map.addSource('bk_nga', { type: 'geojson', data });
                    else map.getSource('bk_nga').setData(data);

                    if (!map.getLayer('brick_kilns_NGA')) {
                        map.addLayer({
                            id: 'brick_kilns_NGA',
                            type: 'circle',
                            source: 'bk_nga',
                            paint: { ...layerStyles.brickKiln },
                            layout: { visibility: 'visible' }
                        });
                    } else map.setLayoutProperty('brick_kilns_NGA', 'visibility', 'visible');

                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_NGA', (e) => {
                            const props = e.features[0].properties;
                            const popupHTML = `
                                <div class="popup-table">
                                    <h3>${props.name}</h3>
                                    <table>
                                        <tr><th>Description</th></tr>
                                        <tr><td>${props.query}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${e.lngLat.lon}', '${e.lngLat.lat}')">Report This Point</button>
                                </div>
                            `;
                            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_NGA']);
                    hideLoadingSpinner();
                    resolve();
                })
                .catch(err => {
                    console.error('Error loading Brick Kiln data for Nigeria:', err);
                    hideLoadingSpinner();
                    reject(err);
                });
        } else {
            map.setLayoutProperty('brick_kilns_NGA', 'visibility', 'visible');
            resolve();
        }
    });
}

// Lazy load Uganda's Brick Kilns layer
export function loadBrickKilnLayerUGA(map) {
    return new Promise((resolve, reject) => {
        if (!map.getSource('bk_uga')) {
            showLoadingSpinner();
            fetch('https://gist.githubusercontent.com/Mseher/1c8112ab0fb10ebc4f2e28970c6833c3/raw/67165a077349ddfc9ed5bb10efbde13dcc2bad96/Brick_Kilns_UGA.geojson')
                .then(res => res.json())
                .then(data => {
                    if (!map.getSource('bk_uga')) map.addSource('bk_uga', { type: 'geojson', data });
                    else map.getSource('bk_uga').setData(data);

                    if (!map.getLayer('brick_kilns_UGA')) {
                        map.addLayer({
                            id: 'brick_kilns_UGA',
                            type: 'circle',
                            source: 'bk_uga',
                            paint: { ...layerStyles.brickKiln },
                            layout: { visibility: 'visible' }
                        });
                    } else map.setLayoutProperty('brick_kilns_UGA', 'visibility', 'visible');

                    if (!isAggregateToolEnabled()) {
                        map.on('click', 'brick_kilns_UGA', (e) => {
                            const props = e.features[0].properties;
                            const popupHTML = `
                                <div class="popup-table">
                                    <h3>${props.name}</h3>
                                    <table>
                                        <tr><th>Description</th></tr>
                                        <tr><td>${props.query}</td></tr>
                                    </table>
                                    <button id="reportButton" onclick="reportPoint('${e.lngLat.lon}', '${e.lngLat.lat}')">Report This Point</button>
                                </div>
                            `;
                            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                        });
                    }

                    logLayerVisibility(map, ['brick_kilns_UGA']);
                    hideLoadingSpinner();
                    resolve();
                })
                .catch(err => {
                    console.error('Error loading Brick Kiln data for Uganda:', err);
                    hideLoadingSpinner();
                    reject(err);
                });
        } else {
            map.setLayoutProperty('brick_kilns_UGA', 'visibility', 'visible');
            resolve();
        }
    });
}

// export function loadBrickKilnLayerPKhex(map) {
//     if (!map.getSource('brickKilnsPKHex')) {
//         showLoadingSpinner(); // Show the spinner while loading

//         // Fetch the brick kilns GeoJSON data and create a hexagonal grid
//         fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_PAK_coal.geojson')
//             .then(response => response.json())
//             .then(data => {
//                 // Get the bounding box of the points
//                 const bbox = turf.bbox(data);

//                 // Generate the hexagonal grid
//                 const hexGrid = turf.hexGrid(bbox, 15, { units: 'kilometers' }); // 10 km hexagon size

//                 // Count points within each hexagon
//                 hexGrid.features.forEach(hex => {
//                     const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
//                     hex.properties.pointCount = pointsWithinHex.features.length;
//                 });

//                 // Add the hex grid as a source
//                 map.addSource('brickKilnsPKHex', {
//                     type: 'geojson',
//                     data: hexGrid
//                 });

//                 // Add the hexagonal grid as a fill layer
//                 map.addLayer({
//                     'id': 'brick_kilns_PK_hex',
//                     'type': 'fill',
//                     'source': 'brickKilnsPKHex',
//                     'maxzoom': 12,
//                     layout: {
//                         visibility: 'visible'  // Make the grid visible immediately
//                     },
//                     'paint': {
//                         'fill-color': [
//                             'interpolate',
//                             ['linear'],
//                             ['get', 'pointCount'],
//                             0, 'rgba(255,255,178,0)',
//                             10, 'rgba(255,255,178,0.3)',
//                             20, 'rgb(254,229,132)',
//                             30, 'rgb(254,204,92)',
//                             50, 'rgb(253,174,64)',
//                             100, 'rgb(253,141,60)',
//                             150, 'rgb(252,78,42)',
//                             200, 'rgb(240,59,32)',
//                             250, 'rgb(220,30,30)',
//                             300, 'rgb(189,0,38)',
//                             350, 'rgb(140,0,30)',
//                             400, 'rgb(100,0,20)'
//                             ],
//                         'fill-opacity': 0.7,

//                     },
//                 });

//                 // Wait for the map to become idle, meaning all sources and tiles have been loaded
//                 map.on('idle', function () {
//                     if (map.getLayer('brickKilnsPKHex') && map.getSource('brickKilnsPKHex')) {
//                         hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
//                     }
//                 });

//                 if (!isAggregateToolEnabled()) {
//                     // Add a click event to display a popup with brick kiln density details
//                     map.on('click', 'brick_kilns_PK_hex', (e) => {
//                         if (!isAggregateToolEnabled()) {
//                             const properties = e.features[0].properties;

//                             // Prepare the popup content displaying only the density/count
//                             const popupContent = `
//                     <div class="popup-table">
//                         <h3>Brick Kiln Density / 15km</h3>
//                         <table>
//                             <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
//                         </table>
//                     </div>`;

//                             // Display the popup
//                             new mapboxgl.Popup()
//                                 .setLngLat(e.lngLat)
//                                 .setHTML(popupContent)
//                                 .addTo(map);
//                         }

//                     });

//                     // Change the cursor to pointer when hovering over the grid
//                     map.on('mouseenter', 'brick_kilns_PK_hex', () => {
//                         map.getCanvas().style.cursor = 'pointer';
//                     });

//                     // Reset the cursor when leaving the grid
//                     map.on('mouseleave', 'brick_kilns_PK_hex', () => {
//                         map.getCanvas().style.cursor = '';
//                     });
//                 }

//             })
//             .catch(error => {
//                 console.error('Error loading Brick Kiln Hex data for Pakistan:', error);
//                 hideLoadingSpinner(); // Hide the spinner if there is an error
//             });

//     } else {
//         map.setLayoutProperty('brick_kilns_PK_hex', 'visibility', 'visible');
//     }
// }


// export function loadBrickKilnLayerINDhex(map) {
//     if (!map.getSource('brickKilnsINDHex')) {
//         showLoadingSpinner();

//         fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_IND_coal.geojson')
//             .then(response => response.json())
//             .then(data => {
//                 const bbox = turf.bbox(data);

//                 const hexGrid = turf.hexGrid(bbox, 15, { units: 'kilometers' });

//                 hexGrid.features.forEach(hex => {
//                     const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
//                     hex.properties.pointCount = pointsWithinHex.features.length;
//                 });

//                 map.addSource('brickKilnsINDHex', {
//                     type: 'geojson',
//                     data: hexGrid
//                 });

//                 map.addLayer({
//                     'id': 'brick_kilns_IND_hex',
//                     'type': 'fill',
//                     'source': 'brickKilnsINDHex',
//                     'maxzoom': 12,
//                     layout: {
//                         visibility: 'visible' // Fix typo: should be 'visible'
//                     },
//                     'paint': {
//                         'fill-color': [
//                             'interpolate',
//                             ['linear'],
//                             ['get', 'pointCount'],
//                             0, 'rgba(255,255,178,0)',
//                             10, 'rgba(255,255,178,0.3)',
//                             20, 'rgb(254,229,132)',
//                             30, 'rgb(254,204,92)',
//                             50, 'rgb(253,174,64)',
//                             100, 'rgb(253,141,60)',
//                             150, 'rgb(252,78,42)',
//                             200, 'rgb(240,59,32)',
//                             250, 'rgb(220,30,30)',
//                             300, 'rgb(189,0,38)',
//                             350, 'rgb(140,0,30)',
//                             400, 'rgb(100,0,20)'
//                             ],
//                         'fill-opacity': 0.7,

//                     },
//                     layout: {
//                         visibility: 'visible'
//                     }
//                 });

//                 // Wait for the map to become idle, meaning all sources and tiles have been loaded
//                 map.on('idle', function () {
//                     if (map.getLayer('brick_kilns_IND_hex') && map.getSource('brickKilnsINDHex')) {
//                         hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
//                     }
//                 });

//                 if (!isAggregateToolEnabled()) {
//                     // Add popup click event
//                     map.on('click', 'brick_kilns_IND_hex', (e) => {
//                         if (!isAggregateToolEnabled()) {
//                             const properties = e.features[0].properties;
//                             const popupContent = `
//                             <div class="popup-table">
//                                 <h3>Brick Kiln Density / 15km</h3>
//                                 <table>
//                                     <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
//                                 </table>
//                             </div>`;

//                             new mapboxgl.Popup()
//                                 .setLngLat(e.lngLat)
//                                 .setHTML(popupContent)
//                                 .addTo(map);
//                         }

//                     });

//                     // Change cursor to pointer when hovering over the grid
//                     map.on('mouseenter', 'brick_kilns_IND_hex', () => {
//                         map.getCanvas().style.cursor = 'pointer';
//                     });

//                     map.on('mouseleave', 'brick_kilns_IND_hex', () => {
//                         map.getCanvas().style.cursor = '';
//                     });
//                 }



//             }).catch(error => {
//                 console.error('Error loading Brick Kiln Hex data for India:', error);
//                 hideLoadingSpinner();
//             });
//     } else {
//         map.setLayoutProperty('brick_kilns_IND_hex', 'visibility', 'visible');
//     }
// }

// export function loadBrickKilnLayerBANhex(map) {
//     if (!map.getSource('brickKilnsBANHex')) {
//         showLoadingSpinner();

//         fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_BAN_coal.geojson')
//             .then(response => response.json())
//             .then(data => {
//                 const bbox = turf.bbox(data);

//                 const hexGrid = turf.hexGrid(bbox, 15, { units: 'kilometers' });

//                 hexGrid.features.forEach(hex => {
//                     const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
//                     hex.properties.pointCount = pointsWithinHex.features.length;
//                 });

//                 map.addSource('brickKilnsBANHex', {
//                     type: 'geojson',
//                     data: hexGrid
//                 });

//                 map.addLayer({
//                     'id': 'brick_kilns_BAN_hex',
//                     'type': 'fill',
//                     'source': 'brickKilnsBANHex',
//                     'maxzoom': 12,
//                     layout: {
//                         visibility: 'visible' // Fix typo: should be 'visible'
//                     },
//                     'paint': {
//                         'fill-color': [
//                             'interpolate',
//                             ['linear'],
//                             ['get', 'pointCount'],
//                             0, 'rgba(255,255,178,0)',
//                             10, 'rgba(255,255,178,0.3)',
//                             20, 'rgb(254,229,132)',
//                             30, 'rgb(254,204,92)',
//                             50, 'rgb(253,174,64)',
//                             100, 'rgb(253,141,60)',
//                             150, 'rgb(252,78,42)',
//                             200, 'rgb(240,59,32)',
//                             250, 'rgb(220,30,30)',
//                             300, 'rgb(189,0,38)',
//                             350, 'rgb(140,0,30)',
//                             400, 'rgb(100,0,20)'
//                             ],
//                         'fill-opacity': 0.9,

//                     },
//                     layout: {
//                         visibility: 'visible'
//                     }
//                 });
//                 // Wait for the map to become idle, meaning all sources and tiles have been loaded
//                 map.on('idle', function () {
//                     if (map.getLayer('brick_kilns_BAN_hex') && map.getSource('brickKilnsBANHex')) {
//                         hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
//                     }
//                 });

//                 if (!isAggregateToolEnabled()) {
//                     // Add popup click event
//                     map.on('click', 'brick_kilns_BAN_hex', (e) => {
//                         if (!isAggregateToolEnabled()) {
//                             const properties = e.features[0].properties;
//                             const popupContent = `
//                         <div class="popup-table">
//                             <h3>Brick Kiln Density / 15km</h3>
//                             <table>
//                                 <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
//                             </table>
//                         </div>`;

//                             new mapboxgl.Popup()
//                                 .setLngLat(e.lngLat)
//                                 .setHTML(popupContent)
//                                 .addTo(map);
//                         }

//                     });

//                     map.on('mouseenter', 'brick_kilns_BAN_hex', () => {
//                         map.getCanvas().style.cursor = 'pointer';
//                     });

//                     map.on('mouseleave', 'brick_kilns_BAN_hex', () => {
//                         map.getCanvas().style.cursor = '';
//                     });
//                 }



//             }).catch(error => {
//                 console.error('Error loading Brick Kiln Hex data for Bangladesh:', error);
//                 hideLoadingSpinner();
//             });
//     } else {
//         map.setLayoutProperty('brick_kilns_BAN_hex', 'visibility', 'visible');
//     }
// }