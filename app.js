

// -----------------------------------------------------------MAP INITIALIZATION-----------------------------------------------------------


mapboxgl.accessToken = 'pk.eyJ1IjoibXVoYW1tYWQtYmlsYWw3NjMiLCJhIjoiY2w1NzA1NW90MDF4ZDNkbG9iYTUxeGdveiJ9.XSisxZKgp-ZzmgWWoy4WhA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [78.8181577, 28.7650135], // starting position
    zoom: 4 // starting zoom
});

// Add navigation control (zoom and rotation) to the top-right corner
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

let populationLayer, fossilFuelLayer, coalLayer, gpwLayer, pollutantLayer, boundaryLayer, brick_kilns_PK_hex, brick_kilns_IND_hex, brick_kilns_BAN_hex ;

const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const legendButton = document.getElementById('legendButton');
const legend = document.getElementById('legend');
const filterButton = document.getElementById('filtersearch');
const filterPanel = document.getElementById('filterPanel');



// -------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------


// -----------------------------------------------------------LAYERS LOADING-----------------------------------------------------------

// Reusable function to add data layers
function addDataLayers() {
    // Population raster layer
    if (!map.getSource('population')) {
        map.addSource('population', {
            'type': 'raster',
            'url': 'mapbox://muhammad-bilal763.bra3hxpk'
        });
        populationLayer = map.addLayer({
            'id': 'population',
            'source': 'population',
            'type': 'raster',
            layout: {
                visibility: 'none' // Initial visibility
            }
        });
    }

    // Fossil fuel layer
    if (!map.getSource('fossil_fuel')) {
        map.addSource('fossil_fuel', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/bilalpervaiz/597c50eff1747c1a3c8c948bef6ccc19/raw/6984d3a37d75dc8ca7489ee031377b2d57da67d2/fossil_fuel.geojson'
        });
        fossilFuelLayer = map.addLayer({
            'id': 'fossil',
            'type': 'circle',
            'source': 'fossil_fuel',
            'paint': {
                'circle-radius': 5,
                'circle-stroke-width': 2,
                'circle-color': 'blue',
                'circle-stroke-color': 'white'
            },
            layout: {
                visibility: 'none'
            }
        });

        // Popup for fossil fuel layer
        map.on('click', 'fossil', (e) => {
            const properties = e.features[0].properties;
            const cleanedOriginalI = properties.original_i.replace(/{|}/g, '');
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<div class="popup-table"><h3>${cleanedOriginalI}</h3></div>`)
                .addTo(map);
        });
    }

    // Add the source for the Coal IGP layer (without clustering)
    if (!map.getSource('coal_IGP')) {
        map.addSource('coal_IGP', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/Mseher/f1608007d5c4d041a8d67496e30b7458/raw/33e4507a54439aeba9889eb7fb39d2614fc1ba66/IGP_Coal_Plants.geojson',
        });



        coalLayer = map.addLayer({
            'id': 'coal',
            'type': 'circle',
            'source': 'coal_IGP',
            'paint': {
                'circle-radius': 7,
                'circle-stroke-width': 2,
                'circle-color': '#616161',  // Add # for hex color
                'circle-stroke-color': 'white'
            }
        });

        // Popup for the coal layer
        map.on('click', 'coal', (e) => {  // Use 'coal' as the layer ID
            const properties = e.features[0].properties;
            const popupContent = `
                <div class="popup-table">
                    <h3>${properties.plnt_nm}, ${properties.country}</h3>
                    <table>
                        <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                        <tr><th>PM<sub>10</sub></th><td>${properties.p10_tn_}</td></tr>
                        <tr><th>PM<sub>2.5</sub></th><td>${properties.p25_tn_}</td></tr>
                        <tr><th>NO<sub>2</sub></th><td>${properties.nx_tn_y}</td></tr>
                        <tr><th>SO<sub>2</sub></th><td>${properties.sx_tn_y}</td></tr>
                    </table>
                </div>
            `;
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
        });
    }

    // GPW layer
    if (!map.getSource('GPW')) {
        map.addSource('GPW', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/bilalpervaiz/e2c93d2017fc1ed90f9a6d5259701a5e/raw/4dd19fe557d29b9268f11e233169948e95c24803/GPW.geojson'
        });
        gpwLayer = map.addLayer({
            'id': 'GP',
            'type': 'circle',
            'source': 'GPW',
            'paint': {
                'circle-radius': 5,
                'circle-stroke-width': 2,
                'circle-color': 'black',
                'circle-stroke-color': 'white'
            },
            layout: {
                visibility: 'none'
            }
        });

        // Popup for GPW layer
        map.on('click', 'GP', (e) => {
            const properties = e.features[0].properties;
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<div class="popup-table"><h3>${properties.name}</h3></div>`)
                .addTo(map);
        });
    }

    // Indian plain layer
    if (!map.getSource('indian_plain')) {
        map.addSource('indian_plain', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/Mseher/d2fe2c380fc19ab797d17c0116b11876/raw/3c37088e53623fcc8c9479159ad0fe8c6b89ed3f/IGP_boundary.geojson'
        });
        boundaryLayer = map.addLayer({
            'id': 'indian',
            'type': 'line',
            'source': 'indian_plain',
            'paint': {
                'line-color': 'black',
                'line-width': 1
            }
        });
    }

    // Pollutant decay heatmap layer
    if (!map.getSource('pollutant_decay')) {
        map.addSource('pollutant_decay', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/bilalpervaiz/97a2ce64252ad5a095c9222f4c9ae5b1/raw/4fcc0590f9b28e13a369fb93f4f0ff00410844a6/pollutant_decay.geojson'
        });
        pollutantLayer = map.addLayer({
            'id': 'pollutant',
            'type': 'heatmap',
            'source': 'pollutant_decay',
            'maxzoom': 12,
            layout: {
                visibility: 'none'
            },
            'paint': {
                'heatmap-weight': {
                    'property': 'decay_PM10_1',
                    'type': 'exponential',
                    'stops': [
                        [0.030291835876543865, 0],
                        [3.332101946419825, 1]
                    ]
                },
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(255,255,178,0)',
                    0.2, 'rgb(254,204,92)',
                    0.4, 'rgb(253,141,60)',
                    0.6, 'rgb(240,59,32)',
                    0.8, 'rgb(189,0,38)'
                ],
                'heatmap-radius': {
                    'stops': [
                        [11, 15],
                        [15, 20]
                    ]
                },
                'heatmap-opacity': {
                    'default': 1,
                    'stops': [
                        [14, 1],
                        [15, 0]
                    ]
                }
            }
        });
    }

   
    

    
}


