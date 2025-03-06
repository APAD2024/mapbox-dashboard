
import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { isAggregateToolEnabled } from './aggregateTool.js';



export const layerIds = [
    'coal', 'population', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'cement_IGP', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'plastic_waste_IGP', 'solid_waste_IGP',
    'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
];
let populationLayer, fossilFuelLayer, coalLayer, gpwLayer, pollutantLayer, boundaryLayer;
// -------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------


// -----------------------------------------------------------LAYERS LOADING-----------------------------------------------------------

// Function to fetch pollution data
export async function fetchPollutionData(map) {
    try {
        const response = await fetch('https://api.apad.world/api/get_all_submissions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        addPollutionMarkers(map, data);

    } catch (error) {
        console.error('Error fetching pollution data:', error);
    }
}

// Function to add pollution markers
export function addPollutionMarkers(map, pollutionData) {
    pollutionData.forEach(site => {
        const { latitude, longitude, pollution_type, image_url, timestamp } = site;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="text-align: center;">
                <h4>${pollution_type}</h4>
                <p><strong>Reported on:</strong> ${new Date(timestamp).toLocaleString()}</p>
                <img src="${image_url}" alt="${pollution_type}" width="150px" style="border-radius: 5px;"/>
            </div>
        `);

        new mapboxgl.Marker({ color: 'red' })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map);
    });
}



// Reusable function to add data layers with fetch and lazy loading
export function addDataLayers(map) {

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

                if (!isAggregateToolEnabled()) {
                    // Popup for fossil fuel layer
                    map.on('click', 'fossil', (e) => {
                        if (!isAggregateToolEnabled()) {
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

                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'coal', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'gpw', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'cement_IGP', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'oil_gas_IGP', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'paper_pulp_IGP', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'steel_IGP', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'plastic_waste_IGP', (e) => {
                        if (!isAggregateToolEnabled()) {
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



                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'solid_waste_IGP', (e) => {
                        if (!isAggregateToolEnabled()) {
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

                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'coal_africa', (e) => {
                        if (!isAggregateToolEnabled()) {
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

                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'cement_africa', (e) => {
                        if (!isAggregateToolEnabled()) {
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

                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'paper_pulp_africa', (e) => {
                        if (!isAggregateToolEnabled()) {
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

                if (!isAggregateToolEnabled()) {
                    // Popup for the coal layer
                    map.on('click', 'steel_africa', (e) => {
                        if (!isAggregateToolEnabled()) {
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