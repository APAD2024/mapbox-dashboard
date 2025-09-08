import {
    loadBrickKilnLayerBAN,
    loadBrickKilnLayerDRC,
    loadBrickKilnLayerGHA,
    loadBrickKilnLayerIND,
    loadBrickKilnLayerNGA,
    loadBrickKilnLayerPK,
    loadBrickKilnLayerUGA
} from './brickKilns.js';

// Region-specific data
const igpCountries = ['India', 'Pakistan', 'Bangladesh'];
const africaCountries = ['Nigeria', 'Uganda', 'Congo', 'Ghana'];

// Asset options per region (linked to actual layer IDs)
const igpAssets = [
    { id: 'coal', label: 'Coal IGP' },
    { id: 'cement_IGP', label: 'Cement' },
    { id: 'furnace_oil_IGP', label: 'Furnace Oil' },
    { id: 'paper_pulp_IGP', label: 'Paper Pulp' },
    { id: 'steel_IGP', label: 'Steel' },
    { id: 'solid_waste_IGP', label: 'Solid Waste' },
    // { id: 'fossil', label: 'Fossil Fuel' },
    { id: 'gpw', label: 'GPW' },
    { id: 'brick_kiln', label: 'Brick Kiln' },
    {id:'boilers',label:'Boilers'},
    {id:'pollution_reports',label:'Reported Pollution'},
    {id:'openaq_latest',label:'Pollutants'}
];

const africaAssets = [
    { id: 'coal_africa', label: 'Coal' },
    { id: 'cement_africa', label: 'Cement' },
    { id: 'paper_pulp_africa', label: 'Paper Pulp' },
    { id: 'steel_africa', label: 'Steel Plants' },
    { id: 'brick_kiln', label: 'Brick Kiln' }
];

// Layer IDs used in filters
const layerIds = [
    'coal', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN',
    'cement_IGP', 'furnace_oil_IGP', 'paper_pulp_IGP', 'steel_IGP', 'solid_waste_IGP',
    'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA',
    'brick_kilns_UGA', 'brick_kilns_NGA','boilers','pollution_reports','openaq_latest'
];

const brickKilnIGP = ['BK_PK', 'BK_IND', 'BK_BAN'];
const brickKilnAfc = ['brick_kilns_DRC', 'brick_kilns_GHA',
    'brick_kilns_UGA', 'brick_kilns_NGA']

// Function to update country filter dropdown
export function updateCountryFilter(region) {
    const countryFilter = document.getElementById('countryFilter');
    countryFilter.innerHTML = '<option value="">All</option>';  // Reset and add "All" option

    const countries = region === 'Africa' ? africaCountries : igpCountries;
    countries.forEach(country => {
        countryFilter.innerHTML += `<option value="${country}">${country}</option>`;
    });
}

// Function to update asset filter dropdown
export function updateAssetFilter(region) {
    const assetFilter = document.getElementById('assetFilter');
    assetFilter.innerHTML = '<option value="">All</option>';  // Reset and add "All" option

    const assets = region === 'Africa' ? africaAssets : igpAssets;
    assets.forEach(asset => {
        assetFilter.innerHTML += `<option value="${asset.id}">${asset.label}</option>`;
    });
}

// Function to determine region and update filters accordingly
export function checkRegionAndUpdateFilters(map) {
    const currentCenter = map.getCenter();
    const africaCenter = [20.0, 5.0];
    const asiaCenter = [78.8181577, 28.7650135];

    // Determine the region based on map center
    const isAfrica = Math.abs(currentCenter.lng - africaCenter[0]) < 20;

    updateCountryFilter(isAfrica ? 'Africa' : 'IGP');
    updateAssetFilter(isAfrica ? 'Africa' : 'IGP');
}

// Function to handle asset filter changes
export function handleAssetFilterChange(map) {
    const selectedAsset = document.getElementById('assetFilter').value;
    const isBrickKiln = selectedAsset === 'brick_kiln';

    layerIds.forEach(layerId => {
        let visibility = 'none';

        if (selectedAsset === '' || selectedAsset === layerId) {
            visibility = 'visible';
        }

        if (isBrickKiln && (brickKilnIGP.includes(layerId) || brickKilnAfc.includes(layerId))) {
            visibility = 'visible';

            // 🔄 Dynamically load the Brick Kiln layer if not already present
            if (!map.getLayer(layerId)) {
                if (layerId === 'BK_PK') loadBrickKilnLayerPK(map);
                if (layerId === 'BK_IND') loadBrickKilnLayerIND(map);
                if (layerId === 'BK_BAN') loadBrickKilnLayerBAN(map);

                if (layerId === 'brick_kilns_DRC') loadBrickKilnLayerDRC(map);
                if (layerId === 'brick_kilns_NGA') loadBrickKilnLayerNGA(map);
                if (layerId === 'brick_kilns_UGA') loadBrickKilnLayerUGA(map);
                if (layerId === 'brick_kilns_GHA') loadBrickKilnLayerGHA(map);
            }
        }

        // ✅ Set visibility if layer already exists
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
        }

        // ✅ Sync legend checkbox if exists
        const checkbox = document.querySelector(`input[data-layer="${layerId}"]`);
        if (checkbox) {
            checkbox.checked = (visibility === 'visible');
        }
    });

    // ✅ Reapply country and pollutant filters
    handleCountryAndPollutantFilters(map);
}

// Function to handle country filter changes
export function handleCountryFilterChange(map) {
    const selectedCountry = document.getElementById('countryFilter').value;
    const visibleLayers = getVisibleLayers(map);

    // Apply country filter to all visible layers
    visibleLayers.forEach(layerId => {
        map.setFilter(layerId, [
            'all',
            ...(selectedCountry ? [['==', 'country', selectedCountry]] : [])  // Filter by country if selected
        ]);
    });
}

// Function to handle both country and pollutant filters
export function handleCountryAndPollutantFilters(map) {
    const selectedPollutant = document.getElementById('polutantType').value;
    const selectedCountry = document.getElementById('countryFilter').value;
    const visibleLayers = getVisibleLayers(map);

    visibleLayers.forEach(layerId => {
        map.setFilter(layerId, [
            'all',
            ...(selectedCountry ? [['==', 'country', selectedCountry]] : []),
            ...(selectedPollutant ? [['>', selectedPollutant, 0]] : [])
        ]);
    });
}

// Function to get all currently visible layers
export function getVisibleLayers(map) {
    return layerIds.filter(layerId => map.getLayer(layerId) && map.getLayoutProperty(layerId, 'visibility') === 'visible');
}

// Function to initialize event listeners for filters
export function initializeFilters(map) {
    checkRegionAndUpdateFilters(map);  // Set initial filters based on region

    document.getElementById('assetFilter').addEventListener('change', () => handleAssetFilterChange(map));
    document.getElementById('countryFilter').addEventListener('change', () => handleCountryFilterChange(map));
    document.getElementById('polutantType').addEventListener('change', () => handleCountryAndPollutantFilters(map));

    // Update filters when the map moves
    map.on('moveend', () => checkRegionAndUpdateFilters(map));
}
