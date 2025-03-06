import { 
    loadBrickKilnLayerPK, loadBrickKilnLayerIND, loadBrickKilnLayerBAN, 
    loadBrickKilnLayerPKhex, loadBrickKilnLayerINDhex, loadBrickKilnLayerBANhex,
    loadBrickKilnLayerDRC, loadBrickKilnLayerNGA, loadBrickKilnLayerUGA, loadBrickKilnLayerGHA 
} from './brickKilns.js';

// Store visibility states
// Store visibility states
let layerVisibility = {};

// Default list of layers (modify as needed)
const defaultLayerIds = [
    'coal', 'population', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN',
    'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'cement_igp',
    'oil_gas_igp', 'paper_pulp_igp', 'steel_igp', 'plastic_waste_igp',
    'solid_waste_igp', 'coal_africa', 'cement_africa', 'paper_pulp_africa',
    'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA',
    'brick_kilns_NGA'
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
    setupLayerToggle(map, 'togglePlasticWasteIGP', 'plastic_waste_IGP');
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

    // Parent Toggle: Brick Kilns
    document.getElementById('toggleBrickKilns').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.getElementById('brickKilnCountries').style.display = isChecked ? 'block' : 'none';
        
        document.getElementById('toggleBKPK').checked = isChecked;
        document.getElementById('toggleBKIND').checked = isChecked;
        document.getElementById('toggleBKBAN').checked = isChecked;
        
        toggleLayerVisibility(map, 'BK_PK', isChecked);
        toggleLayerVisibility(map, 'BK_IND', isChecked);
        toggleLayerVisibility(map, 'BK_BAN', isChecked);

        if (isChecked) {
            loadBrickKilnLayerPK(map);
            loadBrickKilnLayerIND(map);
            loadBrickKilnLayerBAN(map);
        }
    });

    // Parent Toggle: Brick Kilns Grid
    document.getElementById('toggleBrickKilnsGrid').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.getElementById('BrickKilnsGrid').style.display = isChecked ? 'block' : 'none';

        document.getElementById('toggleHexGridPAK').checked = isChecked;
        document.getElementById('toggleHexGridIND').checked = isChecked;
        document.getElementById('toggleHexGridBAN').checked = isChecked;

        toggleLayerVisibility(map, 'brick_kilns_PK', isChecked);
        toggleLayerVisibility(map, 'brick_kilns_IND', isChecked);
        toggleLayerVisibility(map, 'brick_kilns_BAN', isChecked);

        if (isChecked) {
            loadBrickKilnLayerPKhex(map);
            loadBrickKilnLayerINDhex(map);
            loadBrickKilnLayerBANhex(map);
        }
    });

    // Parent Toggle: Africa Brick Kilns
    document.getElementById('toggleBrickKilnsAFC').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.getElementById('brickKilnAfcCountries').style.display = isChecked ? 'block' : 'none';

        document.getElementById('toggleBKDRC').checked = isChecked;
        document.getElementById('toggleBKGHA').checked = isChecked;
        document.getElementById('toggleBKNGA').checked = isChecked;
        document.getElementById('toggleBKUGA').checked = isChecked;

        toggleLayerVisibility(map, 'brick_kilns_DRC', isChecked);
        toggleLayerVisibility(map, 'brick_kilns_GHA', isChecked);
        toggleLayerVisibility(map, 'brick_kilns_NGA', isChecked);
        toggleLayerVisibility(map, 'brick_kilns_UGA', isChecked);

        if (isChecked) {
            loadBrickKilnLayerDRC(map);
            loadBrickKilnLayerNGA(map);
            loadBrickKilnLayerUGA(map);
            loadBrickKilnLayerGHA(map);
        }
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
