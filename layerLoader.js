export // Reusable function to add data layers with fetch and lazy loading
function addDataLayers(map) {

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
                visibility: 'none' // Initial visibility
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
                        visibility: 'none'
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
        fetch('https://gist.githubusercontent.com/Mseher/f1608007d5c4d041a8d67496e30b7458/raw/33e4507a54439aeba9889eb7fb39d2614fc1ba66/IGP_Coal_Plants.geojson')
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
                    map.on('click', 'coal', (e) => {
                        if (!aggregateToolEnabled) {
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

    // Lazy load CCement Africa layer
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
                        visibility: 'none'
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
                        visibility: 'none'
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
                        visibility: 'none'
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
                        visibility: 'none'
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
}
