import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { isAggregateToolEnabled } from './aggregateTool.js';


let  brick_kilns_PK_hex, brick_kilns_IND_hex, brick_kilns_BAN_hex;
const layerIds = [
    'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
];

export let brickKilnPKLoaded = false;
export let brickKilnINDLoaded = false;
export let brickKilnBANLoaded = false;


export function loadBrickKilnLayerPKhex(map) {
    if (!map.getSource('brick_kilns_PK_hex')) {
        showLoadingSpinner(); // Show the spinner while loading

        // Fetch the brick kilns GeoJSON data and create a hexagonal grid
        fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_PAK_coal.geojson')
            .then(response => response.json())
            .then(data => {
                // Get the bounding box of the points
                const bbox = turf.bbox(data);

                // Generate the hexagonal grid
                const hexGrid = turf.hexGrid(bbox, 20, { units: 'kilometers' }); // 10 km hexagon size

                // Count points within each hexagon
                hexGrid.features.forEach(hex => {
                    const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
                    hex.properties.pointCount = pointsWithinHex.features.length;
                });

                // Add the hex grid as a source
                map.addSource('brick_kilns_PK_hex', {
                    type: 'geojson',
                    data: hexGrid
                });

                // Add the hexagonal grid as a fill layer
                map.addLayer({
                    'id': 'brick_kilns_PK',
                    'type': 'fill',
                    'source': 'brick_kilns_PK_hex',
                    'maxzoom': 12,
                    layout: {
                        visibility: 'visible'  // Make the grid visible immediately
                    },
                    'paint': {
                        'fill-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'pointCount'],
                            0, 'rgba(255,255,255,0)',
                            1, '#ffeda0',
                            10, '#feb24c',
                            50, '#f03b20'
                        ],
                        'fill-opacity': 0.7
                    }
                });

                // Wait for the map to become idle, meaning all sources and tiles have been loaded
                map.on('idle', function () {
                    if (map.getLayer('brick_kilns_PK') && map.getSource('brick_kilns_PK_hex')) {
                        hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Add a click event to display a popup with brick kiln density details
                    map.on('click', 'brick_kilns_PK', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;

                            // Prepare the popup content displaying only the density/count
                            const popupContent = `
                    <div class="popup-table">
                        <h3>Brick Kiln Density / 20 km</h3>
                        <table>
                            <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
                        </table>
                    </div>`;

                            // Display the popup
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }

                    });

                    // Change the cursor to pointer when hovering over the grid
                    map.on('mouseenter', 'brick_kilns_PK', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    // Reset the cursor when leaving the grid
                    map.on('mouseleave', 'brick_kilns_PK', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }

            })
            .catch(error => {
                console.error('Error loading Brick Kiln Hex data for Pakistan:', error);
                hideLoadingSpinner(); // Hide the spinner if there is an error
            });

    } else {
        map.setLayoutProperty('brick_kilns_PK', 'visibility', 'visible');
    }
}


export function loadBrickKilnLayerINDhex(map) {
    if (!map.getSource('brick_kilns_IND_hex')) {
        showLoadingSpinner();

        fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_IND_coal.geojson')
            .then(response => response.json())
            .then(data => {
                const bbox = turf.bbox(data);

                const hexGrid = turf.hexGrid(bbox, 20, { units: 'kilometers' });

                hexGrid.features.forEach(hex => {
                    const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
                    hex.properties.pointCount = pointsWithinHex.features.length;
                });

                map.addSource('brick_kilns_IND_hex', {
                    type: 'geojson',
                    data: hexGrid
                });

                map.addLayer({
                    'id': 'brick_kilns_IND',
                    'type': 'fill',
                    'source': 'brick_kilns_IND_hex',
                    'maxzoom': 12,
                    layout: {
                        visibility: 'visible' // Fix typo: should be 'visible'
                    },
                    'paint': {
                        'fill-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'pointCount'],
                            0, 'rgba(255,255,255,0)',
                            1, '#ffeda0',
                            10, '#feb24c',
                            50, '#f03b20'
                        ],
                        'fill-opacity': 0.7
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                // Wait for the map to become idle, meaning all sources and tiles have been loaded
                map.on('idle', function () {
                    if (map.getLayer('brick_kilns_IND') && map.getSource('brick_kilns_IND_hex')) {
                        hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
                    }
                });

                if (aggregateToolEnabled == false) {
                    // Add popup click event
                    map.on('click', 'brick_kilns_IND', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            const popupContent = `
                            <div class="popup-table">
                                <h3>Brick Kiln Density / 20 km</h3>
                                <table>
                                    <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
                                </table>
                            </div>`;

                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }

                    });

                    // Change cursor to pointer when hovering over the grid
                    map.on('mouseenter', 'brick_kilns_IND', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    map.on('mouseleave', 'brick_kilns_IND', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }



            }).catch(error => {
                console.error('Error loading Brick Kiln Hex data for India:', error);
                hideLoadingSpinner();
            });
    } else {
        map.setLayoutProperty('brick_kilns_IND', 'visibility', 'visible');
    }
}

export function loadBrickKilnLayerBANhex(map) {
    if (!map.getSource('brick_kilns_BAN_hex')) {
        showLoadingSpinner();

        fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_BAN_coal.geojson')
            .then(response => response.json())
            .then(data => {
                const bbox = turf.bbox(data);

                const hexGrid = turf.hexGrid(bbox, 20, { units: 'kilometers' });

                hexGrid.features.forEach(hex => {
                    const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
                    hex.properties.pointCount = pointsWithinHex.features.length;
                });

                map.addSource('brick_kilns_BAN_hex', {
                    type: 'geojson',
                    data: hexGrid
                });

                map.addLayer({
                    'id': 'brick_kilns_BAN',
                    'type': 'fill',
                    'source': 'brick_kilns_BAN_hex',
                    'maxzoom': 12,
                    layout: {
                        visibility: 'visible' // Fix typo: should be 'visible'
                    },
                    'paint': {
                        'fill-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'pointCount'],
                            0, 'rgba(255,255,255,0)',
                            1, '#ffeda0',
                            10, '#feb24c',
                            50, '#f03b20'
                        ],
                        'fill-opacity': 0.7
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });
                // Wait for the map to become idle, meaning all sources and tiles have been loaded
                map.on('idle', function () {
                    if (map.getLayer('brick_kilns_BAN') && map.getSource('brick_kilns_BAN_hex')) {
                        hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Add popup click event
                    map.on('click', 'brick_kilns_BAN', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            const popupContent = `
                        <div class="popup-table">
                            <h3>Brick Kiln Density / 20 km</h3>
                            <table>
                                <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
                            </table>
                        </div>`;

                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }

                    });

                    map.on('mouseenter', 'brick_kilns_BAN', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    map.on('mouseleave', 'brick_kilns_BAN', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }



            }).catch(error => {
                console.error('Error loading Brick Kiln Hex data for Bangladesh:', error);
                hideLoadingSpinner();
            });
    } else {
        map.setLayoutProperty('brick_kilns_BAN', 'visibility', 'visible');
    }
}


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

// Lazy load Pakistan Brick Kilns layer
export function loadBrickKilnLayerPK(map) {
    if (!map.getSource('bk_pk')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_PAK_coal.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_pk', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'BK_PK',
                    'type': 'circle',
                    'source': 'bk_pk',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_PK layer
                    map.on('click', 'BK_PK', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            const popupContent = `
                                <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                    <tr><th>Pollutant</th><td> tons/season</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties['pm10']}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties['pm25']}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties['nox']}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties['so2']}</td></tr>
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
                        }
                    });
                }


                brickKilnPKLoaded = true;
                logLayerVisibility(['BK_PK']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for Pakistan:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('BK_PK', 'visibility', 'visible');
    }
}

// Lazy load India's Brick Kilns layer
export function loadBrickKilnLayerIND(map) {
    if (!map.getSource('bk_ind')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_IND_coal.geojson ')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_ind', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'BK_IND',
                    'type': 'circle',
                    'source': 'bk_ind',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_IND layer
                    map.on('click', 'BK_IND', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                    <tr><th>Pollutant</th><td> tons/season</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties['pm10']}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties['pm25']}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties['nox']}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties['so2']}</td></tr>
                                </table>
                                    <button id="reportButton" onclick="reportPoint('${properties.id}', '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                        Report This Point
                                    </button>
                                </div>
                                    `)
                                .addTo(map);
                        }

                    });
                }


                brickKilnINDLoaded = true;
                logLayerVisibility(['BK_IND']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for India:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('BK_IND', 'visibility', 'visible');
    }
}

// Lazy load Bangladesh's Brick Kilns layer
export function loadBrickKilnLayerBAN(map) {
    if (!map.getSource('bk_ban')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_BAN_coal.geojson ')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_ban', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'BK_BAN',
                    'type': 'circle',
                    'source': 'bk_ban',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_BAN layer
                    map.on('click', 'BK_BAN', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                    <tr><th>Pollutant</th><td> tons/season</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties['pm10']}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties['pm25']}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties['nox']}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties['so2']}</td></tr>
                                </table>
                                    <button id="reportButton" onclick="reportPoint('${properties.id}', '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                        Report This Point
                                    </button>
                                </div>
                                    `)
                                .addTo(map);
                        }

                    });
                }


                brickKilnBANLoaded = true;
                logLayerVisibility(['BK_BAN']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for Bangladesh:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('BK_BAN', 'visibility', 'visible');
    }
}

// Lazy load DRC's Brick Kilns layer
export function loadBrickKilnLayerDRC(map) {
    if (!map.getSource('bk_drc')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/0b6eb6f902059d8f82bf8dad118ca901/raw/f331dc0d690283f4f1bbf65d5f632f25a960e636/Brick_kilns_DRC.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_drc', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'brick_kilns_DRC',
                    'type': 'circle',
                    'source': 'bk_drc',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_DRC', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(
                                    `
                                    <div class="popup-table">
                                        <h3>${properties.name}</h3>
                                        <table>
                                            <tr><th>Description</th></tr>
                                            <tr><td>${properties.query}</td></tr>
                                        </table>
                                        <button id="reportButton" onclick="reportPoint( '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                            Report This Point
                                        </button>
                                    </div>
                                    `)
                                .addTo(map);
                        }

                    });
                }


                brickKilnDRCLoaded = true;
                logLayerVisibility(['brick_kilns_DRC']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for DRC:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('brick_kilns_DRC', 'visibility', 'visible');
    }
}

// Lazy load Ghana's Brick Kilns layer
export function loadBrickKilnLayerGHA(map) {
    if (!map.getSource('bk_gha')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/afd4b57da73d01e87aed16c40435b265/raw/0ac4c732755089bf8a5e8f929494b78eba168407/Brick_kilns_GHA.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_gha', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'brick_kilns_GHA',
                    'type': 'circle',
                    'source': 'bk_gha',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_GHA', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                        <h3>${properties.name}</h3>
                                        <table>
                                            <tr><th>Description</th></tr>
                                            <tr><td>${properties.query}</td></tr>
                                        </table>
            

                                        <button id="reportButton" onclick="reportPoint( '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                            Report This Point
                                        </button>
                                    </div>
                                    `)
                                .addTo(map);
                        }

                    });
                }


                brickKilnGHALoaded = true;
                logLayerVisibility(['brick_kilns_GHA']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for Ghana:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('brick_kilns_GHA', 'visibility', 'visible');
    }
}


