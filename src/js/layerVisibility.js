import {
    loadBrickKilnLayerPK, loadBrickKilnLayerIND, loadBrickKilnLayerBAN,
    loadBrickKilnLayerPKhex, loadBrickKilnLayerINDhex, loadBrickKilnLayerBANhex,
    loadBrickKilnLayerDRC, loadBrickKilnLayerNGA, loadBrickKilnLayerUGA, loadBrickKilnLayerGHA
} from './brickKilns.js';

import {
    loadADM3BrickKilnsPakistan,
    loadADM3BrickKilnsIndia
} from './brickKilnadm3.js';

// Store visibility states
// Store visibility states
let layerVisibility = {};

// Default list of layers (modify as needed)
const defaultLayerIds = [
    'coal', 'population', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN',
    'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'cement_igp',
    'oil_gas_igp', 'paper_pulp_igp', 'steel_igp',
    'solid_waste_igp', 'coal_africa', 'cement_africa', 'paper_pulp_africa',
    'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA',
    'brick_kilns_NGA', 'adm3_PAK', 'adm3_IND', 'adm3_BAN'
];

// Function to save layer visibility
export function saveLayerVisibility(map, layerIds = defaultLayerIds) {
    if (!layerIds || !Array.isArray(layerIds)) {
        console.error("saveLayerVisibility Error: layerIds is undefined or not an array.");
        return;
    }

    layerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            layerVisibility[layerId] = visibility ? visibility : 'none';
        }
    });

    console.log("Layer visibility saved:", layerVisibility);
}

// Function to restore layer visibility
export function restoreLayerVisibility(map) {
    Object.keys(layerVisibility).forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', layerVisibility[layerId]);
        }
    });

    console.log("Layer visibility restored:", layerVisibility);
}

// Function to log layer visibility
export function logLayerVisibility(map, layers = defaultLayerIds) {
    layers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            console.log(`Layer: ${layerId}, Visibility: ${visibility}`);
        } else {
            console.log(`Layer: ${layerId} does not exist or hasn't been loaded yet.`);
        }
    });
}


/**
 * Function to toggle layer visibility dynamically
 */
export function toggleLayerVisibility(map, layerId, isChecked) {
    if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', isChecked ? 'visible' : 'none');
    }
    if (map.getLayer(`${layerId}-outline`)) {
        map.setLayoutProperty(`${layerId}-outline`, 'visibility', visible ? 'visible' : 'none');
    }
}

/**
 * Function to handle checkbox changes for standard layers
 */
export function setupLayerToggle(map, checkboxId, layerId) {
    document.getElementById(checkboxId).addEventListener('change', (e) => {
        toggleLayerVisibility(map, layerId, e.target.checked);
    });
}

/**
 * Function to handle loading brick kiln layers dynamically when toggled
 */
export function setupBrickKilnToggle(map, checkboxId, layerId, loadFunction) {
    document.getElementById(checkboxId).addEventListener('change', (e) => {
        if (e.target.checked) {
            loadFunction(map);
        } else {
            toggleLayerVisibility(map, layerId, false);
        }
    });
}

/**
 * Initialize all legend layer toggles
 */
export function initializeLayerVisibilityControls(map) {
    // Standard Industry Layer Toggles
    setupLayerToggle(map, 'toggleFossil', 'fossil');
    setupLayerToggle(map, 'toggleCoal', 'coal');
    setupLayerToggle(map, 'toggleCementIGP', 'cement_IGP');
    setupLayerToggle(map, 'toggleOilGasIGP', 'oil_gas_IGP');
    setupLayerToggle(map, 'togglePaperPulpIGP', 'paper_pulp_IGP');
    setupLayerToggle(map, 'toggleSteelIGP', 'steel_IGP');
    setupLayerToggle(map, 'toggleSolidWasteIGP', 'solid_waste_IGP');
    setupLayerToggle(map, 'toggleGPW', 'gpw');
    setupLayerToggle(map, 'togglepop', 'population');
    setupLayerToggle(map, 'toggledecay', 'pollutant');

    // Brick Kiln Layers
    setupBrickKilnToggle(map, 'toggleBKPK', 'BK_PK', loadBrickKilnLayerPK);
    setupBrickKilnToggle(map, 'toggleBKIND', 'BK_IND', loadBrickKilnLayerIND);
    setupBrickKilnToggle(map, 'toggleBKBAN', 'BK_BAN', loadBrickKilnLayerBAN);
    setupBrickKilnToggle(map, 'toggleHexGridPAK', 'brick_kilns_PK', loadBrickKilnLayerPKhex);
    setupBrickKilnToggle(map, 'toggleHexGridIND', 'brick_kilns_IND', loadBrickKilnLayerINDhex);
    setupBrickKilnToggle(map, 'toggleHexGridBAN', 'brick_kilns_BAN', loadBrickKilnLayerBANhex);

    // ADM-3 Brick Kilns
    setupBrickKilnToggle(map, 'toggleadm3_PAK', 'adm3_PAK', loadADM3BrickKilnsPakistan);
    setupBrickKilnToggle(map, 'toggleadm3_IND', 'adm3_IND', loadADM3BrickKilnsIndia);
    // Optional future setup: setupBrickKilnToggle(map, 'toggleadm3_BAN', 'adm3_BAN', loadADM3BrickKilnsBangladesh);


    // Africa Brick Kiln Layers
    setupBrickKilnToggle(map, 'toggleBKDRC', 'brick_kilns_DRC', loadBrickKilnLayerDRC);
    setupBrickKilnToggle(map, 'toggleBKGHA', 'brick_kilns_GHA', loadBrickKilnLayerGHA);
    setupBrickKilnToggle(map, 'toggleBKUGA', 'brick_kilns_UGA', loadBrickKilnLayerUGA);
    setupBrickKilnToggle(map, 'toggleBKNGA', 'brick_kilns_NGA', loadBrickKilnLayerNGA);

    // Africa Region Industry Layers
    setupLayerToggle(map, 'toggleCoalAfrica', 'coal_africa');
    setupLayerToggle(map, 'toggleCementAfrica', 'cement_africa');
    setupLayerToggle(map, 'togglePaperPulpAfrica', 'paper_pulp_africa');
    setupLayerToggle(map, 'toggleSteelAfrica', 'steel_africa');

    /**
     * **Fix Parent Toggles**
     * - Parents should only expand/collapse child layers
     * - They should NOT control visibility
     */

    // Parent Toggle: Brick Kilns
    document.getElementById('toggleBrickKilns').addEventListener('click', (e) => {
        document.getElementById('brickKilnCountries').classList.toggle('hidden');
    });

    // Parent Toggle: Brick Kilns Grid
    document.getElementById('toggleBrickKilnsGrid').addEventListener('click', (e) => {
        document.getElementById('BrickKilnsGrid').classList.toggle('hidden');
    });

    document.getElementById('toggleBrickKilnsAdm3').addEventListener('click', () => {
        document.getElementById('brickKilnAdm3').classList.toggle('hidden');
    });

    // Parent Toggle: Africa Brick Kilns
    document.getElementById('toggleBrickKilnsAFC').addEventListener('click', (e) => {
        document.getElementById('brickKilnAfcCountries').classList.toggle('hidden');
    });

    // Toggle Legend Visibility
    document.getElementById('legendButton').addEventListener('click', () => {
        const legend = document.getElementById('legend');
        legend.style.display = (legend.style.display === 'none' || legend.style.display === '') ? 'block' : 'none';
    });

    document.querySelector('#legend .closeButton').addEventListener('click', () => {
        document.getElementById('legend').style.display = 'none';
    });
}

