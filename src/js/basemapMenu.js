import { saveLayerVisibility, restoreLayerVisibility, logLayerVisibility } from './layerVisibility.js';
import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { 
    loadBrickKilnLayerPK, loadBrickKilnLayerIND, loadBrickKilnLayerBAN, 
    loadBrickKilnLayerDRC, loadBrickKilnLayerNGA, loadBrickKilnLayerUGA, loadBrickKilnLayerGHA,
    loadBrickKilnLayerPKhex, loadBrickKilnLayerINDhex, loadBrickKilnLayerBANhex
} from './brickKilns.js';
import { addDataLayers } from './layers.js';
const GOOGLE_AIR_QUALITY_URL = "https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/{z}/{x}/{y}?key=AIzaSyAKE1BVSz3DXjo6bGgr7evdYXGcm-fePRY";

export function initializeBasemapMenu(map) {
    const menuButton = document.getElementById('menuButton');
    const menu = document.getElementById('menu');

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

                    map.addLayer({
                        id: 'google-air-quality',
                        type: 'raster',
                        source: 'google-air-quality',
                        layout: {
                            visibility: 'visible'
                        }
                    });

                    // ✅ Hide spinner once the air quality layer is added
                    map.once('idle', () => {
                        hideLoadingSpinner();
                    });

                } else {
                    // ✅ Toggle layer visibility if already added
                    const visibility = map.getLayoutProperty('google-air-quality', 'visibility');
                    map.setLayoutProperty('google-air-quality', 'visibility', visibility === 'visible' ? 'none' : 'visible');

                    // ✅ Hide spinner immediately since layer exists
                    hideLoadingSpinner();
                }
            } else {
                // ✅ Switch to another Mapbox basemap
                const style = `mapbox://styles/mapbox/${selectedBasemap}`;
                map.setStyle(style);

                map.once('style.load', () => {
                    addDataLayers(map);

                    map.once('idle', () => {
                        restoreLayerVisibility(map);
                        hideLoadingSpinner(); // ✅ Ensure spinner stops after basemap loads
                    });

                    // ✅ Re-add Brick Kiln layers only if their respective checkboxes are checked
                    if (document.getElementById('toggleBKPK').checked) loadBrickKilnLayerPK(map);
                    if (document.getElementById('toggleBKIND').checked) loadBrickKilnLayerIND(map);
                    if (document.getElementById('toggleBKBAN').checked) loadBrickKilnLayerBAN(map);
                    if (document.getElementById('toggleBKDRC').checked) loadBrickKilnLayerDRC(map);
                    if (document.getElementById('toggleBKNGA').checked) loadBrickKilnLayerNGA(map);
                    if (document.getElementById('toggleBKUGA').checked) loadBrickKilnLayerUGA(map);
                    if (document.getElementById('toggleBKGHA').checked) loadBrickKilnLayerGHA(map);

                    // ✅ Load hexagonal Brick Kiln layers based on their toggle state
                    if (document.getElementById('toggleHexGridPAK').checked) loadBrickKilnLayerPKhex(map);
                    if (document.getElementById('toggleHexGridIND').checked) loadBrickKilnLayerINDhex(map);
                    if (document.getElementById('toggleHexGridBAN').checked) loadBrickKilnLayerBANhex(map);

                    logLayerVisibility(map);
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
