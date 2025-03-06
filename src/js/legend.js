import { toggleLayerVisibility, initializeLayerVisibilityControls } from './layerVisibility.js';

/**
 * Handles legend interactions like toggling sections, drag-and-drop reordering, and checkbox sync
 */
export function initializeLegend(map) {
    initializeLayerVisibilityControls(map); // Ensure layer visibility controls are set up

    // Define a mapping for legend section IDs to actual layer IDs
    const layerGroups = {
        'legend-brickKiln': ['BK_PK', 'BK_IND', 'BK_BAN'], // Brick Kiln layers
        'legend-brickKilnGrid': ['brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN'], // Hex layers
        'legend-brickKilnAfc': ['brick_kilns_DRC', 'brick_kilns_NGA', 'brick_kilns_UGA', 'brick_kilns_GHA'],
    };

    // Enable dragging for legend sections
    let draggedElement = null;
    document.querySelectorAll('.legend-section').forEach((item) => {
        item.addEventListener('dragstart', function (e) {
            draggedElement = e.target;
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('drop', function (e) {
            e.preventDefault();
            if (draggedElement !== this) {
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
                reorderMapLayers(map);
            }
        });
    });

    /**
     * Reorder map layers based on the new legend order
     */
    function reorderMapLayers(map) {
        const layerOrder = [];
        document.querySelectorAll('.legend-section').forEach((item) => {
            const legendId = item.id;

            if (layerGroups[legendId]) {
                layerOrder.push(...layerGroups[legendId]);
            } else {
                const layerId = legendId.replace('legend-', '');
                layerOrder.push(layerId);
            }
        });

        for (let i = layerOrder.length - 1; i >= 0; i--) {
            const layerId = layerOrder[i];
            if (map.getLayer(layerId)) {
                map.moveLayer(layerId);
            }
        }
    }

    /**
     * Expand/Collapse legend sections WITHOUT affecting visibility
     */
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'none' || content.style.display === '' ? 'block' : 'none';
        });
    });

    /**
     * Make parent toggles expand/collapse only
     */
    document.getElementById('toggleBrickKilns').addEventListener('click', function () {
        const content = document.getElementById('brickKilnCountries');
    
        if (content.style.display === 'none' || content.classList.contains('hidden')) {
            content.style.display = 'block';  // Show children
            content.classList.remove('hidden');
            this.innerHTML = '-';  // Change the button to collapse mode
        } else {
            content.style.display = 'none';  // Hide children
            content.classList.add('hidden');
            this.innerHTML = '+';  // Change the button to expand mode
        }
    });
    
    document.getElementById('toggleBrickKilnsGrid').addEventListener('click', function () {
        const content = document.getElementById('BrickKilnsGrid');
    
        if (content.style.display === 'none' || content.classList.contains('hidden')) {
            content.style.display = 'block';  // Show children
            content.classList.remove('hidden');
            this.innerHTML = '-';  // Change the button to collapse mode
        } else {
            content.style.display = 'none';  // Hide children
            content.classList.add('hidden');
            this.innerHTML = '+';  // Change the button to expand mode
        }
    });

    document.getElementById('toggleBrickKilnsAFC').addEventListener('click', function () {
        const content = document.getElementById('brickKilnAfcCountries');
    
        if (content.style.display === 'none' || content.classList.contains('hidden')) {
            content.style.display = 'block';  // Show children
            content.classList.remove('hidden');
            this.innerHTML = '-';  // Change the button to collapse mode
        } else {
            content.style.display = 'none';  // Hide children
            content.classList.add('hidden');
            this.innerHTML = '+';  // Change the button to expand mode
        }
    });



    /**
     * Legend Visibility Toggle
     */
    document.getElementById('legendButton').addEventListener('click', () => {
        const legend = document.getElementById('legend');
        legend.style.display = (legend.style.display === 'none' || legend.style.display === '') ? 'block' : 'none';
    });

    document.querySelector('#legend .closeButton').addEventListener('click', () => {
        document.getElementById('legend').style.display = 'none';
    });

    /**
     * Apply legend checkbox states to map layers
     */
    document.querySelectorAll('.legend-section input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const layerId = e.target.dataset.layer || e.target.name;
            toggleLayerVisibility(map, layerId, e.target.checked);
        });
    });
}

