

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

let populationLayer, fossilFuelLayer, coalLayer, gpwLayer, pollutantLayer, boundaryLayer, brick_kilns_PK, brick_kilns_BAN, brick_kilns_IND;

const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const legendButton = document.getElementById('legendButton');
const legend = document.getElementById('legend');
const filterButton = document.getElementById('filtersearch');
const filterPanel = document.getElementById('filterPanel');



// -------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------

// Store layer visibility status
const layerIds = ['population',
    'fossil', 
    'coal_IGP', 
    'GP', 
    'pollutant', 
    'unclustered-BK-P', 'clusters-BK-P', 'cluster-count-BK-P', 
    'unclustered-BK-BAN', 'clusters-BK-BAN', 'cluster-count-BK-BAN',
    'unclustered-BK-IND', 'clusters-BK-IND', 'cluster-count-BK-IND'
];
let layerVisibility = {};

// Function to save the visibility of all layers
function saveLayerVisibility() {
    layerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            layerVisibility[layerId] = visibility ? visibility : 'none';
        }
    });
}

// Function to restore the visibility of all layers
function restoreLayerVisibility() {
    layerIds.forEach(layerId => {
        if (map.getLayer(layerId) && layerVisibility[layerId]) {
            map.setLayoutProperty(layerId, 'visibility', layerVisibility[layerId]);
        }
    });
}

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
            'id': 'coal_IGP',
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
        map.on('click', 'coal_IGP', (e) => {  // Use 'coal' as the layer ID
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

    // Add the source for the Brick Kilns layer (with clustering)
    // Add the source and layers for Brick Kilns of Bangladesh
    if (!map.getSource('brick_kilns_BAN')) {
        map.addSource('brick_kilns_BAN', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/Mseher/10ad98920682d586ce53ff7610359fd5/raw/696a9005623f2f99308f5096c4782b232d388010/brick_kilns_BAN.geojson',
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points
            clusterRadius: 50    // Radius of each cluster when clustering points
        });

        // Unclustered point layer for brick kilns
        map.addLayer({
            id: 'unclustered-BK-BAN',
            type: 'circle',
            source: 'brick_kilns_BAN',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-radius': 7,
                'circle-color': '#70151d',   // Dark red for unclustered points
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            },
            layout: {
                'visibility': 'none'  // Initially set the visibility to none
            }
        });

        // Clustered points for brick kilns with more granular size steps
        map.addLayer({
            id: 'clusters-BK-BAN',
            type: 'circle',
            source: 'brick_kilns_BAN',
            filter: ['has', 'point_count'],
            paint: {
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15,  // Base size for clusters with fewer points
                    25, 12,
                    50, 25,  // For clusters with 50 or more points
                    100, 30,  // For clusters with 100 or more points
                    250, 35,
                    500, 40,  // For clusters with 500 or more points
                    750, 45,
                    1000, 50, // For clusters with 1000 or more points
                    3000, 60, // For clusters with 3000 or more points
                    5000, 75, // For clusters with 5000 or more points
                    10000, 90  // For very large clusters (10000 or more points)
                ],
                'circle-color': '#70151d',  // Same color for all clusters
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',

            },
            layout: {
                'visibility': 'none'  // Initially set the visibility to none
            }
        });


        // Cluster count labels
        map.addLayer({
            id: 'cluster-count-BK-BAN',
            type: 'symbol',
            source: 'brick_kilns_BAN',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',  // Display the cluster point count
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'visibility': 'none'
            },
            paint: {
                'text-color': '#ffffff'   // White color for the count text
            }
        });



        // Zoom into the cluster when clicked
        map.on('click', 'clusters-BK-BAN', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-BK-BAN'] });
            const clusterId = features[0].properties.cluster_id;

            map.getSource('brick_kilns_BAN').getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            });
        });

        // Change cursor to pointer on cluster hover
        map.on('mouseenter', 'clusters-BK-BAN', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters-BK-BAN', () => {
            map.getCanvas().style.cursor = '';
        });
    }


    // Add the source for the Brick Kilns layer (with clustering)
    // Add the source and layers for Brick Kilns of Pakistan
    if (!map.getSource('brick_kilns_IND')) {
        map.addSource('brick_kilns_IND', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/Mseher/90d883f8ead3c82f50cfeddc9fa11550/raw/38a23d2788867cc70c0a614eab7374ca1f47570b/brick_kilns_IND.geojson',
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points
            clusterRadius: 50    // Radius of each cluster when clustering points
        });

        // Unclustered point layer for brick kilns
        map.addLayer({
            id: 'unclustered-BK-IND',
            type: 'circle',
            source: 'brick_kilns_IND',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-radius': 7,
                'circle-color': '#70151d',   // Dark red for unclustered points
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            },
            layout: {
                'visibility': 'none'  // Initially set the visibility to none
            }
        });

        // Clustered points for brick kilns with more granular size steps
        map.addLayer({
            id: 'clusters-BK-IND',
            type: 'circle',
            source: 'brick_kilns_IND',
            filter: ['has', 'point_count'],
            paint: {
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15,  // Base size for clusters with fewer points
                    25, 12,
                    50, 25,  // For clusters with 50 or more points
                    100, 30,  // For clusters with 100 or more points
                    250, 35,
                    500, 40,  // For clusters with 500 or more points
                    750, 45,
                    1000, 50, // For clusters with 1000 or more points
                    3000, 60, // For clusters with 3000 or more points
                    5000, 75, // For clusters with 5000 or more points
                    10000, 90  // For very large clusters (10000 or more points)
                ],
                'circle-color': '#70151d',  // Same color for all clusters
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',

            },
            layout: {
                'visibility': 'none'  // Initially set the visibility to none
            }
        });


        // Cluster count labels
        map.addLayer({
            id: 'cluster-count-BK-IND',
            type: 'symbol',
            source: 'brick_kilns_IND',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',  // Display the cluster point count
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'visibility': 'none'
            },
            paint: {
                'text-color': '#ffffff'   // White color for the count text
            }
        });

        

        // Zoom into the cluster when clicked
        map.on('click', 'clusters-BK-IND', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-BK-IND'] });
            const clusterId = features[0].properties.cluster_id;

            map.getSource('brick_kilns_IND').getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            });
        });

        // Change cursor to pointer on cluster hover
        map.on('mouseenter', 'clusters-BK-IND', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters-BK-IND', () => {
            map.getCanvas().style.cursor = '';
        });
    }

    // Add the source for the Brick Kilns layer (with clustering)
    // Add the source and layers for Brick Kilns of Pakistan
    if (!map.getSource('brick_kilns_PK')) {
        map.addSource('brick_kilns_PK', {
            type: 'geojson',
            data: 'https://gist.githubusercontent.com/Mseher/ff38ecf6b4b365bfbaf1de99506685a3/raw/9907737c8ff94dbc896286df6fcf975307e538d6/brick_kilns_PK.geojson',
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points
            clusterRadius: 50    // Radius of each cluster when clustering points
        });

        // Unclustered point layer for brick kilns
        map.addLayer({
            id: 'unclustered-BK-P',
            type: 'circle',
            source: 'brick_kilns_PK',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-radius': 7,
                'circle-color': '#70151d',   // Dark red for unclustered points
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            },
            layout: {
                'visibility': 'none'  // Initially set the visibility to none
            }
        });

        // Clustered points for brick kilns with more granular size steps
        map.addLayer({
            id: 'clusters-BK-P',
            type: 'circle',
            source: 'brick_kilns_PK',
            filter: ['has', 'point_count'],
            paint: {
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15,  // Base size for clusters with fewer points
                    25, 12,
                    50, 25,  // For clusters with 50 or more points
                    100, 30,  // For clusters with 100 or more points
                    250, 35,
                    500, 40,  // For clusters with 500 or more points
                    750, 45,
                    1000, 50, // For clusters with 1000 or more points
                    3000, 60, // For clusters with 3000 or more points
                    5000, 75, // For clusters with 5000 or more points
                    10000, 90  // For very large clusters (10000 or more points)
                ],
                'circle-color': '#70151d',  // Same color for all clusters
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',

            },
            layout: {
                'visibility': 'none'  // Initially set the visibility to none
            }
        });


        // Cluster count labels
        map.addLayer({
            id: 'cluster-count-BK-P',
            type: 'symbol',
            source: 'brick_kilns_PK',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',  // Display the cluster point count
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'visibility': 'none'
            },
            paint: {
                'text-color': '#ffffff'   // White color for the count text
            }
        });

        // Add a click event for unclustered points
        map.on('click', 'unclustered-BK-P', (e) => {
            const properties = e.features[0].properties;
            const popupContent = `
                <div class="popup-table">
                    <h3>Brick Kiln: ${properties.name}, ${properties.country}</h3>
                    <table>
                        <tr><th>Location:</th><td>${properties.location}</td></tr>
                    </table>
                </div>
            `;
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
        });

        // Zoom into the cluster when clicked
        map.on('click', 'clusters-BK-P', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-BK-P'] });
            const clusterId = features[0].properties.cluster_id;

            map.getSource('brick_kilns_PK').getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            });
        });

        // Change cursor to pointer on cluster hover
        map.on('mouseenter', 'clusters-BK-P', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters-BK-P', () => {
            map.getCanvas().style.cursor = '';
        });
    }

}

