// Pollutant Filters Module

// Region-specific data
const igpCountries = ['India', 'Pakistan', 'Bangladesh'];
const africaCountries = ['Nigeria', 'Uganda', 'Congo', 'Ghana'];

// Asset options per region (linked to actual layer IDs)
const igpAssets = [
    { id: 'coal', label: 'Coal IGP' },
    { id: 'cement_igp', label: 'Cement' },
    { id: 'oil_gas_IGP', label: 'Oil Gas Refineries' },
    { id: 'paper_pulp_IGP', label: 'Paper Pulp' },
    { id: 'steel_IGP', label: 'Steel' },
    { id: 'plastic_waste_IGP', label: 'Plastic Waste' },
    { id: 'solid_waste_IGP', label: 'Solid Waste' },
    { id: 'fossil', label: 'Fossil Fuel' },
    { id: 'gpw', label: 'GPW' }
];

const africaAssets = [
    { id: 'coal_africa', label: 'Coal' },
    { id: 'cement_africa', label: 'Cement' },
    { id: 'paper_pulp_africa', label: 'Paper Pulp' },
    { id: 'steel_africa', label: 'Steel Plants' },
];

// Layer IDs used in filters
const layerIds = [
    'coal', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'brick_kilns_PK', 'brick_kilns_IND', 'brick_kilns_BAN', 
    'cement_igp', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'plastic_waste_IGP', 'solid_waste_IGP',
    'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 
    'brick_kilns_UGA', 'brick_kilns_NGA'
];

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

    // Hide all layers by default, then show the selected asset layer
    layerIds.forEach(layerId => {
        const visibility = selectedAsset === layerId || selectedAsset === '' ? 'visible' : 'none';
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
        }

        // Sync legend checkboxes
        const checkbox = document.querySelector(`input[data-layer="${layerId}"]`);
        if (checkbox) {
            checkbox.checked = (visibility === 'visible');
        }
    });

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
