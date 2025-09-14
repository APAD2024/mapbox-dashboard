import { saveLayerVisibility, restoreLayerVisibility } from './layerVisibility.js';
import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';
import { initializeLayerVisibilityControls } from './layerVisibility.js';

export function initializeBasemapMenu(map) {
    const basemapMenuButton = document.getElementById('basemapMenuButton');
    const menu = document.getElementById('menu');

    // Toggle menu visibility
    basemapMenuButton.onclick = () => {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    };

    document.querySelector('#menu .closeButton')?.addEventListener('click', () => {
        menu.style.display = 'none';
    });

    const inputs = document.querySelectorAll('#menu input[type="radio"]');

    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const selectedBasemap = input.value;
            saveLayerVisibility(map);      // Save current visibility
            showLoadingSpinner();

            // Switch Mapbox basemap
            const style = `mapbox://styles/mapbox/${selectedBasemap}`;
            map.setStyle(style);

            map.once('style.load', () => {
                // Re-add all layers
                initializeLayerVisibilityControls(map);

                // Restore previous visibility
                restoreLayerVisibility(map);

                hideLoadingSpinner();
            });

            menu.style.display = 'none'; // Hide menu after selection
        });
    });
}
