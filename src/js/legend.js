import { toggleLayerVisibility, initializeLayerVisibilityControls } from './layerVisibility.js';

/**
 * Handles legend interactions like toggling sections, drag-and-drop reordering, and checkbox sync
 */
export function initializeLegend(map) {
    initializeLayerVisibilityControls(map); // Set up individual layer/brick kiln toggles


    // MARK LEGEND BUTTON AS ACTIVE IF LEGEND IS VISIBLE ON LOAD
    const legend = document.getElementById('legend');
    const legendButton = document.getElementById('legendButton');
    if (legend && legendButton && legend.style.display !== 'none') {
        legendButton.classList.add('active');
    }

    // Define group mappings
    const layerGroups = {
        'legend-brickKiln': ['BK_PK', 'BK_IND', 'BK_BAN'],
        'legend-brickKilnGrid': ['brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN'],
        'legend-brickKilnAfc': ['brick_kilns_DRC', 'brick_kilns_NGA', 'brick_kilns_UGA', 'brick_kilns_GHA'],
        // 'legend-brickKilnAdm3': ['adm3_PAK', 'adm3_IND', 'adm3_BAN'] // ✅ ADM3 layers
    };

    // Enable drag-and-drop
    let draggedElement = null;
    document.querySelectorAll('.legend-section').forEach(item => {
        item.addEventListener('dragstart', e => {
            draggedElement = e.target;
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('drop', e => {
            e.preventDefault();
            if (draggedElement !== item) {
                const legend = document.getElementById('legend-drag');
                const draggingIndex = Array.from(legend.children).indexOf(draggedElement);
                const targetIndex = Array.from(legend.children).indexOf(item);

                if (draggingIndex > targetIndex) {
                    legend.insertBefore(draggedElement, item);
                } else {
                    legend.insertBefore(draggedElement, item.nextSibling);
                }

                reorderMapLayers(map);
            }
        });
    });

    function reorderMapLayers(map) {
        const layerOrder = [];
        document.querySelectorAll('.legend-section').forEach(item => {
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

    // Expand/Collapse logic for each parent
    const expandables = {
        'toggleBrickKilns': 'brickKilnCountries',
        'toggleBrickKilnsGrid': 'BrickKilnsGrid',
        'toggleBrickKilnsAFC': 'brickKilnAfcCountries',
        'toggleBrickKilnsAdm3': 'brickKilnAdm3' // ✅ ADM3 toggle logic
    };

    Object.entries(expandables).forEach(([toggleId, contentId]) => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('click', function () {
                const content = document.getElementById(contentId);
                if (content.style.display === 'none' || content.classList.contains('hidden')) {
                    content.style.display = 'block';
                    content.classList.remove('hidden');
                    this.innerHTML = '-';
                } else {
                    content.style.display = 'none';
                    content.classList.add('hidden');
                    this.innerHTML = '+';
                }
            });
        }
    });

    // Toggle entire legend visibility
    legendButton.addEventListener('click', () => {
        const legend = document.getElementById('legend');
        const isVisible = legend.style.display === 'block';

        legend.style.display = isVisible ? 'none' : 'block';
        legendButton.classList.toggle('active', !isVisible);
    });


    document.querySelector('#legend .closeButton').addEventListener('click', () => {
    const legend = document.getElementById('legend');
    legend.style.display = 'none';

    const legendButton = document.getElementById('legendButton');
    legendButton.classList.remove('active');
    });

    // Checkbox change → update visibility
    document.querySelectorAll('.legend-section input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', e => {
            const layerId = e.target.dataset.layer || e.target.name;
            toggleLayerVisibility(map, layerId, e.target.checked);
        });
    });
}
