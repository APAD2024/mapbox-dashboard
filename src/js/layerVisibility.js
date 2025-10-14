import {
    loadBrickKilnLayerBAN,
    loadBrickKilnLayerDRC,
    loadBrickKilnLayerGHA,
    loadBrickKilnLayerIND,
    loadBrickKilnLayerNGA,
    loadBrickKilnLayerPK,
    loadBrickKilnLayerUGA
} from './brickKilns.js';

// import {
//     loadADM3BrickKilnsIndia,
//     loadADM3BrickKilnsPakistan
// } from './brickKilnadm3.js';

import { loadGroupLayers, loadSymbolLayer, loadOpenAQLayer, loadPollutionReportsLayer } from './layers.js';


// const layerPromise = fetchAndAddPollutionLayer(map);
// setupLayerToggle(map, 'toggleReportedPollution', layerPromise, 'pollution_reports');
// Store visibility states
let layerVisibility = {};

// Default list of layers (modify as needed)
const defaultLayerIds = [
    'coal', 'population', 'fossil_fuel', 'gpw',
    'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 'cement_igp',
    'furnace_oil_IGP', 'paper_pulp_igp', 'steel_igp',
    'solid_waste_igp', 'coal_africa', 'cement_africa', 'paper_pulp_africa',
    'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA',
    'brick_kilns_NGA', 'adm3_PAK', 'adm3_IND', 'adm3_BAN','boilers','pollution_reports','openaq_latest'
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


// Function to toggle one or multiple layers
export function toggleLayerVisibility(map, layerIds, isChecked) {
    const visibility = isChecked ? 'visible' : 'none';

    // Make sure layerIds is always an array
    const layers = Array.isArray(layerIds) ? layerIds : [layerIds];

    layers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
        }

        const outlineId = `${layerId}-outline`;
        if (map.getLayer(outlineId)) {
            map.setLayoutProperty(outlineId, 'visibility', visibility);
        }
    });
}
/**
 * Sets up a toggle for a group of layers
 * @param {Object} map - The Mapbox or Leaflet map instance
 * @param {string} checkboxId - The ID of the checkbox element
 * @param {Array} layers - Array of objects: { id: string, load: function(map) }
 */

const brickKilnLayers = [
    { id: 'brick_kilns_PK', load: loadBrickKilnLayerPK },
    { id: 'brick_kilns_IND', load: loadBrickKilnLayerIND },
    { id: 'brick_kilns_BAN', load: loadBrickKilnLayerBAN },
    { id: 'brick_kilns_DRC', load: loadBrickKilnLayerDRC },
    { id: 'brick_kilns_GHA', load: loadBrickKilnLayerGHA },
    { id: 'brick_kilns_UGA', load: loadBrickKilnLayerUGA },
    { id: 'brick_kilns_NGA', load: loadBrickKilnLayerNGA }
];

// Function to handle checkbox changes for standard layers
export function setupLayerToggle(map, checkboxId, layerPromise, layerId) {
  const checkbox = document.getElementById(checkboxId);
  if (!checkbox) return;

  // When checkbox changes, toggle layer visibility
  checkbox.addEventListener("change", (e) => {
    toggleLayerVisibility(map, layerId, e.target.checked);
  });

  // When the layer is added, set initial visibility based on checkbox
  layerPromise.then(() => {
    toggleLayerVisibility(map, layerId, checkbox.checked);
  });
}

// Function to handle checkbox for a group of layers
export function setupGroupLayerToggle(map, checkboxId, layers) {
    const loadedLayers = {};

    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    const loadAndToggle = (layer, show) => {
        if (!loadedLayers[layer.id]) {
            loadedLayers[layer.id] = layer.load(map).then(() => {
                toggleLayerVisibility(map, layer.id, show);

                // Add pointer cursor on hover for this layer
                map.on('mouseenter', layer.id, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', layer.id, () => {
                    map.getCanvas().style.cursor = aggregateToolEnabled ? 'crosshair' : '';
                });
            });
        } else {
            toggleLayerVisibility(map, layer.id, show);
        }
    };

    // Trigger for initial checked state
    if (checkbox.checked) {
        layers.forEach(layer => loadAndToggle(layer, true));
    }

    checkbox.addEventListener("change", (e) => {
        const show = e.target.checked;
        layers.forEach(layer => loadAndToggle(layer, show));
    });
}


// Function to get HSLA color from CSS variable with optional alpha (opacity) override
function hslaVar(varName, alpha = 1) {
  const hsla = getComputedStyle(document.documentElement)
                 .getPropertyValue(varName)
                 .trim();
  // replace existing alpha with new alpha
  return hsla.replace(/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*[\d.]+\)/, `hsla($1, $2%, $3%, ${alpha})`);
}