// Load data layers when map is initialized
map.on('style.load', () => {
    addDataLayers(); // Re-add the layers
});

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
        saveLayerVisibility(); // Save current visibility of layers
        const style = `mapbox://styles/mapbox/${layer.target.value}`;
        map.setStyle(style);
        map.on('style.load', () => {
            addDataLayers(); // Re-add the layers
            restoreLayerVisibility(); // Restore the visibility of layers
        });
        menu.style.display = 'none';
    };
}

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

document.getElementById('toggleGPW').addEventListener('change', (e) => {
    map.setLayoutProperty('GP', 'visibility', e.target.checked ? 'visible' : 'none');
});
document.getElementById('togglepop').addEventListener('change', (e) => {
    map.setLayoutProperty('population', 'visibility', e.target.checked ? 'visible' : 'none');
});
document.getElementById('toggledecay').addEventListener('change', (e) => {
    map.setLayoutProperty('pollutant', 'visibility', e.target.checked ? 'visible' : 'none');
});

// Main Brick Kilns checkbox functionality
document.getElementById('toggleBrickKilns').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';

    // Show or hide the country-specific checkboxes
    document.getElementById('brickKilnCountries').style.display = e.target.checked ? 'block' : 'none';

    // If the main checkbox is checked, set all child checkboxes to checked and show all layers
    document.getElementById('togglebkp').checked = e.target.checked;
    document.getElementById('togglebkind').checked = e.target.checked;
    document.getElementById('togglebkban').checked = e.target.checked;

    // Toggle all Brick Kiln layers for Pakistan, India, and Bangladesh
    map.setLayoutProperty('unclustered-BK-P', 'visibility', visibility);
    map.setLayoutProperty('clusters-BK-P', 'visibility', visibility);
    map.setLayoutProperty('cluster-count-BK-P', 'visibility', visibility);

    map.setLayoutProperty('unclustered-BK-IND', 'visibility', visibility);
    map.setLayoutProperty('clusters-BK-IND', 'visibility', visibility);
    map.setLayoutProperty('cluster-count-BK-IND', 'visibility', visibility);

    map.setLayoutProperty('unclustered-BK-BAN', 'visibility', visibility);
    map.setLayoutProperty('clusters-BK-BAN', 'visibility', visibility);
    map.setLayoutProperty('cluster-count-BK-BAN', 'visibility', visibility);
});

