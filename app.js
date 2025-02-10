

// -----------------------------------------------------------MAP INITIALIZATION-----------------------------------------------------------


mapboxgl.accessToken = 'pk.eyJ1IjoibXVoYW1tYWQtYmlsYWw3NjMiLCJhIjoiY2w1NzA1NW90MDF4ZDNkbG9iYTUxeGdveiJ9.XSisxZKgp-ZzmgWWoy4WhA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [78.8181577, 28.7650135], // starting position
    zoom: 5 // starting zoom
});

// Add navigation control (zoom and rotation) to the top-right corner
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

let populationLayer, fossilFuelLayer, coalLayer, gpwLayer, pollutantLayer, boundaryLayer, brick_kilns_PK_hex, brick_kilns_IND_hex, brick_kilns_BAN_hex;

const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const legendButton = document.getElementById('legendButton');
const legend = document.getElementById('legend');
const filterButton = document.getElementById('filtersearch');
const filterPanel = document.getElementById('filterPanel');

let brickKilnPKLoaded = false;
let brickKilnINDLoaded = false;
let brickKilnBANLoaded = false;
const layerIds = [
    'coal', 'population', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'cement_IGP', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'plastic_waste_IGP', 'solid_waste_IGP',
    'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
];

// -------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------


// -----------------------------------------------------------LAYERS LOADING-----------------------------------------------------------