function loadBrickKilnLayerPKhex() {
    if (!map.getSource('brick_kilns_PK_hex')) {
        showLoadingSpinner(); // Show the spinner while loading

        // Fetch the brick kilns GeoJSON data and create a hexagonal grid
        fetch('https://gist.githubusercontent.com/Mseher/ff38ecf6b4b365bfbaf1de99506685a3/raw/9907737c8ff94dbc896286df6fcf975307e538d6/brick_kilns_PK.geojson')
            .then(response => response.json())
            .then(data => {
                // Get the bounding box of the points
                const bbox = turf.bbox(data);

                // Generate the hexagonal grid
                const hexGrid = turf.hexGrid(bbox, 10, { units: 'kilometers' }); // 10 km hexagon size

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

                // Add a click event to display a popup with brick kiln density details
                map.on('click', 'brick_kilns_PK', (e) => {
                    const properties = e.features[0].properties;

                    // Prepare the popup content displaying only the density/count
                    const popupContent = `
                    <div class="popup-table">
                        <h3>Brick Kiln Density / 10 km</h3>
                        <table>
                            <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
                        </table>
                    </div>`;

                    // Display the popup
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                // Change the cursor to pointer when hovering over the grid
                map.on('mouseenter', 'brick_kilns_PK', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Reset the cursor when leaving the grid
                map.on('mouseleave', 'brick_kilns_PK', () => {
                    map.getCanvas().style.cursor = '';
                });
            })
            .catch(error => {
                console.error('Error loading Brick Kiln Hex data for Pakistan:', error);
                hideLoadingSpinner(); // Hide the spinner if there is an error
            });

    } else {
        map.setLayoutProperty('brick_kilns_PK', 'visibility', 'visible');
    }
}


function loadBrickKilnLayerINDhex() {
    if (!map.getSource('brick_kilns_IND_hex')) {
        showLoadingSpinner();

        fetch('https://gist.githubusercontent.com/Mseher/f6ce0d67ab61afb40a13c085a15a4138/raw/067eee317090a50358a6966a05e43ca490914e97/brick_kilns_IND.geojson')
            .then(response => response.json())
            .then(data => {
                const bbox = turf.bbox(data);

                const hexGrid = turf.hexGrid(bbox, 10, { units: 'kilometers' });

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

                // Add popup click event
                map.on('click', 'brick_kilns_IND', (e) => {
                    const properties = e.features[0].properties;
                    const popupContent = `
                    <div class="popup-table">
                        <h3>Brick Kiln Density / 10 km</h3>
                        <table>
                            <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
                        </table>
                    </div>`;

                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                // Change cursor to pointer when hovering over the grid
                map.on('mouseenter', 'brick_kilns_IND', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'brick_kilns_IND', () => {
                    map.getCanvas().style.cursor = '';
                });

                hideLoadingSpinner();
                
            }).catch(error => {
                console.error('Error loading Brick Kiln Hex data for India:', error);
                hideLoadingSpinner();
            });
    } else {
        map.setLayoutProperty('brick_kilns_IND', 'visibility', 'visible');
    }
}

function loadBrickKilnLayerBANhex() {
    if (!map.getSource('brick_kilns_BAN_hex')) {
        showLoadingSpinner();

        fetch('https://gist.githubusercontent.com/Mseher/10ad98920682d586ce53ff7610359fd5/raw/696a9005623f2f99308f5096c4782b232d388010/brick_kilns_BAN.geojson')
            .then(response => response.json())
            .then(data => {
                const bbox = turf.bbox(data);

                const hexGrid = turf.hexGrid(bbox, 10, { units: 'kilometers' });

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

                // Add popup click event
                map.on('click', 'brick_kilns_BAN', (e) => {
                    const properties = e.features[0].properties;
                    const popupContent = `
                    <div class="popup-table">
                        <h3>Brick Kiln Density / 10 km</h3>
                        <table>
                            <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
                        </table>
                    </div>`;

                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map);
                });

                map.on('mouseenter', 'brick_kilns_BAN', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'brick_kilns_BAN', () => {
                    map.getCanvas().style.cursor = '';
                });
                hideLoadingSpinner();
                
            }).catch(error => {
                console.error('Error loading Brick Kiln Hex data for Bangladesh:', error);
                hideLoadingSpinner();
            });
    } else {
        map.setLayoutProperty('brick_kilns_BAN', 'visibility', 'visible');
    }
}


// Lazy load Pakistan Brick Kilns layer
function loadBrickKilnLayerPK() {
    if (!map.getSource('bk_pk')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/ff38ecf6b4b365bfbaf1de99506685a3/raw/9907737c8ff94dbc896286df6fcf975307e538d6/brick_kilns_PK.geojson')
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
                        'circle-radius': 2,
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                // Popup for BK_PK layer
                map.on('click', 'BK_PK', (e) => {
                    const properties = e.features[0].properties;
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<div class="popup-table"><h3>${properties.brickid}</h3></div>`)
                        .addTo(map);
                });

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
function loadBrickKilnLayerIND() {
    if (!map.getSource('bk_ind')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/f6ce0d67ab61afb40a13c085a15a4138/raw/067eee317090a50358a6966a05e43ca490914e97/brick_kilns_IND.geojson')
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
                        'circle-radius': 2,
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                // Popup for BK_IND layer
                map.on('click', 'BK_IND', (e) => {
                    const properties = e.features[0].properties;
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<div class="popup-table"><h3>${properties.type}</h3></div>`)
                        .addTo(map);
                });

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
function loadBrickKilnLayerBAN() {
    if (!map.getSource('bk_ban')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/10ad98920682d586ce53ff7610359fd5/raw/696a9005623f2f99308f5096c4782b232d388010/brick_kilns_BAN.geojson')
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
                        'circle-radius': 2,
                        'circle-stroke-width': 0,
                        'circle-color': 'green',
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                // Popup for BK_BAN layer
                map.on('click', 'BK_BAN', (e) => {
                    const properties = e.features[0].properties;
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<div class="popup-table"><h3>${properties.type}</h3></div>`)
                        .addTo(map);
                });

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
// Function to show the loading spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}



// Load data layers when map is initialized
map.on('load', addDataLayers);

// -----------------------------------------------------------BASEMAP MENU-----------------------------------------------------------

// Toggle the menu visibility when the button is clicked
menuButton.onclick = () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

// Save layer visibility before changing base map style and restore after style load
const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');

for (const input of inputs) {
    input.onclick = (layer) => {
        // Save the current visibility of layers
        saveLayerVisibility();

        // Set a loading spinner or status message for user feedback
        showLoadingSpinner();

        const style = `mapbox://styles/mapbox/${layer.target.value}`;
        
        // Change the basemap style and force a full reload
        map.setStyle(style);

        // When the new style is fully loaded, re-add data layers and restore visibility
        map.once('style.load', () => {
            addDataLayers(); // Re-add the custom layers after new style is loaded
            restoreLayerVisibility(); // Restore visibility settings

            // Hide the loading spinner once all layers are added back
            hideLoadingSpinner();
        });

        // Hide the menu after style switch
        document.getElementById('menu').style.display = 'none';
    };
}



// Load data layers when map is initialized
map.on('load', addDataLayers);

// -----------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------

let layerVisibility = {};

function saveLayerVisibility() {
    const layerIds = [
        'coal', 'population', 'fossil', 'GP', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN'
    ];

    layerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            layerVisibility[layerId] = visibility ? visibility : 'none';
        }
    });
}

function restoreLayerVisibility() {
    Object.keys(layerVisibility).forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', layerVisibility[layerId]);
        }
    });
}


// -----------------------------------------------------------AREA CHANGE-----------------------------------------------------------

// Add this to your JavaScript (inside app.js or another script file)
const africaCenter = [20.0, 5.0];  // Longitude, Latitude for Africa
const asiaCenter = [78.8181577, 28.7650135];  // Longitude, Latitude for South Asia
const zoomLevel = 4;  // Common zoom level for both regions

// Add event listener for button click
document.getElementById('areaChange').addEventListener('click', () => {
    const currentCenter = map.getCenter();
    
    // Check if the map is currently centered around Africa or Asia
    if (Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5) {
        // If the map is in Africa, shift to Asia
        map.flyTo({
            center: asiaCenter,
            zoom: zoomLevel,
            essential: true
        });

        // Change the icon to "Asia" (globe icon can be used)
        document.getElementById('areaChange').innerHTML = '<i class="fas fa-globe-asia"></i>';
        document.getElementById('areaChange').setAttribute('title', 'Move to Africa');
    } else {
        // If the map is in Asia, shift to Africa
        map.flyTo({
            center: africaCenter,
            zoom: zoomLevel,
            essential: true
        });

        // Change the icon to "Africa"
        document.getElementById('areaChange').innerHTML = '<i class="fas fa-globe-africa"></i>';
        document.getElementById('areaChange').setAttribute('title', 'Move to Asia');
    }
});


// --------------------------------------------------------GEOCODER INITIALIZATION----------------------------------------------------

// Initialize Geocoder
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: true,
    placeholder: 'Search for places'
});
// Attach the geocoder to the #geocoder div in the top bar
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