const layerStyles = {
    //Group 1: Extraction or primary energy generation (Cross symbol)
    coal: { circleColor: hslaVar('--vivid-green', 0.2), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--vivid-green') },

    fossilFuel: { circleColor: hslaVar('--blue', 0.2), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--blue') },

    furnaceOil: { circleColor: hslaVar('--purple', 0.25), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--purple') },

    //Group 2: Manufacturing or secondary energy generation (Red hues)
    steel: { circleColor: hslaVar('--yellow', 0.5), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--yellow') },
    
    paperPulp: { circleColor: hslaVar('--pink', 0.5), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--pink') },
    
    cement:{ circleColor: hslaVar('--dark-orange', 0.25), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--dark-orange') }, 

    brickKiln:{ circleColor: hslaVar('--red', 0.25), circleRadius: 1, strokeWidth: 0, strokeColor: hslaVar('--red')},
    
    boilers:{ circleColor: hslaVar('--red', 0.25), circleRadius: 20, strokeWidth: 1, strokeColor: hslaVar('--red') },  

    //Group 3: tertiary
    landFillWaste :{ circleColor: hslaVar('--yellow', 0), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--yellow') },

    gpw: { circleColor: hslaVar('--blue', 0), circleRadius: 10, strokeWidth: 1, strokeColor: hslaVar('--blue') },
};

//Initialize all legend layer toggles
export function initializeLayerVisibilityControls(map) {
    
    setupGroupLayerToggle(map, "toggleCoal", [
    { id: "coal", load: (map) => loadGroupLayers(
        map,
        "coal",
        "coal_IGP",
        "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Coal+Plants/coal_plants_main.geojson",
        layerStyles.coal.circleColor, layerStyles.coal.circleRadius, layerStyles.coal.strokeWidth, layerStyles.coal.strokeColor
    )},
    { id: "coal_africa", load: (map) => loadGroupLayers(
        map,
        "coal_africa",
        "coal_Afc",
        "https://gist.githubusercontent.com/Mseher/b3f5e885ddae2b90be7048f87896ef48/raw/57db894dc8237b9d09a8f3ed1a5e114400cfc49f/Africa_Coal.geojson",
        layerStyles.coal.circleColor, layerStyles.coal.circleRadius, layerStyles.coal.strokeWidth, layerStyles.coal.strokeColor
        )}
    ]);

    setupGroupLayerToggle(map, "toggleFossilFuel", [
        { id: "fossil_fuel", load: (map) => loadGroupLayers(
            map,
            "fossil_fuel",
            "fossilFuel",
            "https://gist.githubusercontent.com/bilalpervaiz/597c50eff1747c1a3c8c948bef6ccc19/raw/6984d3a37d75dc8ca7489ee031377b2d57da67d2/fossil_fuel.geojson",
            layerStyles.fossilFuel.circleColor, layerStyles.fossilFuel.circleRadius, layerStyles.fossilFuel.strokeWidth, layerStyles.fossilFuel.strokeColor
        )}
    ]);

     setupGroupLayerToggle(map, "toggleFurnaceOil", [
        { id: "furnace_oil_IGP", load: (map) => loadGroupLayers(
            map,
            "furnace_oil_IGP",
            "furnaceoilIGP",
            "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/oil_and_gas/Furnace_oil_main.geojson",
            layerStyles.furnaceOil.circleColor, layerStyles.furnaceOil.circleRadius, layerStyles.furnaceOil.strokeWidth, layerStyles.furnaceOil.strokeColor
        )}
    ]);

    setupGroupLayerToggle(map, "toggleFurnaceOil", [
        { id: "furnace_oil_IGP", load: (map) => loadSymbolLayer(
            map,
            "furnace_oil_IGP",
            "furnaceoilIGP",
            "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/oil_and_gas/Furnace_oil_main.geojson",
               "./src/assets/cross_furnace-oil.png", 0.1
        )}
    ]);

    //Group 3: Tertiary or waste management (green hues)

    setupGroupLayerToggle(map, "toggleLandFillWaste", [
    { id: "solid_waste_IGP", load: (map) => loadGroupLayers(
        map,
        "solid_waste_IGP",
        "solidWasteIGP",
        "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Plastic+and+Landfill+Sites/waste_main.geojson",
        layerStyles.landFillWaste.circleColor, layerStyles.landFillWaste.circleRadius, layerStyles.landFillWaste.strokeWidth, layerStyles.landFillWaste.strokeColor
    )}
    ]);

     setupGroupLayerToggle(map, "toggleGPW", [
    { id: "gpw", load: (map) => loadGroupLayers(
        map,
        "gpw",
        "GPW",
        "https://gist.githubusercontent.com/bilalpervaiz/e2c93d2017fc1ed90f9a6d5259701a5e/raw/4dd19fe557d29b9268f11e233169948e95c24803/GPW.geojson",
        layerStyles.gpw.circleColor, layerStyles.gpw.circleRadius, layerStyles.gpw.strokeWidth, layerStyles.gpw.strokeColor
    )}
    ]);
   

    //Group 2: Manufacturing or secondary energy generation (Circles)
    setupGroupLayerToggle(map, "toggleSteel", [
    { id: "steel_IGP", load: (map) => loadGroupLayers(
        map,
        "steel_IGP",
        "steelIGP",
        "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Steel+Plants/steel_plants_main.geojson",
        layerStyles.steel.circleColor, layerStyles.steel.circleRadius, layerStyles.steel.strokeWidth, layerStyles.steel.strokeColor
    )},
    { id: "steel_africa", load: (map) => loadGroupLayers(
        map,
        "steel_africa",
        "steel_Afc",
        "https://gist.githubusercontent.com/Mseher/23af19444bdc70b115afcb6cc45879ec/raw/eda2bc6398aaa50595cfc7ed81bbca1d15d78c31/Steel_Plants_Africa.geojson",
        layerStyles.steel.circleColor, layerStyles.steel.circleRadius, layerStyles.steel.strokeWidth, layerStyles.steel.strokeColor
        )}
    ]);

    setupGroupLayerToggle(map, "togglePaperPulp", [
    { id: "paper_pulp_IGP", load: (map) => loadGroupLayers(
        map,
        "paper_pulp_IGP",
        "paperPulpIGP",
        "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Pulp+and+Paper+Plants/paper_pulp_main.geojson",
    layerStyles.paperPulp.circleColor, layerStyles.paperPulp.circleRadius, layerStyles.paperPulp.strokeWidth, layerStyles.paperPulp.strokeColor     
    )},

    { id: "paper_pulp_africa", load: (map) => loadGroupLayers(
        map,
        "paper_pulp_africa",
        "paper_Pulp_Afc",
        "https://gist.githubusercontent.com/Mseher/d77d22cea85ac0f3ef184a48d0aa1bba/raw/0751824b8af6cb919a8ec2aab869367987345545/Paper_pulp_Africa.geojson",
        layerStyles.paperPulp.circleColor, layerStyles.paperPulp.circleRadius, layerStyles.paperPulp.strokeWidth, layerStyles.paperPulp.strokeColor 
    )}
    ]);
      
    setupGroupLayerToggle(map, "toggleBrickKilns", brickKilnLayers);
      
    setupGroupLayerToggle(map, "toggleCement", [
    { id: "cement_IGP", load: (map) => loadGroupLayers(
        map,
        "cement_IGP",
        "cementIGP",
        "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Cement+Plants/cement_plants_main.geojson",
        layerStyles.cement.circleColor, layerStyles.cement.circleRadius, layerStyles.cement.strokeWidth, layerStyles.cement.strokeColor
    )},
    { id: "cement_africa", load: (map) => loadGroupLayers(
        map,
        "cement_africa",
        "cement_Afc",
        "https://gist.githubusercontent.com/Mseher/3c778bdbd8464ddc939b41c87e145bbc/raw/c605634a3e418b2a52a2125a3943d432d688755f/cement_africa.geojson",
        layerStyles.cement.circleColor, layerStyles.cement.circleRadius, layerStyles.cement.strokeWidth, layerStyles.cement.strokeColor
    )}
    ]);

    setupGroupLayerToggle(map, "toggleBoilers", [
    { id: "boilers", load: (map) => loadGroupLayers(
        map,
        "boilers",
        "boilers_layer",
        "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/boilers/boilers.geojson",
        layerStyles.boilers.circleColor, layerStyles.boilers.circleRadius, layerStyles.boilers.strokeWidth, layerStyles.boilers.strokeColor
    )}
    ]);

    
    // const layerPromise = fetchAndAddPollutionLayer(map);
    // setupLayerToggle(map, 'toggleReportedPollution', layerPromise, 'pollution_reports');

    //   setupGroupLayerToggle(map, "toggleOilGas", [
    //     { id: "oil_gas_IGP", load: (map) => loadGroupLayers(
    //       map,
    //       "oil_gas_IGP",
    //       "oilgasIGP",
    //       "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/oil_and_gas/oil_gas_refining_main.geojson",
    //       "rgba(63, 138, 192, 0,25)", 10, 1, "rgba(63, 138, 192, 1)"
    //     )}
    //   ]);
      

      // Setup other groups or single layers similarly...
}

// export function buttonLayerVisibility(map, layerId, isVisible) {
//   if (!map.getLayer(layerId)) return;
//   map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
// }

// export function initLayerVisibility(map) {
//   const aqButton = document.getElementById('buttonOpenAQData');
//   const tooltipAQ = document.getElementById('tooltipAQ');

//   if (aqButton) {
//     aqButton.addEventListener('click', async () => {
//       const layerId = 'openaq_latest';

//       // If not loaded, load first
//       if (!map.getLayer(layerId)) {
//         await loadOpenAQLayer(map);
//       }


//       const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
//       const isVisible = currentVisibility === 'visible';

//       buttonLayerVisibility(map, layerId, !isVisible);
//       aqButton.classList.toggle('active', !isVisible);
//       tooltipAQ.style.display = !isVisible ? 'block' : 'none';
//     });
//   }
// }


export function buttonLayerVisibility(map, layerId, isVisible) {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
}

// Reusable config for all buttons/layers
const layerConfigs = [
  {
    buttonId: 'buttonOpenAQData',
    tooltipId: 'tooltipAQ',
    layerId: 'openaq_latest',
    loadFn: loadOpenAQLayer,
  },
  {
    buttonId: 'buttonPollutionReports',
    tooltipId: 'tooltipPollutionReports',
    layerId: 'pollution_reports',
    loadFn: loadPollutionReportsLayer,
  },
];

export function initLayerVisibility(map) {
  layerConfigs.forEach(({ buttonId, tooltipId, layerId, loadFn }) => {
    const button = document.getElementById(buttonId);
    const tooltip = document.getElementById(tooltipId);

    if (!button) return;

    button.addEventListener('click', async () => {
      // Load layer if not yet added
      if (!map.getLayer(layerId)) {
        await loadFn(map);
      }

      const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
      const isVisible = currentVisibility === 'visible';

      buttonLayerVisibility(map, layerId, !isVisible);
      button.classList.toggle('active', !isVisible);

      if (tooltip) {
        if (!isVisible) {
          tooltip.style.display = 'block';

          // Hide tooltip after 3 seconds
          clearTimeout(tooltip.hideTimeout);
          tooltip.hideTimeout = setTimeout(() => {
            tooltip.style.display = 'none';
          }, 3000);
        } else {
          tooltip.style.display = 'none';
        }
      }
    });
  });
}





    // Standard Industry Layer Toggles
    //setupLayerToggle(map, 'toggleCoal', 'coal');
    // setupLayerToggle(map, 'toggleFossil', 'fossil');
    // setupLayerToggle(map, 'toggleCementIGP', 'cement_IGP');
    // setupLayerToggle(map, 'toggleOilGasIGP', 'oil_gas_IGP');
    // setupLayerToggle(map, 'toggleSteelIGP', 'steel_IGP');
    // setupLayerToggle(map, 'toggleSolidWasteIGP', 'solid_waste_IGP');
    // setupLayerToggle(map, 'toggleGPW', 'gpw');
    // setupLayerToggle(map, 'togglepop', 'population');
    // setupLayerToggle(map, 'toggledecay', 'pollutant');
    // setupLayerToggle(map, 'toggleBoilers', 'boilers');
    // setupLayerToggle(map,'toggleReportedPollution','pollution_reports');
    // setupLayerToggle(map,'toggleOpenAQData','openaq_latest');
    // setupGroupLayerToggle(map, 'toggleBrickKilnAll', brickKilnLayers);
    // setupGroupLayerToggle(map, 'toggleBrickKilnGrid', brickKilnGridLayers);
    
    // setupGroupLayerToggle(map, "toggleCoal", [
    //     { id: "coal", load: (map) => loadGroupLayers(
    //     map,
    //     "coal",
    //     "coal_IGP",
    //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Coal+Plants/coal_plants_main.geojson",
    //     "rgba(206, 112, 112, 1)"
    //     )
    //     }, 
    //     { id: "coal_africa", load: (map) => loadGroupLayers(
    //     map,
    //     "coal_africa",
    //     "coal_Afc",
    //     "https://gist.githubusercontent.com/Mseher/b3f5e885ddae2b90be7048f87896ef48/raw/57db894dc8237b9d09a8f3ed1a5e114400cfc49f/Africa_Coal.geojson",
    //     "rgba(206, 112, 112, 1)"
    //     )
    //     }
    //     ]);
    //  setupGroupLayerToggle(map, "toggleCementAll", [   
    //     { id: "cement_IGP", load: (map) => loadGroupLayers(
    //     map,
    //     "cement_IGP",
    //     "cementIGP",
    //     "https://gist.githubusercontent.com/Mseher/cement_plants_main/raw/0751824b8af6cb919a8ec2aab869367987345545/Paper_pulp_Africa.geojson",
    //     "rgba(221, 0, 251, 1)"
    //     )
    //     },
    //     { id: "cement_africa", load: (map) => loadGroupLayers(
    //     map,
    //     "paper_pulp_IGP",
    //     "cement_Afc",
    //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Pulp+and+Paper+Plants/paper_pulp_main.geojson",
    //     "rgba(221, 0, 251, 1)"
    //     )
    //     },
    //     ]);