// Reusable function to add data layers with fetch and lazy loading
function addDataLayers() {

    // Indian plain layer
    if (!map.getSource('indian_plain')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/d2fe2c380fc19ab797d17c0116b11876/raw/3c37088e53623fcc8c9479159ad0fe8c6b89ed3f/IGP_boundary.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('indian_plain', {
                    type: 'geojson',
                    data: data
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
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Indian plain data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Congo Adm Boundary
    if (!map.getSource('COD_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/731408a10cc9e5ed36c5fb5a1982dc1c/raw/7779b1c68faa84685e3a3eef631afa675d78f209/COD_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('COD_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                boundaryLayer = map.addLayer({
                    'id': 'COD_Adm',
                    'type': 'line',
                    'source': 'COD_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Congo Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Ghana Adm Boundary
    if (!map.getSource('GHA_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/7fb33392e9c0adb358ad2a553f5eba5a/raw/3cbbe1c37ae215b6281f69f890e6641e0d73527e/GHA_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('GHA_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                boundaryLayer = map.addLayer({
                    'id': 'GHA_Adm',
                    'type': 'line',
                    'source': 'GHA_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Ghana Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Nigeria Adm Boundary
    if (!map.getSource('NGA_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/359c899443ff3d0e31ea1eb3610227b6/raw/3f33451383fc0d5967e680fc1038b85d60bf1a76/NGA_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('NGA_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                boundaryLayer = map.addLayer({
                    'id': 'NGA_Adm',
                    'type': 'line',
                    'source': 'NGA_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Nigeria Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Uganda Adm Boundary
    if (!map.getSource('UGA_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/542c13b528a18c3d13d43eb390efe47f/raw/7f60e28ef3b7e9df2a1f3a4f745856debff9832e/UGA_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('UGA_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                boundaryLayer = map.addLayer({
                    'id': 'UGA_Adm',
                    'type': 'line',
                    'source': 'UGA_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Uganda Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

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
                visibility: 'visible' // Initial visibility
            }
        });
    }

    // Lazy load Fossil fuel layer
    if (!map.getSource('fossil_fuel')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/bilalpervaiz/597c50eff1747c1a3c8c948bef6ccc19/raw/6984d3a37d75dc8ca7489ee031377b2d57da67d2/fossil_fuel.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('fossil_fuel', {
                    type: 'geojson',
                    data: data
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
                        visibility: 'visible'
                    }
                });

                if (!aggregateToolEnabled) {
                    // Popup for fossil fuel layer
                    map.on('click', 'fossil', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            const cleanedOriginalI = properties.original_i.replace(/{|}/g, '');
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`<div class="popup-table"><h3>${cleanedOriginalI}</h3></div>`)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Fossil Fuel data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Coal IGP layer
    if (!map.getSource('coal_IGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/f1608007d5c4d041a8d67496e30b7458/raw/7340a32fa2fea659dfffb8c14c680c85ff690111/IGP_Coal_Plants.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('coal_IGP', {
                    type: 'geojson',
                    data: data,
                });
                coalLayer = map.addLayer({
                    'id': 'coal',
                    'type': 'circle',
                    'source': 'coal_IGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': '#616161',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'coal', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.plant_name}, ${properties.country}</h3>
                                <table>
                                    <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties.p10_tn_y}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties.p25_tn_y}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties.nox_tn_y}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties.so2_tn_y}</td></tr>
                                </table>
                            </div>
                            `;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }
                    });
                }

                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Coal data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    

    // Lazy load GPW layer
    if (!map.getSource('GPW')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/bilalpervaiz/e2c93d2017fc1ed90f9a6d5259701a5e/raw/4dd19fe557d29b9268f11e233169948e95c24803/GPW.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('GPW', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'gpw',
                    'type': 'circle',
                    'source': 'GPW',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': 'black',
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'gpw', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`<div class="popup-table"><h3>${properties.name}</h3></div>`)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading GPW data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Cement IGP layer
    if (!map.getSource('cementIGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/084621ff3c494a2f5a72c3985821432d/raw/2aef1eb06e4cc801aa1cd5547a463683a57eef80/cement_igp.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('cementIGP', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'cement_IGP',
                    'type': 'circle',
                    'source': 'cementIGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 0.5,
                        'circle-color': 'purple',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'none'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'cement_IGP', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                     <div class="popup-table">
                                    <h3>${properties.plant_name}, ${properties.country}</h3>
                                        <table>
                                            <tr><th>State</th><td>${properties.state}</td></tr>
                                            <tr><th>Region</th><td>${properties.region}</td></tr>
                                            <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
                                            <tr><th>Status</th><td>${properties.status}</td></tr>
                                        </table>
                                    </div>
                                    `)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Cement IGP data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }


    // Lazy load Oil Gas Refining layer
    if (!map.getSource('oilgasIGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/27d0c9675491802841d2c65edca2c0f8/raw/30663fcd041e76d6c19b2105f0431d5c7f5b11b2/oil_gas_igp.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('oilgasIGP', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'oil_gas_IGP',
                    'type': 'circle',
                    'source': 'oilgasIGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': 'brown',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'oil_gas_IGP', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                     <div class="popup-table">
                                    <h3>${properties.source_nam}</h3>
                                        <table>
                                            <tr><th>Gas</th><td>${properties.gas}</td></tr>
                                            <tr><th>Capacity</th><td>${properties.capacity_f}</td></tr>
                                            <tr><th>Country</th><td>${properties.iso3_count}</td></tr>
                                        </table>
                                    </div>
                                    `)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Oil and Gas Refining IGP data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }


    // Lazy load Paper Pulp IGP layer
    if (!map.getSource('paperPulpIGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/8c774bef4ca09be557ca1b53710a8b35/raw/687f999eafa84ec12e5fb160d027d2887808fc40/paper_pulp_igp.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('paperPulpIGP', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'paper_pulp_IGP',
                    'type': 'circle',
                    'source': 'paperPulpIGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': 'rgb(112, 206, 202)',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'paper_pulp_IGP', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                     <div class="popup-table">
                                    <h3>${properties.plant_name}, ${properties.city}</h3>
                                        <table>
                                            <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
                                            <tr><th>Status</th><td>${properties.status}</td></tr>
                                            <tr><th>Capacity</th><td>${properties.capacity_p}</td></tr>
                                        </table>
                                    </div>
                                    `)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Paper Pulp IGP data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Steel IGP layer
    if (!map.getSource('steelIGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/7134493862bf31e262412731b2253a65/raw/fceb6e9877e4bfe203bb2a21660a3ae36ba5adc6/steel_IGP.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('steelIGP', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'steel_IGP',
                    'type': 'circle',
                    'source': 'steelIGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': 'rgb(24, 54, 84)',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'steel_IGP', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                     <div class="popup-table">
                                    <h3>${properties.city}, ${properties.country}</h3>
                                        <table>
                                            <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
                                            <tr><th>Status</th><td>${properties.status}</td></tr>
                                            <tr><th>Capacity</th><td>${properties.capacity_p}</td></tr>
                                        </table>
                                    </div>
                                    `)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Steel IGP data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load  Plastic Waste IGP layer
    if (!map.getSource('plasticWasteIGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/e00828d1f608b0eccd3c595acb0b5063/raw/1445bbfc749a509325784efc1f5a3299c2f7a528/plastic_waste_IGP.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('plasticWasteIGP', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'plastic_waste_IGP',
                    'type': 'circle',
                    'source': 'plasticWasteIGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': 'rgb(165, 146, 23)',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'plastic_waste_IGP', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                     <div class="popup-table">
                                    <h3>${properties.name}</h3>
                                        <table>
                                            <tr><th>Area</th><td>${properties.area}</td></tr>
                                            <tr><th>Country</th><td>${properties.country}</td></tr>
                                        </table>
                                    </div>
                                    `)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Plastic Waste IGP data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }
    
     // Lazy load  Plastic Waste IGP layer
     if (!map.getSource('solidWasteIGP')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/cd7115dc6a27c5771fcbf22480eb781c/raw/cbd1ba2cf0952b3d911daf888dd87fe80b301c7a/solid_waste_disposal_IGP.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('solidWasteIGP', {
                    type: 'geojson',
                    data: data
                });
                gpwLayer = map.addLayer({
                    'id': 'solid_waste_IGP',
                    'type': 'circle',
                    'source': 'solidWasteIGP',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 2,
                        'circle-color': 'rgb(206, 131, 19)',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });



                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'solid_waste_IGP', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                     <div class="popup-table">
                                    <h3>${properties.asset_type}</h3>
                                        <table>
                                            <tr><th>Status</th><td>${properties.status}</td></tr>
                                            <tr><th>Country</th><td>${properties.country}</td></tr>
                                        </table>
                                    </div>
                                    `)
                                .addTo(map);
                        }
                    });
                }
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Solid Waste IGP data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Pollutant decay heatmap layer
    if (!map.getSource('pollutant_decay')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/bilalpervaiz/97a2ce64252ad5a095c9222f4c9ae5b1/raw/4fcc0590f9b28e13a369fb93f4f0ff00410844a6/pollutant_decay.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('pollutant_decay', {
                    type: 'geojson',
                    data: data
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
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Pollutant Decay data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Coal Africa layer
    if (!map.getSource('coal_Afc')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/b3f5e885ddae2b90be7048f87896ef48/raw/57db894dc8237b9d09a8f3ed1a5e114400cfc49f/Africa_Coal.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('coal_Afc', {
                    type: 'geojson',
                    data: data,
                });
                coalLayer = map.addLayer({
                    'id': 'coal_africa',
                    'type': 'circle',
                    'source': 'coal_Afc',
                    'paint': {
                        'circle-radius': 7,
                        'circle-stroke-width': 2,
                        'circle-color': '#616161',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'coal_africa', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.plant_name}, ${properties.country}</h3>
                                <table>
                                    <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties.sox}</td></tr>
                                </table>
                            </div>
                            `;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }
                    });
                }

                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Africa Coal data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Cement Africa layer
    if (!map.getSource('cement_Afc')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/3c778bdbd8464ddc939b41c87e145bbc/raw/c605634a3e418b2a52a2125a3943d432d688755f/cement_africa.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('cement_Afc', {
                    type: 'geojson',
                    data: data,
                });
                coalLayer = map.addLayer({
                    'id': 'cement_africa',
                    'type': 'circle',
                    'source': 'cement_Afc',
                    'paint': {
                        'circle-radius': 5,
                        'circle-stroke-width': 0.5,
                        'circle-color': 'purple',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'cement_africa', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0]?.properties || {}; // Ensure properties exist
                            console.log(properties); // Debugging: Log properties to verify
                        
                            const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.city || 'Unknown City'}, ${properties.state || 'Unknown State'}, ${properties.country || 'Unknown Country'}</h3>
                                <table>
                                    <td>Cement Plants</td>
                                    <tr><th>Sub Region</th><td>${properties.sub_region || 'N/A'}</td></tr>
                                    <tr><th>Plant Type</th><td>${properties.plant_type || 'N/A'}</td></tr>
                                    <tr><th>Status</th><td>${properties.status || 'N/A'}</td></tr>
                                    <tr><th>Production Type</th><td>${properties.production_type || 'N/A'}</td></tr>
                                    <tr><th>Capacity</th><td>${properties.capacity || 'N/A'} mega watt</td></tr>
                                </table>
                            </div>
                            `;
                        
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }
                       
                    });
                    
                }

                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Africa Cement data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Paper Pulp Africa layer
    if (!map.getSource('paper_Pulp_Afc')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/d77d22cea85ac0f3ef184a48d0aa1bba/raw/0751824b8af6cb919a8ec2aab869367987345545/Paper_pulp_Africa.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('paper_Pulp_Afc', {
                    type: 'geojson',
                    data: data,
                });
                coalLayer = map.addLayer({
                    'id': 'paper_pulp_africa',
                    'type': 'circle',
                    'source': 'paper_Pulp_Afc',
                    'paint': {
                        'circle-radius': 6,
                        'circle-stroke-width': 0.6,
                        'circle-color': 'rgb(112, 206, 202)',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'paper_pulp_africa', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0]?.properties || {}; // Ensure properties exist
                       
                            const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.plant_name}</h3>
                                <table>
                                    <td>Paper Pulp Plants</td>
                                    <tr><th>Country</th><td>${properties.country}</td></tr>
                                    <tr><th>City</th><td>${properties.city}</td></tr>
                                    <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
                                    <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
                                    <tr><th>Status</th><td>${properties.status}</td></tr>
                                </table>
                            </div>
                            `;
                        
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }
                       
                    });
                    
                }

                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Africa Paper Pulp data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Lazy load Steel Plants Africa layer
    if (!map.getSource('steel_Afc')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/23af19444bdc70b115afcb6cc45879ec/raw/eda2bc6398aaa50595cfc7ed81bbca1d15d78c31/Steel_Plants_Africa.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('steel_Afc', {
                    type: 'geojson',
                    data: data,
                });
                coalLayer = map.addLayer({
                    'id': 'steel_africa',
                    'type': 'circle',
                    'source': 'steel_Afc',
                    'paint': {
                        'circle-radius': 6,
                        'circle-stroke-width': 0.6,
                        'circle-color': 'rgb(24, 54, 84)',  // Add # for hex color
                        'circle-stroke-color': 'white'
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                if (!aggregateToolEnabled) {
                    // Popup for the coal layer
                    map.on('click', 'steel_africa', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0]?.properties || {}; // Ensure properties exist
                          
                            const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.state}, ${properties.city}</h3>
                                <table>
                                <td>Steel Plants</td>
                                    <tr><th>Country</th><td>${properties.country}</td></tr>
                                    <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
                                    <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
                                    <tr><th>Status</th><td>${properties.status}</td></tr>
                                </table>
                            </div>
                            `;
                        
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(popupContent)
                                .addTo(map);
                        }
                       
                    });
                    
                }

                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Africa Steel Plants data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }
}



function loadBrickKilnLayerPKhex() {
    if (!map.getSource('brick_kilns_PK_hex')) {
        showLoadingSpinner(); // Show the spinner while loading

        // Fetch the brick kilns GeoJSON data and create a hexagonal grid
        fetch('https://gist.githubusercontent.com/Mseher/8c7ad3243267ef258e730ac7671dda65/raw/dbe8b202e4ab35bfc7b26513727e61962e519153/Brick_Kilns_IGP_PK_emission_estimates.geojson')
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

                if (!aggregateToolEnabled) {
                    // Add a click event to display a popup with brick kiln density details
                    map.on('click', 'brick_kilns_PK', (e) => {
                        if (!aggregateToolEnabled) {
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


function loadBrickKilnLayerINDhex() {
    if (!map.getSource('brick_kilns_IND_hex')) {
        showLoadingSpinner();

        fetch('https://gist.githubusercontent.com/Mseher/5ff795ba99dade57695c8ddad13f6f67/raw/f89f59a115bae6f8272c14ab9f4cad3b632c8b88/Brick_kilns_IND-Main.geojson')
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

                if (aggregateToolEnabled == false) {
                    // Add popup click event
                    map.on('click', 'brick_kilns_IND', (e) => {
                        if (!aggregateToolEnabled) {
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

function loadBrickKilnLayerBANhex() {
    if (!map.getSource('brick_kilns_BAN_hex')) {
        showLoadingSpinner();

        fetch('https://gist.github.com/Mseher/7fe4a53954a25eb5bda06b74589c34da/raw/4d226ba3b9e56a1a68880fcc8499f37e1897ad60/Brick_Kilns_IGP_BAN_emission_estimates.geojson')
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

                if (!aggregateToolEnabled) {
                    // Add popup click event
                    map.on('click', 'brick_kilns_BAN', (e) => {
                        if (!aggregateToolEnabled) {
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
function loadBrickKilnLayerPK() {
    if (!map.getSource('bk_pk')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/8c7ad3243267ef258e730ac7671dda65/raw/dbe8b202e4ab35bfc7b26513727e61962e519153/Brick_Kilns_IGP_PK_emission_estimates.geojson')
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_PK layer
                    map.on('click', 'BK_PK', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            const popupContent = `
                                <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                    <tr><th>Pollutant</th><td> kg/season</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties['pm10s(kg)']}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties['pm2.5s(kg)']}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties['noxs(kg)']}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties['soxs(kg)']}</td></tr>
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
function loadBrickKilnLayerIND() {
    if (!map.getSource('bk_ind')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/08d0be14f7691615d8cdc3cf954ee5e1/raw/465bee679ed85ffa2fd67c51482d0f3c8c616439/India_Brick_kiln.geojson')
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_IND layer
                    map.on('click', 'BK_IND', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                    <tr><th>Pollutant</th><td> kg/season</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties['pm10s_kg_']}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties['pm2_5s_kg_']}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties['noxs_kg_']}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties['soxs_kg_']}</td></tr>
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
function loadBrickKilnLayerBAN() {
    if (!map.getSource('bk_ban')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/7fe4a53954a25eb5bda06b74589c34da/raw/4d226ba3b9e56a1a68880fcc8499f37e1897ad60/Brick_Kilns_IGP_BAN_emission_estimates.geojson')
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_BAN layer
                    map.on('click', 'BK_BAN', (e) => {
                        if (!aggregateToolEnabled) {
                            const properties = e.features[0].properties;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class="popup-table">
                                    <h3>${properties.id}</h3>
                                    <table>
                                    <tr><th>Pollutant</th><td> kg/season</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties['pm10s(kg)']}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties['pm2.5s(kg)']}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties['noxs(kg)']}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties['soxs(kg)']}</td></tr>
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
function loadBrickKilnLayerDRC() {
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_DRC', (e) => {
                        if (!aggregateToolEnabled) {
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
function loadBrickKilnLayerGHA() {
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_GHA', (e) => {
                        if (!aggregateToolEnabled) {
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
function loadBrickKilnLayerNGA() {
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_NGA', (e) => {
                        if (!aggregateToolEnabled) {
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
function loadBrickKilnLayerUGA() {
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

                if (!aggregateToolEnabled) {
                    // Popup for BK_BAN layer
                    map.on('click', 'brick_kilns_UGA', (e) => {
                        if (!aggregateToolEnabled) {
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

// Function to show the loading spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Function to log the visibility status of specified layers
function logLayerVisibility(layers) {
    layers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            console.log(`Layer: ${layerId}, Visibility: ${visibility}`);
        } else {
            console.log(`Layer: ${layerId} does not exist or hasn't been loaded yet.`);
        }
    });
}

// -----------------------------------------------------------BASEMAP MENU-----------------------------------------------------------

// Toggle the menu visibility when the button is clicked
menuButton.onclick = () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};
// Save layer visibility before changing base map style and restore after style load
const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');

// Handle basemap switching and reloading custom layers based on toggle state
for (const input of inputs) {
    input.onclick = (layer) => {
        // Save the current visibility of layers
        saveLayerVisibility();

        // Set a loading spinner or status message for user feedback
        showLoadingSpinner();

        const style = `mapbox://styles/mapbox/${layer.target.value}`;

        // Change the basemap style and force a full reload
        map.setStyle(style);

        // Use 'once' to ensure the new style is fully loaded before proceeding
        map.once('style.load', () => {
            addDataLayers(); // Re-add the custom layers after the new style is loaded
            map.once('idle', () => {
                restoreLayerVisibility(); // Restore visibility only when the map is idle
            });
            
            // Re-add Brick Kiln layers only if their respective checkboxes are checked
            if (document.getElementById('toggleBKPK').checked) loadBrickKilnLayerPK();
            if (document.getElementById('toggleBKIND').checked) loadBrickKilnLayerIND();
            if (document.getElementById('toggleBKBAN').checked) loadBrickKilnLayerBAN();

            if (document.getElementById('toggleBKDRC').checked) loadBrickKilnLayerDRC();
            if (document.getElementById('toggleBKNGA').checked) loadBrickKilnLayerNGA();
            if (document.getElementById('toggleBKUGA').checked) loadBrickKilnLayerUGA();
            if (document.getElementById('toggleBKGHA').checked) loadBrickKilnLayerGHA();

            // Load hexagonal Brick Kiln layers based on their toggle state
            if (document.getElementById('toggleHexGridPAK').checked) loadBrickKilnLayerPKhex();
            if (document.getElementById('toggleHexGridIND').checked) loadBrickKilnLayerINDhex();
            if (document.getElementById('toggleHexGridBAN').checked) loadBrickKilnLayerBANhex();

            // Log the visibility status of all layers after layers are fully loaded
            logLayerVisibility([ 'coal', 'population', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'cement_igp', 'oil_gas_igp', 'paper_pulp_igp', 'steel_igp', 'plastic_waste_igp', 'solid_waste_igp',
                'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
            ]);

            hideLoadingSpinner(); // Hide the loading spinner after everything is done
        });

        // Hide the menu after style switch
        document.getElementById('menu').style.display = 'none';
    };
}


// Load data layers when the map is initialized
map.on('load', addDataLayers);


// -----------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------

let layerVisibility = {};


function saveLayerVisibility() {

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

// Define a mapping for legend section IDs to actual layer IDs in the map
const layerGroups = {
    'legend-brickKiln': ['BK_PK', 'BK_IND', 'BK_BAN'], // Layers related to Brick Kiln
    'legend-brickKilnGrid': ['brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN'], // Hex layers for Brick Kiln Density
    'legend-brickKilnAfc': ['brick_kilns_DRC', 'brick_kilns_NGA', 'brick_kilns_UGA', 'brick_kilns_GHA'], 
};

// Initialize drag-related variables
let draggedElement = null;

// Enable dragging on the legend items
document.querySelectorAll('.legend-section').forEach(item => {
    item.addEventListener('dragstart', function (e) {
        draggedElement = e.target; // Store the dragged element
        e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragover', function (e) {
        e.preventDefault(); // Allow dropping
        e.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('drop', function (e) {
        e.preventDefault();
        if (draggedElement !== this) {
            // Swap the dragged element with the drop target
            const legend = document.getElementById('legend-drag');
            const draggingIndex = Array.from(legend.children).indexOf(draggedElement);
            const targetIndex = Array.from(legend.children).indexOf(this);

            // Reorder in the DOM
            if (draggingIndex > targetIndex) {
                legend.insertBefore(draggedElement, this);
            } else {
                legend.insertBefore(draggedElement, this.nextSibling);
            }

            // Update the map layer order to match the new order in the legend
            reorderMapLayers();
        }
    });
});


// Function to reorder map layers based on the new legend order
function reorderMapLayers() {
    const layerOrder = [];

    // Get the order of layers from the legend
    document.querySelectorAll('.legend-section').forEach((item) => {
        const legendId = item.id; // Get the legend section ID

        // Check if the legend section is part of a grouped layer (like Brick Kilns)
        if (layerGroups[legendId]) {
            // If it's a group, add all the layers in that group
            layerOrder.push(...layerGroups[legendId]);
        } else {
            // Otherwise, just add the layer corresponding to the legend item
            const layerId = legendId.replace('legend-', ''); // Extract layer ID from legend item
            layerOrder.push(layerId);
        }
    });

    // Loop through the layers in reverse to reorder the map layers (top to bottom)
    for (let i = layerOrder.length - 1; i >= 0; i--) {
        const layerId = layerOrder[i];
        if (map.getLayer(layerId)) {
            map.moveLayer(layerId);
            console.log('Layer Order:', layerOrder);
            console.log('Applying visibility to:', layerId);

        }
    }
}

// Apply visibility settings based on legend input states
function applyLayerVisibility() {
    document.querySelectorAll('.legend-section input[type="checkbox"]').forEach(input => {
        const layerId = input.name; // Match the checkbox name to layer ID
        const isVisible = input.checked ? 'visible' : 'none';

        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', isVisible);
        }
    });
}

// Get all collapsible headers
const headers = document.querySelectorAll('.collapsible-header');

headers.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;

        // Toggle visibility of content
        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
});



// -----------------------------------------------------------AREA CHANGE-----------------------------------------------------------
const africaCenter = [20.0, 5.0];  // Longitude, Latitude for Africa
const asiaCenter = [78.8181577, 28.7650135];  // Longitude, Latitude for South Asia
const zoomLevel = 4;  // Common zoom level for both regions

// Add event listener for the area change button
document.getElementById('areaChange').addEventListener('click', () => {
    const currentCenter = map.getCenter();

    // Check if the map is currently centered around Africa or Asia
    if (Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5) {
        // If the map is in Africa, shift to Asia (IGP Region)
        map.flyTo({
            center: asiaCenter,
            zoom: zoomLevel,
            essential: true
        });

        // Change the icon and title to Africa
        document.getElementById('areaChange').innerHTML = '<i class="fas fa-globe-asia"></i>';
        document.getElementById('areaChange').setAttribute('title', 'Move to Africa');

        // Show IGP Region legend and hide Africa Region legend
        document.querySelector('.collapsible-content.igp').style.display = 'block';
        document.querySelector('.collapsible-content.africa').style.display = 'none';
    } else {
        // If the map is in Asia (IGP Region), shift to Africa
        map.flyTo({
            center: africaCenter,
            zoom: zoomLevel,
            essential: true
        });

        // Change the icon and title to Asia
        document.getElementById('areaChange').innerHTML = '<i class="fas fa-globe-africa"></i>';
        document.getElementById('areaChange').setAttribute('title', 'Move to Asia');

        // Show Africa Region legend and hide IGP Region legend
        document.querySelector('.collapsible-content.africa').style.display = 'block';
        document.querySelector('.collapsible-content.igp').style.display = 'none';
    }
});

// Initialize the correct legend visibility on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentCenter = map.getCenter();

    if (Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5) {
        // Map starts in Africa
        document.querySelector('.collapsible-content.africa').style.display = 'block';
        document.querySelector('.collapsible-content.igp').style.display = 'none';
    } else {
        // Map starts in Asia (IGP Region)
        document.querySelector('.collapsible-content.igp').style.display = 'block';
        document.querySelector('.collapsible-content.africa').style.display = 'none';
    }
});


// -----------------------------------------------------------AGGREGATE TOOL-----------------------------------------------------------


// Determine active area
function getActiveArea() {
    const currentCenter = map.getCenter();
    const isAfrica = Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5;
    return isAfrica ? 'africa' : 'asia';
}

// Toggle the Aggregate Tool
const tooltip = document.getElementById('tooltip');
let aggregateToolEnabled = false;
const aggregateButton = document.getElementById('aggregateTool');
const bufferSizeSelector = document.getElementById('bufferSizeSelector');

// Event listener to enable/disable the Aggregate Tool
aggregateButton.addEventListener('click', () => {
    aggregateToolEnabled = !aggregateToolEnabled;

    if (aggregateToolEnabled) {

        aggregateButton.style.backgroundColor = '#d3d3d3'; // Change color to indicate active state
        map.getCanvas().style.cursor = 'crosshair'; // Change cursor to crosshair

        document.getElementById('tooltip').style.display = 'block';

        document.getElementById('bufferSizeSelector').style.display = 'block';

        closePopups(); // Close existing popups for other layers
        console.log("Aggregate Tool enabled");

    } else {

        aggregateButton.style.backgroundColor = 'white'; // Reset color
        map.getCanvas().style.cursor = ''; // Reset cursor

        document.getElementById('tooltip').style.display = 'none';
        document.getElementById('bufferSizeSelector').style.display = 'none';
        clearBuffer();

        console.log("Aggregate Tool disabled");
    }
});

// Close all open popups
function closePopups() {
    const popups = document.getElementsByClassName('mapboxgl-popup');
    for (let i = 0; i < popups.length; i++) {
        popups[i].remove();
    }
}

// Function to clear the buffer layer from the map
function clearBuffer() {
    if (map.getLayer('bufferLayer')) map.removeLayer('bufferLayer');
    if (map.getSource('bufferSource')) map.removeSource('bufferSource');
}

// Aggregate Tool logic - directly using coal, brick kilns, fossil fuel, and GPW layers
map.on('click', (e) => {
    if (aggregateToolEnabled) {
        const activeArea = getActiveArea();
        const clickCoordinates = [e.lngLat.lng, e.lngLat.lat];
       // Get buffer size from dropdown and ensure valid number
       const bufferRadius = parseFloat(bufferSizeSelector.value);
       if (isNaN(bufferRadius) || bufferRadius <= 0) {
           console.error("Invalid buffer size selected.");
           return;
       }

       // Generate the buffer using Turf.js with the selected size
       const buffer = turf.buffer(turf.point(clickCoordinates), bufferRadius, { units: 'kilometers' });

       // Check if the buffer is valid
       if (!buffer || buffer.geometry.coordinates.length === 0) {
           console.error("Buffer generation failed.");
           return;
       }

        // Add the buffer to the map as a new layer
        clearBuffer(); // Clear any existing buffer
        map.addSource('bufferSource', {
            type: 'geojson',
            data: buffer
        });
        map.addLayer({
            id: 'bufferLayer',
            type: 'fill',
            source: 'bufferSource',
            paint: {
                'fill-color': 'rgba(128, 128, 128, 0.5)', // Light gray fill with 50% transparency
                'fill-outline-color': 'black'             // Black outline
            }
        });

        let popupContent = `
            <div class="popup-table">
                <h3>Aggregated Data (${bufferRadius} km buffer)</h3>
        `;

      // 1. Aggregate brick kilns based on visibility
      const brickKilnsLayers = ['BK_PK', 'BK_IND', 'BK_BAN', 'Brick_kilns_DRC', 'Brick_kilns_GHA', 'Brick_kilns_NGA', 'Brick_kilns_UGA'];
      let totalBrickKilns = 0;
      
      brickKilnsLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
              const visibility = map.getLayoutProperty(layerId, 'visibility');
              console.log(`Layer ${layerId} visibility:`, visibility);
      
              if (visibility === 'visible') {
                  const brickKilnsFeatures = map.queryRenderedFeatures({ layers: [layerId] });
                  console.log(`Rendered features for ${layerId}:`, brickKilnsFeatures);
      
                  brickKilnsFeatures.forEach(feature => {
                      const brickKilnPoint = turf.point(feature.geometry.coordinates);
                      const insideBuffer = turf.booleanPointInPolygon(brickKilnPoint, buffer);
                      console.log(`Feature inside buffer (${layerId}):`, insideBuffer, feature);
      
                      if (insideBuffer) {
                          totalBrickKilns++;
                      }
                  });
              }
          } else {
              console.log(`Layer ${layerId} not found.`);
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
        
        
        


        
       

        // Display the popup with the canvas for the charts
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);

        // Use Chart.js to create charts after the popup is added to the DOM
setTimeout(() => {
    // Emissions Chart
    const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
    new Chart(emissionsCtx, {
        type: 'pie',
        data: {
            labels: ['NO₂ (Coal)', 'SO₂ (Coal)', 'PM₁₀ (Coal)', 'PM₂.₅ (Coal)'],
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
                    text: 'Emissions for Coal',
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
                    position: 'right',
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
    }, 100);  // Small timeout to ensure the charts are rendered after the popup
    
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


document.getElementById('toggleCementIGP').addEventListener('change', (e) => {
    map.setLayoutProperty('cement_IGP', 'visibility', e.target.checked ? 'visible' : 'none');
    
});

document.getElementById('toggleOilGasIGP').addEventListener('change', (e) => {
    map.setLayoutProperty('oil_gas_IGP', 'visibility', e.target.checked ? 'visible' : 'none');
    
});

document.getElementById('togglePaperPulpIGP').addEventListener('change', (e) => {
    map.setLayoutProperty('paper_pulp_IGP', 'visibility', e.target.checked ? 'visible' : 'none');
    
});

document.getElementById('toggleSteelIGP').addEventListener('change', (e) => {
    map.setLayoutProperty('steel_IGP', 'visibility', e.target.checked ? 'visible' : 'none');
    
});

document.getElementById('togglePlasticWasteIGP').addEventListener('change', (e) => {
    map.setLayoutProperty('plastic_waste_IGP', 'visibility', e.target.checked ? 'visible' : 'none');
    
});

document.getElementById('toggleSolidWasteIGP').addEventListener('change', (e) => {
    map.setLayoutProperty('solid_waste_IGP', 'visibility', e.target.checked ? 'visible' : 'none');
    
});


document.getElementById('toggleGPW').addEventListener('change', (e) => {
    map.setLayoutProperty('gpw', 'visibility', e.target.checked ? 'visible' : 'none');
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

document.getElementById('toggleCoalAfrica').addEventListener('change', (e) => {
    map.setLayoutProperty('coal_africa', 'visibility', e.target.checked ? 'visible' : 'none');
});


document.getElementById('toggleCementAfrica').addEventListener('change', (e) => {
    map.setLayoutProperty('cement_africa', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('togglePaperPulpAfrica').addEventListener('change', (e) => {
    map.setLayoutProperty('paper_pulp_africa', 'visibility', e.target.checked ? 'visible' : 'none');
});


document.getElementById('toggleSteelAfrica').addEventListener('change', (e) => {
    map.setLayoutProperty('steel_africa', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('toggleBKDRC').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerDRC();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_DRC')) {
            map.setLayoutProperty('brick_kilns_DRC', 'visibility', 'none');
        }
    }
});

document.getElementById('toggleBKGHA').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerGHA();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_GHA')) {
            map.setLayoutProperty('brick_kilns_GHA', 'visibility', 'none');
        }
    }
});

document.getElementById('toggleBKUGA').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerUGA();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_UGA')) {
            map.setLayoutProperty('brick_kilns_UGA', 'visibility', 'none');
        }
    }
});

document.getElementById('toggleBKNGA').addEventListener('change', (e) => {
    if (e.target.checked) {
        loadBrickKilnLayerNGA();  // Load the layer if it doesn't exist
    } else {
        if (map.getLayer('brick_kilns_NGA')) {
            map.setLayoutProperty('brick_kilns_NGA', 'visibility', 'none');
        }
    }
});


// Main Brick Kilns checkbox functionality (toggles all brick kiln layers)
document.getElementById('toggleBrickKilnsAFC').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';

    // Show or hide the country-specific checkboxes
    document.getElementById('brickKilnAfcCountries').style.display = e.target.checked ? 'block' : 'none';

    if (e.target.checked) {
        // Load the brick kiln layers if they are toggled on
        loadBrickKilnLayerDRC();
        loadBrickKilnLayerNGA();
        loadBrickKilnLayerUGA();
        loadBrickKilnLayerGHA();
    } else {
        // Hide the layers if they are already loaded
        if (map.getLayer('brick_kilns_DRC')) {
            map.setLayoutProperty('brick_kilns_DRC', 'visibility', 'none');
        }
        if (map.getLayer('brick_kilns_UGA')) {
            map.setLayoutProperty('brick_kilns_UGA', 'visibility', 'none');
        }
        if (map.getLayer('brick_kilns_GHA')) {
            map.setLayoutProperty('brick_kilns_GHA', 'visibility', 'none');
        }
        if (map.getLayer('brick_kilns_NGA')) {
            map.setLayoutProperty('brick_kilns_NGA', 'visibility', 'none');
        }
    }

    // Set the child checkboxes
    document.getElementById('toggleBKDRC').checked = e.target.checked;
    document.getElementById('toggleBKGHA').checked = e.target.checked;
    document.getElementById('toggleBKNGA').checked = e.target.checked;
    document.getElementById('toggleBKUGA').checked = e.target.checked;
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
    if (map.getLayer('coal') || map.getLayer('coal_africa')) {
        // Query features from both layers at the event point
        const states = map.queryRenderedFeatures(event.point, { layers: ['coal', 'coal_africa'] });

        if (states.length) {
            const properties = states[0].properties;

            // Determine the layer and map property names correctly
            const isAfrica = states[0].layer.id === 'coal_africa';

            const pm10 = isAfrica ? properties.pm10 : properties.p10_tn_y;
            const pm25 = isAfrica ? properties.pm25 : properties.p25_tn_y;
            const so2 = isAfrica ? properties.sox : properties.so2_tn_y;
            const no2 = isAfrica ? properties.nox : properties.nox_tn_y;
            const plantName = properties.plant_name;
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
// -------------------------------------------------------- REGION-SPECIFIC DATA --------------------------------------------------------
const igpCountries = ['India', 'Pakistan', 'Bangladesh'];
const africaCountries = ['Nigeria', 'Uganda', 'Congo', 'Ghana'];

// Asset options per region (linked to actual layer IDs)
const igpAssets = [
    { id: 'coal', label: 'Coal IGP' },
    { id: 'cement_igp', label: 'Cement' },
    { id: 'oil_gas_IGP', label: 'Oil Gas Refineries' },
    { id: 'paper_pulp_IGP', label: 'Paper Pulp' },
    { id: 'steel_IGP', label: 'Steel' },
    { id: 'plastic_waste_IGP', label: 'Plastic Waste' },
    { id: 'solid_waste_IGP', label: 'Solid Waste' },
    { id: 'fossil', label: 'Fossil Fuel' },
    { id: 'gpw', label: 'GPW' }
];

const africaAssets = [
    { id: 'coal_africa', label: 'Coal' },
    { id: 'cement_africa', label: 'Cement' },
    { id: 'paper_pulp_africa', label: 'Paper Pulp' },
    { id: 'steel_africa', label: 'Steel Plants' },
];

// -------------------------------------------------------- DYNAMICALLY UPDATE FILTERS --------------------------------------------------------
function updateCountryFilter(region) {
    const countryFilter = document.getElementById('countryFilter');
    countryFilter.innerHTML = '<option value="">All</option>';  // Reset and add "All" option

    const countries = region === 'Africa' ? africaCountries : igpCountries;
    countries.forEach(country => {
        countryFilter.innerHTML += `<option value="${country}">${country}</option>`;
    });
}

function updateAssetFilter(region) {
    const assetFilter = document.getElementById('assetFilter');
    assetFilter.innerHTML = '<option value="">All</option>';  // Reset and add "All" option

    const assets = region === 'Africa' ? africaAssets : igpAssets;
    assets.forEach(asset => {
        assetFilter.innerHTML += `<option value="${asset.id}">${asset.label}</option>`;
    });
}

// -------------------------------------------------------- CHECK REGION --------------------------------------------------------
function checkRegionAndUpdateFilters() {
    const currentCenter = map.getCenter();
    const africaCenter = [20.0, 5.0];
    const asiaCenter = [78.8181577, 28.7650135];

    // Check if the current map center is closer to Africa or Asia
    const isAfrica = Math.abs(currentCenter.lng - africaCenter[0]) < 20;

    updateCountryFilter(isAfrica ? 'Africa' : 'IGP');
    updateAssetFilter(isAfrica ? 'Africa' : 'IGP');
}

// -------------------------------------------------------- HANDLE ASSET AND COUNTRY FILTERS --------------------------------------------------------

function handleAssetFilterChange() {
    const selectedAsset = document.getElementById('assetFilter').value;

    // Hide all layers by default, then show the selected asset layer
    const layerIds = [
        'coal', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 
        'cement_igp', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'plastic_waste_IGP', 'solid_waste_IGP',
        'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 
        'brick_kilns_UGA', 'brick_kilns_NGA'
    ];

    layerIds.forEach(layerId => {
        const visibility = selectedAsset === layerId || selectedAsset === '' ? 'visible' : 'none';
        map.setLayoutProperty(layerId, 'visibility', visibility);

        // Sync the legend checkboxes
        const checkbox = document.querySelector(`input[data-layer="${layerId}"]`);
        if (checkbox) {
            checkbox.checked = (visibility === 'visible');
        }
    });

    // Apply country and pollutant filters after asset visibility changes
    handleCountryAndPollutantFilters();
}

function handleCountryFilterChange() {
    const selectedCountry = document.getElementById('countryFilter').value;
    const layerIds = getVisibleLayers();

    // Apply country filter on all currently visible layers
    layerIds.forEach(layerId => {
        map.setFilter(layerId, [
            'all',
            ...(selectedCountry ? [['==', 'country', selectedCountry]] : [])  // Filter by country if selected
        ]);
    });
}

// -------------------------------------------------------- HANDLE POLLUTANT AND COUNTRY FILTERS --------------------------------------------------------

function handleCountryAndPollutantFilters() {
    const selectedPollutant = document.getElementById('polutantType').value;
    const selectedCountry = document.getElementById('countryFilter').value;
    const layerIds = getVisibleLayers();

    layerIds.forEach(layerId => {
        map.setFilter(layerId, [
            'all',
            ...(selectedCountry ? [['==', 'country', selectedCountry]] : []),
            ...(selectedPollutant ? [['>', selectedPollutant, 0]] : [])
        ]);
    });
}

// Get all visible layers
function getVisibleLayers() {
    const layerIds = [
        'coal', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 
        'cement_igp', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'plastic_waste_IGP', 'solid_waste_IGP',
        'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 
        'brick_kilns_UGA', 'brick_kilns_NGA'
    ];

    return layerIds.filter(layerId => map.getLayoutProperty(layerId, 'visibility') === 'visible');
}

// -------------------------------------------------------- INITIALIZE FILTERS ON PAGE LOAD --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    checkRegionAndUpdateFilters();  // Initialize filters based on current region

    document.getElementById('assetFilter').addEventListener('change', handleAssetFilterChange);
    document.getElementById('countryFilter').addEventListener('change', handleCountryFilterChange);
    document.getElementById('polutantType').addEventListener('change', handleCountryAndPollutantFilters);
});

// Update country and asset filters when the region changes (e.g., map moves)
map.on('moveend', checkRegionAndUpdateFilters);



