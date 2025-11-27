import { isAggregateToolEnabled } from './aggregateTool.js';
import { logLayerVisibility } from './layerVisibility.js';
import { hideLoadingSpinner, showLoadingSpinner } from './utils.js';

const layerIds = [
    'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'brick_kilns_PK_hex', 'brick_kilns_IND_hex', 'brick_kilns_BAN_hex', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
];

export let brickKilnPKLoaded = false;
export let brickKilnINDLoaded = false;
export let brickKilnBANLoaded = false;


function reportPoint(brickid, lng, lat) {
    const reportURL = 'https://forms.gle/ny9ebQhD4f4dkAXHA';
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

// Expose function to global scope for inline onclick handlers
window.reportPoint = reportPoint;

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
                                         <tr><td>Capacity</td><td>${properties['capacity_tonnes'] || '---'}</td></tr>
                                        <tr><td>PM<sub>10</sub></td><td>${properties['pm10_t_yr']}</td></tr>
                                        <tr><td>PM<sub>2.5</sub></td><td>${properties['pm25_t_yr']}</td></tr>
                                        <tr><td>NO<sub>2</sub></td><td>${properties['nox_t_yr']}</td></tr>
                                        <tr><td>SO<sub>2</sub></td><td>${properties['so2_t_yr']}</td></tr>
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
                    
                                         <tr><td>Capacity</td><td>${props['capacity_tonnes'] || '---'}</td></tr>
                                        <tr><td>PM<sub>10</sub></td><td>${props['pm10_t_yr']}</td></tr>
                                        <tr><td>PM<sub>2.5</sub></td><td>${props['pm25_t_yr']}</td></tr>
                                        <tr><td>NO<sub>2</sub></td><td>${props['nox_t_yr']}</td></tr>
                                        <tr><td>SO<sub>2</sub></td><td>${props['so2_t_yr']}</td></tr>
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
                                         <tr><td>Capacity</td><td>${props['capacity_tonnes'] || '---'}</td></tr>
                                        <tr><td>PM<sub>10</sub></td><td>${props['pm10_t_yr']}</td></tr>
                                        <tr><td>PM<sub>2.5</sub></td><td>${props['pm25_t_yr']}</td></tr>
                                        <tr><td>NO<sub>2</sub></td><td>${props['nox_t_yr']}</td></tr>
                                        <tr><td>SO<sub>2</sub></td><td>${props['so2_t_yr']}</td></tr>
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