// -------------------------------------------------------LAYERS VISIBILITY TOGGLES----------------------------------------------------


// Add event listeners for layer visibility toggling
document.getElementById('toggleFossil').addEventListener('change', (e) => {
    map.setLayoutProperty('fossil', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('toggleCoal').addEventListener('change', (e) => {
    map.setLayoutProperty('coal', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('toggleGPW').addEventListener('change', (e) => {
    map.setLayoutProperty('GP', 'visibility', e.target.checked ? 'visible' : 'none');
});
document.getElementById('togglepop').addEventListener('change', (e) => {
    map.setLayoutProperty('population', 'visibility', e.target.checked ? 'visible' : 'none');
});
document.getElementById('toggledecay').addEventListener('change', (e) => {
    map.setLayoutProperty('pollutant', 'visibility', e.target.checked ? 'visible' : 'none');
});
// Event listener for toggling Pakistan's Brick Kilns layer
document.getElementById('toggleBKPK').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerPK();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('BK_PK')) {
            map.setLayoutProperty('BK_PK', 'visibility', 'none');
        }
    }
});

// Event listener for toggling India's Brick Kilns layer
document.getElementById('toggleBKIND').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerIND();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('BK_IND')) {
            map.setLayoutProperty('BK_IND', 'visibility', 'none');
        }
    }
});

