import { saveLayerVisibility, restoreLayerVisibility, logLayerVisibility } from './layerVisibility.js';
import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import {
    loadBrickKilnLayerPK, loadBrickKilnLayerIND, loadBrickKilnLayerBAN,
    loadBrickKilnLayerDRC, loadBrickKilnLayerNGA, loadBrickKilnLayerUGA, loadBrickKilnLayerGHA,
    loadBrickKilnLayerPKhex, loadBrickKilnLayerINDhex, loadBrickKilnLayerBANhex
} from './brickKilns.js';
import { layerIds, addDataLayers } from './layers.js';
import { initializeHeatmapControls } from './heatmapControls.js';
import { GOOGLE_AIR_QUALITY_URL } from './config.js';


export function initializeBasemapMenu(map) {
    const menuButton = document.getElementById('menuButton');
    const menu = document.getElementById('menu');
    const heatmapBox = document.getElementById('heatmapBox'); // Reference to heatmap UI

    document.querySelector('#menu .closeButton').addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
    });

    // ✅ Initialize heatmap controls
    initializeHeatmapControls(map);


    // ✅ Toggle menu visibility
    menuButton.onclick = () => {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    };

    const inputs = document.querySelectorAll('#menu input[type="radio"]');

    // ✅ Handle basemap selection
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const selectedBasemap = input.value;
            saveLayerVisibility(map);
            showLoadingSpinner();

            if (selectedBasemap === 'google-air-quality') {
                // ✅ Add Google Air Quality Overlay without changing the basemap
                if (!map.getSource('google-air-quality')) {
                    map.addSource('google-air-quality', {
                        type: 'raster',
                        tiles: [GOOGLE_AIR_QUALITY_URL],
                        tileSize: 256
                    });

                    // ✅ Show heatmap UI
                    heatmapBox.style.display = "block";


                    map.addLayer({
                        id: 'google-air-quality',
                        type: 'raster',
                        source: 'google-air-quality',
                        layout: {
                            visibility: 'visible'
                        },
                        paint: {
                            'raster-opacity': 0.7 // 🔥 Adjust transparency (0.0 = fully transparent, 1.0 = fully opaque)
                        }
                    });


                    setTimeout(() => {
                        if (map.getLayer('google-air-quality')) {
                            layerIds.forEach(layerId => {
                                if (document.getElementById(`toggle${layerId}`)?.checked) {
                                    map.moveLayer('google-air-quality', layerId);
                                }

                            });
                        }
                    }, 1000);


                    map.once('idle', () => {
                        hideLoadingSpinner();
                    });

                } else {
                    // ✅ Toggle layer visibility if already added
                    const visibility = map.getLayoutProperty('google-air-quality', 'visibility');
                    const newVisibility = visibility === 'visible' ? 'none' : 'visible';
                    map.setLayoutProperty('google-air-quality', 'visibility', newVisibility);


                    hideLoadingSpinner();
                }
            } else {

                // ✅ Hide heatmap UI
                heatmapBox.style.display = "none";

                // ✅ Switch to another Mapbox basemap
                const style = `mapbox://styles/mapbox/${selectedBasemap}`;
                map.setStyle(style);

                map.once('style.load', () => {
                    addDataLayers(map);

                    map.once('idle', () => {
                        restoreLayerVisibility(map);
                        hideLoadingSpinner();
                    });



                    // ✅ Re-add Brick Kiln layers only if their respective checkboxes are checked
                    if (document.getElementById('toggleBKPK').checked) loadBrickKilnLayerPK(map);
                    if (document.getElementById('toggleBKIND').checked) loadBrickKilnLayerIND(map);
                    if (document.getElementById('toggleBKBAN').checked) loadBrickKilnLayerBAN(map);
                    if (document.getElementById('toggleBKDRC').checked) loadBrickKilnLayerDRC(map);
                    if (document.getElementById('toggleBKNGA').checked) loadBrickKilnLayerNGA(map);
                    if (document.getElementById('toggleBKUGA').checked) loadBrickKilnLayerUGA(map);
                    if (document.getElementById('toggleBKGHA').checked) loadBrickKilnLayerGHA(map);

                    if (document.getElementById('toggleHexGridPAK').checked) loadBrickKilnLayerPKhex(map);
                    if (document.getElementById('toggleHexGridIND').checked) loadBrickKilnLayerINDhex(map);
                    if (document.getElementById('toggleHexGridBAN').checked) loadBrickKilnLayerBANhex(map);

                    logLayerVisibility(map);
                });
            }

            // 🔁 Watch the heatmap toggle checkbox to revert to light basemap when turned off
            const heatmapToggle = document.getElementById('heatmapToggle');
            if (heatmapToggle) {
                heatmapToggle.addEventListener('change', function () {
                    if (!this.checked) {
                        // Set radio input back to light-v11
                        const lightRadio = document.getElementById('light-v11');
                        if (lightRadio) lightRadio.checked = true;

                        // Hide the heatmap box
                        heatmapBox.style.display = "none";

                        // Remove heatmap layer if visible
                        if (map.getLayer('google-air-quality')) {
                            map.setLayoutProperty('google-air-quality', 'visibility', 'none');
                        }

                    }
                });
            }


            menu.style.display = 'none'; // Hide menu after selection
        });
    });

    // ✅ Load default layers when map is initialized
    map.on('load', () => {
        addDataLayers(map);
    });
}