// Lazy load Nigeria's Brick Kilns layer
export function loadBrickKilnLayerNGA(map) {
    if (!map.getSource('bk_nga')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/60e33f59b421102d50ec291bc971a7ac/raw/f7c627d730122481dc0a321db1db26ae677ecfef/Brick_Kilns_NGA.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_nga', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'brick_kilns_NGA',
                    'type': 'circle',
                    'source': 'bk_nga',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_NGA', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                        <h3>${properties.name}</h3>
                                        <table>
                                            <tr><th>Description</th></tr>
                                            <tr><td>${properties.query}</td></tr>
                                        </table>
            

                                        <button id="reportButton" onclick="reportPoint( '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                            Report This Point
                                        </button>
                                    </div>
                                    `)
                                .addTo(map);
                        }

                    });
                }


                brickKilnNGALoaded = true;
                logLayerVisibility(['brick_kilns_NGA']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for Nigeria:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('brick_kilns_NGA', 'visibility', 'visible');
    }
}

// Lazy load Uganda's Brick Kilns layer
export function loadBrickKilnLayerUGA(map) {
    if (!map.getSource('bk_uga')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/1c8112ab0fb10ebc4f2e28970c6833c3/raw/67165a077349ddfc9ed5bb10efbde13dcc2bad96/Brick_Kilns_UGA.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('bk_uga', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'brick_kilns_UGA',
                    'type': 'circle',
                    'source': 'bk_uga',
                    'paint': {
                        'circle-radius': [
                            'interpolate',
                            ['linear'], // Interpolation method
                            ['zoom'],  // Based on zoom level
                            5, 2,      // At zoom level 5, circle size is 2
                            10, 5,     // At zoom level 10, circle size is 5
                            15, 10     // At zoom level 15, circle size is 10
                        ],
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white',
                        'fill-opacity': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!isAggregateToolEnabled()) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_UGA', (e) => {
                        if (!isAggregateToolEnabled()) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                        <h3>${properties.name}</h3>
                                        <table>
                                            <tr><th>Description</th></tr>
                                            <tr><td>${properties.query}</td></tr>
                                        </table>
            

                                        <button id="reportButton" onclick="reportPoint( '${e.lngLat.lon}', '${e.lngLat.lat}')">
                                            Report This Point
                                        </button>
                                    </div>
                                    `)
                                .addTo(map);
                        }

                    });
                }


                brickKilnUGALoaded = true;
                logLayerVisibility(['brick_kilns_UGA']); // Log the visibility
                hideLoadingSpinner(); // Hide the spinner when the layer is loaded
            })
            .catch(error => {
                console.error('Error loading Brick Kiln data for Uganda:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    } else {
        map.setLayoutProperty('brick_kilns_UGA', 'visibility', 'visible');
    }
}