// Event listener for toggling Bangladesh's Brick Kilns layer
document.getElementById('toggleBKBAN').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerBAN();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('BK_BAN')) {
            map.setLayoutProperty('BK_BAN', 'visibility', 'none');
        }
    }
});

// Main Brick Kilns checkbox functionality (toggles all brick kiln layers)
document.getElementById('toggleBrickKilns').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';

    // Show or hide the country-specific checkboxes
    document.getElementById('brickKilnCountries').style.display = e.target.checked ? 'block' : 'none';

    if (e.target.checked) {
        // Load the brick kiln layers if they are toggled on
        loadBrickKilnLayerPK();
        loadBrickKilnLayerIND();
        loadBrickKilnLayerBAN();
    } else {
        // Hide the layers if they are already loaded
        if (map.getLayer('BK_PK')) {
            map.setLayoutProperty('BK_PK', 'visibility', 'none');
        }
        if (map.getLayer('BK_IND')) {
            map.setLayoutProperty('BK_IND', 'visibility', 'none');
        }
        if (map.getLayer('BK_BAN')) {
            map.setLayoutProperty('BK_BAN', 'visibility', 'none');
        }
    }
    
    // Set the child checkboxes
    document.getElementById('toggleBKPK').checked = e.target.checked;
    document.getElementById('toggleBKIND').checked = e.target.checked;
    document.getElementById('toggleBKBAN').checked = e.target.checked;
});