// Child checkbox for Pakistan
document.getElementById('togglebkp').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('unclustered-BK-P', 'visibility', visibility);
    map.setLayoutProperty('clusters-BK-P', 'visibility', visibility);
    map.setLayoutProperty('cluster-count-BK-P', 'visibility', visibility);
});

// Child checkbox for India
document.getElementById('togglebkind').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('unclustered-BK-IND', 'visibility', visibility);
    map.setLayoutProperty('clusters-BK-IND', 'visibility', visibility);
    map.setLayoutProperty('cluster-count-BK-IND', 'visibility', visibility);
});

// Child checkbox for Bangladesh
document.getElementById('togglebkban').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('unclustered-BK-BAN', 'visibility', visibility);
    map.setLayoutProperty('clusters-BK-BAN', 'visibility', visibility);
    map.setLayoutProperty('cluster-count-BK-BAN', 'visibility', visibility);
});





// Legend  toggling (close button)
legendButton.addEventListener('click', () => {
    legend.style.display = (legend.style.display === 'none' || legend.style.display === '') ? 'block' : 'none';

});

document.querySelector('#legend .closeButton').addEventListener('click', () => {
    legend.style.display = 'none';
});


// ----------------------------------------------------------- MAP OVERLAY CHARTS-------------------------------------------------------------

// Initialize the chart object
let pollutantChart;

function updatePollutantChart(pm10, pm25, so2, no2) {
    const ctx = document.getElementById('pollutantChart').getContext('2d');

    // If the chart already exists, destroy it before creating a new one
    if (pollutantChart) {
        pollutantChart.destroy();
    }

    // Create a new chart without the dataset label
    pollutantChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['PM₁₀', 'PM₂.₅', 'SO₂', 'NO₂'],
            datasets: [{
                // No label here
                data: [pm10, pm25, so2, no2],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)', // PM10
                    'rgba(54, 162, 235, 0.2)', // PM25
                    'rgba(255, 206, 86, 0.2)', // SO2
                    'rgba(255, 99, 132, 0.2)'  // NO2
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false // Hide the legend completely
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tonnes per Year' // Y-axis label only
                    }
                }
            }
        }
    });
}

// Hover information display with chart
map.on('mousemove', (event) => {
    const states = map.queryRenderedFeatures(event.point, { layers: ['coal_IGP'] });

    if (states.length) {
        // Extract pollutant data from the hovered feature
        const properties = states[0].properties;
        const pm10 = properties.p10_tn_;
        const pm25 = properties.p25_tn_;  // Assuming pm25 data is present
        const so2 = properties.sx_tn_y;
        const no2 = properties.nx_tn_y;    // Assuming no2 data is present
        const plantName = properties.plnt_nm;
        const country = properties.country;

        // Update the plant name and country in the overlay
        document.getElementById('plantInfo').innerHTML = `<h3>${plantName}, ${country}</h3>`;

        // Update the chart with pollutant data
        updatePollutantChart(pm10, pm25, so2, no2, plantName);

        // Hide hover text if chart is displayed
        document.getElementById('hoverText').style.display = 'none';
    } else {
        // Show hover text if no feature is hovered over
        document.getElementById('hoverText').style.display = 'block';
    }
});



// --------------------------------------------------------POLLUTANT FILETRS-------------------------------------------------------

function coalPollutantFilter(pollutant, country = '') {


    if (map.getLayer('coal_IGP')) {
        map.removeLayer('coal_IGP');
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
            'id': 'coal_IGP',
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
            'id': 'coal_IGP',
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


