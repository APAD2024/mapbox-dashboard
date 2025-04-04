import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { isAggregateToolEnabled } from './aggregateTool.js';



export function loadADM3BrickKilnsIndia(map) {
    const id = 'adm3_IND';
    const url = 'https://gist.githubusercontent.com/Mseher/6b3cc6bfb7a26423e0db08ca7a809746/raw/677c9cb4d6231aa6119efe6058a0f5b6b4357ada/ind_BK_adm3.geojson';

    if (!map.getSource(id)) {
        showLoadingSpinner();

        fetch(url)
            .then(res => res.json())
            .then(data => {
                map.once('idle', () => {
                    map.addSource(id, { type: 'geojson', data });

                    // map.addLayer({
                    //     id,
                    //     type: 'fill',
                    //     source: id,
                    //     paint: {
                    //         'fill-color': [
                    //             'interpolate', ['linear'], ['get', 'Kiln_count'],
                    //             0, 'rgba(255,255,255,0)',
                    //             1, '#ffffb2',
                    //             10, '#fecc5c',
                    //             30, '#fd8d3c',
                    //             60, '#f03b20',
                    //             100, '#bd0026'
                    //         ],
                    //         'fill-opacity': 0.4
                    //     },
                    //     layout: {
                    //         visibility: 'visible'  // ✅ THIS LINE IS IMPORTANT
                    //       },
                    // });

                    map.addLayer({
                        id,
                        type: 'fill',
                        source: id,
                        paint: {
                            'fill-color': '#888',
                            'fill-opacity': 0.4
                        },
                        layout: {
                            visibility: 'visible'  // ✅ THIS LINE IS IMPORTANT
                          },
                    });

                    map.addLayer({
                        id: `${id}-outline`,
                        type: 'line',
                        source: id,
                        paint: {
                            'line-color': '#333',
                            'line-width': 0.5
                        },
                        layout: {
                            visibility: 'visible'
                        }
                    });
    
                    // ✅ Click Popup Handler
                    map.on('click', id, (e) => {
                        const props = e.features[0].properties;
                        new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(`
                                <div class="popup-table">
                                    <h3>District: ${props.NAME_3}</h3>
                                    <table>
                                        <tr><th>Total Kilns:</th><td>${props.Kiln_count}</td></tr>
                                    </table>
                                </div>
                            `)
                            .addTo(map);
                    });
    
                    map.on('mouseenter', id, () => map.getCanvas().style.cursor = 'pointer');
                    map.on('mouseleave', id, () => map.getCanvas().style.cursor = '');
    
                    // ✅ Just wait until layers are rendered to hide spinner
                    map.once('idle', () => hideLoadingSpinner());
                });
            })
            .catch(err => {
                console.error("❌ Failed to load ADM3 IND GeoJSON:", err);
                hideLoadingSpinner();
            });
    } else {
        map.setLayoutProperty(id, 'visibility', 'visible');
    }
}



export function loadADM3BrickKilnsPakistan(map) {
    const id = 'adm3_PAK';
    const url = 'https://gist.githubusercontent.com/Mseher/ab7ea7e0d5e6e3817552d23cfb7c8a34/raw/e0e4c64debdae3a96ad1a7ca01ca46fc3726cdda/pak_BK_adm3.geojson';

    if (!map.getSource(id)) {
        showLoadingSpinner();

        fetch(url)
            .then(res => res.json())
            .then(data => {
                map.addSource(id, { type: 'geojson', data });

                map.addLayer({
                    id,
                    type: 'fill',
                    source: id,
                    paint: {
                        'fill-color': '#888',
                        'fill-opacity': 0.4
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                // map.addLayer({
                    //     id,
                    //     type: 'fill',
                    //     source: id,
                    //     paint: {
                    //         'fill-color': [
                    //             'interpolate', ['linear'], ['get', 'Kiln_Count'],
                    //             0, 'rgba(255,255,255,0)',
                    //             1, '#ffffb2',
                    //             10, '#fecc5c',
                    //             30, '#fd8d3c',
                    //             60, '#f03b20',
                    //             100, '#bd0026'
                    //         ],
                    //         'fill-opacity': 0.4
                    //     },
                    //     layout: {
                    //         visibility: 'visible'  // ✅ THIS LINE IS IMPORTANT
                    //       },
                    // });

                map.addLayer({
                    id: `${id}-outline`,
                    type: 'line',
                    source: id,
                    paint: {
                        'line-color': '#333',
                        'line-width': 0.5
                    },
                    layout: {
                        visibility: 'visible'
                    }
                });

                // ✅ Click Popup Handler
                map.on('click', id, (e) => {
                    const props = e.features[0].properties;
                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`
                            <div class="popup-table">
                                <h3>District: ${props.NAME_3}</h3>
                                <table>
                                    <tr><th>Total Kilns:</th><td>${props.Kiln_Count}</td></tr>
                                </table>
                            </div>
                        `)
                        .addTo(map);
                });

                map.on('mouseenter', id, () => map.getCanvas().style.cursor = 'pointer');
                map.on('mouseleave', id, () => map.getCanvas().style.cursor = '');

                // ✅ Just wait until layers are rendered to hide spinner
                map.once('idle', () => hideLoadingSpinner());
            })
            .catch(err => {
                console.error("❌ Failed to load ADM3 PK GeoJSON:", err);
                hideLoadingSpinner();
            });
    } else {
        map.setLayoutProperty(id, 'visibility', 'visible');
    }
}