document.getElementById('toggleHexGridPAK').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerPKhex();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_PK')) {
            map.setLayoutProperty('brick_kilns_PK', 'visibility', 'none');
        }
    }
});

document.getElementById('toggleHexGridIND').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerINDhex();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_IND')) {
            map.setLayoutProperty('brick_kilns_IND', 'visibility', 'none');
        }
    }
});

document.getElementById('toggleHexGridBAN').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerBANhex();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_BAN')) {
            map.setLayoutProperty('brick_kilns_BAN', 'visibility', 'none');
        }
    }
});

// Main Brick Kilns checkbox functionality
document.getElementById('toggleBrickKilnsGrid').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';

    // Show or hide the country-specific checkboxes
    document.getElementById('BrickKilnsGrid').style.display = e.target.checked ? 'block' : 'none';

    if (e.target.checked) {
        // Load the brick kiln layers if they are toggled on
        loadBrickKilnLayerPKhex();
        loadBrickKilnLayerINDhex();
        loadBrickKilnLayerBANhex();
    } else {
        // Hide the layers if they are already loaded
        if (map.getLayer('brick_kilns_PK')) {
            map.setLayoutProperty('brick_kilns_PK', 'visibility', 'none');
        }
        if (map.getLayer('brick_kilns_IND')) {
            map.setLayoutProperty('brick_kilns_IND', 'visibility', 'none');
        }
        if (map.getLayer('brick_kilns_BAN')) {
            map.setLayoutProperty('brick_kilns_BAN', 'visibility', 'none');
        }
    }

    // If the main checkbox is checked, set all child checkboxes to checked and show all layers
    document.getElementById('toggleHexGridPAK').checked = e.target.checked;
    document.getElementById('toggleHexGridIND').checked = e.target.checked;
    document.getElementById('toggleHexGridBAN').checked = e.target.checked;

});






