import { saveLayerVisibility, restoreLayerVisibility, logLayerVisibility } from './layerVisibility.js';
import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { 
    loadBrickKilnLayerPK, loadBrickKilnLayerIND, loadBrickKilnLayerBAN, 
    loadBrickKilnLayerDRC, loadBrickKilnLayerNGA, loadBrickKilnLayerUGA, loadBrickKilnLayerGHA,
    loadBrickKilnLayerPKhex, loadBrickKilnLayerINDhex, loadBrickKilnLayerBANhex
} from './brickKilns.js';
import { addDataLayers } from './layers.js';

// Function to initialize basemap menu
export function initializeBasemapMenu(map) {
    const menuButton = document.getElementById('menuButton');
    const menu = document.getElementById('menu');

    // Toggle menu visibility
    menuButton.onclick = () => {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    };

    const layerList = document.getElementById('menu');
    const inputs = layerList.getElementsByTagName('input');

    // Handle basemap switching and reloading custom layers based on toggle state
    for (const input of inputs) {
        input.onclick = (layer) => {
            const layerIds = [
                'coal', 'population', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 
                'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 
                'cement_igp', 'oil_gas_igp', 'paper_pulp_igp', 'steel_igp', 
                'plastic_waste_igp', 'solid_waste_igp', 'coal_africa', 
                'cement_africa', 'paper_pulp_africa', 'steel_africa', 
                'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
            ];

            saveLayerVisibility(map, layerIds);
            showLoadingSpinner();

            const style = `mapbox://styles/mapbox/${layer.target.value}`;
            map.setStyle(style);

            map.once('style.load', () => {
                addDataLayers(map);

                map.once('idle', () => {
                    restoreLayerVisibility(map);
                });

                // Re-add Brick Kiln layers only if their respective checkboxes are checked
                if (document.getElementById('toggleBKPK').checked) loadBrickKilnLayerPK(map);
                if (document.getElementById('toggleBKIND').checked) loadBrickKilnLayerIND(map);
                if (document.getElementById('toggleBKBAN').checked) loadBrickKilnLayerBAN(map);
                if (document.getElementById('toggleBKDRC').checked) loadBrickKilnLayerDRC(map);
                if (document.getElementById('toggleBKNGA').checked) loadBrickKilnLayerNGA(map);
                if (document.getElementById('toggleBKUGA').checked) loadBrickKilnLayerUGA(map);
                if (document.getElementById('toggleBKGHA').checked) loadBrickKilnLayerGHA(map);

                // Load hexagonal Brick Kiln layers based on their toggle state
                if (document.getElementById('toggleHexGridPAK').checked) loadBrickKilnLayerPKhex(map);
                if (document.getElementById('toggleHexGridIND').checked) loadBrickKilnLayerINDhex(map);
                if (document.getElementById('toggleHexGridBAN').checked) loadBrickKilnLayerBANhex(map);

                logLayerVisibility(map, layerIds);
                hideLoadingSpinner();
            });

            menu.style.display = 'none'; // Hide the menu after style switch
        };
    }

    // Ensure layers are added when map loads
    map.on('load', () => {
        addDataLayers(map);
    });
}