// Legend  toggling (close button)
legendButton.addEventListener('click', () => {
    legend.style.display = (legend.style.display === 'none' || legend.style.display === '') ? 'block' : 'none';

});

document.querySelector('#legend .closeButton').addEventListener('click', () => {
    legend.style.display = 'none';
});


// ----------------------------------------------------------- MAP OVERLAY CHARTS-------------------------------------------------------------

// Global variables to store the last known pollutant data
let lastPm10 = 0;
let lastPm25 = 0;
let lastSo2 = 0;
let lastNo2 = 0;

// Collapse button functionality
const collapseBtn = document.getElementById('collapseBtn');
const expandBtn = document.getElementById('expandBtn');
const chartContent = document.getElementById('chartContent');
const featuresDiv = document.getElementById('features');
const frequencySelect = document.getElementById('frequencySelect');
let dataFrequency = 'year'; // Default is per year

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

// Function to convert data based on frequency (year or day)
function getConvertedData(value) {
    return dataFrequency === 'day' ? value / 365 : value;
}

// Initialize the chart object
let pollutantChart1, pollutantChart2;

function updatePollutantCharts(pm10, pm25, so2, no2) {
    const ctx1 = document.getElementById('pollutantChart1').getContext('2d');
    const ctx2 = document.getElementById('pollutantChart2').getContext('2d');

    // Destroy existing charts if they exist
    if (pollutantChart1) pollutantChart1.destroy();
    if (pollutantChart2) pollutantChart2.destroy();

    // Update the data based on frequency (Per Year/Per Day)
    const pm10Converted = getConvertedData(pm10);
    const pm25Converted = getConvertedData(pm25);
    const so2Converted = getConvertedData(so2);
    const no2Converted = getConvertedData(no2);

    // Create first chart for PM10 and PM2.5
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
                    title: { display: true, text: 'Tonnes per ' + (dataFrequency === 'year' ? 'Year' : 'Day') }
                }
            }
        }
    });

    // Create second chart for SO2 and NO2
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
                    title: { display: true, text: 'Tonnes per ' + (dataFrequency === 'year' ? 'Year' : 'Day') }
                }
            }
        }
    });
}

// Listen to dropdown change and update the dataFrequency
frequencySelect.addEventListener('change', () => {
    dataFrequency = frequencySelect.value; // Update the data frequency (year/day)

    // Recalculate and update the charts with last known values
    updatePollutantCharts(lastPm10, lastPm25, lastSo2, lastNo2);
});

// Hover information display with chart
map.on('mousemove', (event) => {
    if(map.getLayer('coal')){
        const states = map.queryRenderedFeatures(event.point, { layers: ['coal'] });

    if (states.length) {
        const properties = states[0].properties;
        const pm10 = properties.p10_tn_;
        const pm25 = properties.p25_tn_;
        const so2 = properties.sx_tn_y;
        const no2 = properties.nx_tn_y;
        const plantName = properties.plnt_nm;
        const country = properties.country;

        document.getElementById('plantInfo').innerHTML = `<h3>${plantName}, ${country}</h3>`;

        // Update global variables with the latest pollutant data
        lastPm10 = pm10;
        lastPm25 = pm25;
        lastSo2 = so2;
        lastNo2 = no2;

        // Update the charts with the latest data
        updatePollutantCharts(pm10, pm25, so2, no2);

        document.getElementById('hoverText').style.display = 'none';
    } else {
        document.getElementById('hoverText').style.display = 'block';
    }
    }
    
});

// Initialize the charts with default values when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updatePollutantCharts(0, 0, 0, 0); // Default chart with zero values
    document.getElementById('pollutantChart1').style.display = 'block';
    document.getElementById('pollutantChart2').style.display = 'block';

    // Keep the chart content collapsed by default
    chartContent.style.display = 'none';
    collapseBtn.style.display = 'none';
    expandBtn.style.display = 'block';

    // Initially keep the featuresDiv in its collapsed state
    featuresDiv.style.height = 'auto';
    featuresDiv.style.padding = '5px';
    featuresDiv.style.width = '200px'; // Set initial collapsed width to 200px
});




// --------------------------------------------------------POLLUTANT FILETRS-------------------------------------------------------

function coalPollutantFilter(pollutant, country = '') {


    if (map.getLayer('coal')) {
        map.removeLayer('coal');
    }

    const filter = ['all'];
    if (country) {
        filter.push(['==', 'country', country]);
    }

    // Disable pollutant filter if coal layer is not visible
    if (!document.getElementById('toggleCoal').checked) {
        disablePollutantFilter();
        return;
    } else {
        enablePollutantFilter();
    }

    if (pollutant === '') {
        document.getElementById('pollutant-legend').style.display = 'none';
        map.addLayer({
            'id': 'coal',
            'type': 'circle',
            'source': 'coal_IGP',
            'filter': filter,
            'paint': {
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-color': '#616161', // Default gray color
                'circle-stroke-color': 'white'
            }
        });
    } else {
        let colorStops, radiusStops, legendTitle;

        switch (pollutant) {

            case 'p10_tn_':
                legendTitle = 'PM₁₀ tonnes/yr';
                colorStops = [
                    [100, 'rgb(254,229,217)'],
                    [500, 'rgb(252,187,161)'],
                    [1500, 'rgb(252,146,114)'],
                    [2500, 'rgb(251,106,74)'],
                    [5000, 'rgb(222,45,38)'],
                    [15000, 'rgb(165,15,21)']
                ];
                radiusStops = [
                    [100, 5],
                    [500, 7],
                    [1500, 9],
                    [2500, 11],
                    [5000, 13],
                    [15000, 15]
                ];
                break;
            case 'p25_tn_':
                legendTitle = 'PM₂.₅ tonnes/yr';
                colorStops = [
                    [50, 'rgb(254,229,217)'],
                    [500, 'rgb(252,187,161)'],
                    [1500, 'rgb(252,146,114)'],
                    [2500, 'rgb(251,106,74)'],
                    [3500, 'rgb(222,45,38)'],
                    [6000, 'rgb(165,15,21)']
                ];
                radiusStops = [
                    [50, 5],
                    [500, 7],
                    [1500, 9],
                    [2500, 11],
                    [3500, 13],
                    [6000, 15]
                ];
                break;
            case 'sx_tn_y':
                legendTitle = 'SO₂ tonnes/yr';
                colorStops = [
                    [1800, 'rgb(254,229,217)'],
                    [5000, 'rgb(252,187,161)'],
                    [15000, 'rgb(252,146,114)'],
                    [25000, 'rgb(251,106,74)'],
                    [50000, 'rgb(222,45,38)'],
                    [250000, 'rgb(165,15,21)']
                ];
                radiusStops = [
                    [1800, 5],
                    [5000, 7],
                    [15000, 9],
                    [25000, 11],
                    [50000, 13],
                    [250000, 15]
                ];
                break;
            case 'nx_tn_y':
                legendTitle = 'NO₂ tonnes/yr';
                colorStops = [
                    [1100, 'rgb(254,229,217)'],
                    [5000, 'rgb(252,187,161)'],
                    [15000, 'rgb(252,146,114)'],
                    [25000, 'rgb(251,106,74)'],
                    [50000, 'rgb(222,45,38)'],
                    [150000, 'rgb(165,15,21)']
                ];
                radiusStops = [
                    [1100, 5],
                    [5000, 7],
                    [15000, 9],
                    [25000, 11],
                    [50000, 13],
                    [150000, 15]
                ];
                break;
            default:
                return;
        }

        map.addLayer({
            'id': 'coal',
            'type': 'circle',
            'source': 'coal_IGP',
            'filter': filter,
            'paint': {
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', pollutant],
                    ...colorStops.flat()
                ],
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', pollutant],
                    ...radiusStops.flat()
                ]
            }
        });
        updatePollutantLegend(legendTitle, colorStops, radiusStops);
    }
}

// Disable the pollutant filter and show a message
function disablePollutantFilter() {
    const pollutantSelect = document.getElementById('polutantType');
    pollutantSelect.disabled = true;
    pollutantSelect.title = 'Enable the coal layer to view pollutants';  // Tooltip message
}

// Enable the pollutant filter when the coal layer is visible
function enablePollutantFilter() {
    const pollutantSelect = document.getElementById('polutantType');
    pollutantSelect.disabled = false;
    pollutantSelect.title = '';  // Remove the tooltip
}

// Add event listener to handle coal layer visibility changes
document.getElementById('toggleCoal').addEventListener('change', (e) => {
    const selectedPollutant = document.getElementById('polutantType').value;
    const selectedCountry = document.getElementById('countryFilter').value;
    coalPollutantFilter(selectedPollutant, selectedCountry);
});

// Example of initializing the pollutant filter state on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toggleCoal').checked) {
        disablePollutantFilter();
    }
});

// Handle pollutant type and country filter changes
document.getElementById('polutantType').addEventListener('change', () => {
    const selectedPollutant = document.getElementById('polutantType').value;
    const selectedCountry = document.getElementById('countryFilter').value;
    coalPollutantFilter(selectedPollutant, selectedCountry);
});

document.getElementById('countryFilter').addEventListener('change', () => {
    const selectedPollutant = document.getElementById('polutantType').value;
    const selectedCountry = document.getElementById('countryFilter').value;
    coalPollutantFilter(selectedPollutant, selectedCountry);
});


// ----------------------------------------------------------POLLUTANT LEGEND--------------------------------------------------------

function updatePollutantLegend(legendTitle, colorStops, radiusStops) {
    const legendContainer = document.querySelector('#pollutant-legend .graduated-circles');
    const legendTitleElement = document.querySelector('#pollutant-legend .legend-title');

    legendContainer.innerHTML = '';
    legendTitleElement.textContent = `Coal: ${legendTitle}`;

    for (let i = 0; i < colorStops.length; i++) {
        const color = colorStops[i][1];
        const radius = radiusStops[i][1];
        const value = colorStops[i][0];

        const legendItem = `
    <div class="legend-item">
        <span class="circle" style="width:${radius * 2}px; height:${radius * 2}px; background-color:${color};"></span>
        <span class="circle-label">${value}</span>
    </div>
`;

        legendContainer.innerHTML += legendItem;
    }

    document.getElementById('pollutant-legend').style.display = 'block';
}

document.querySelector('#pollutant-legend .closeButton').addEventListener('click', () => {
    document.getElementById('pollutant-legend').style.display = 'none';
});


