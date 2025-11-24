
const allCountries = ['India', 'Pakistan', 'Bangladesh', 'Nigeria', 'Uganda', 'Congo', 'Ghana','Kenya'];

const assetGroups = {
  "Coal": ["coal", "coal_africa"],
  // "Fossil Fuel": ["fossil_fuel"],
  "Power Generation Plants": ["furnace_oil_IGP","furnace_oil_oil","furnace_oil_biofuel","furnace_oil_natural_gas"],
  "Steel": ["steel_IGP", "steel_africa"],
  "Paper Pulp": ["paper_pulp_IGP", "paper_pulp_africa"],
  "Cement": ["cement_IGP", "cement_africa"],
  "Boilers": ["boilers"],
  "Brick Kilns": ["brick_kilns_PK", "brick_kilns_IND", "brick_kilns_BAN", "brick_kilns_DRC", "brick_kilns_GHA", "brick_kilns_UGA", "brick_kilns_NGA"],
  "Land Fill Waste": ["solid_waste_IGP"],
  "GPW": ["gpw"]
};


 const layerIds = Object.values(assetGroups).flat();


// Function to update country filter dropdown (always shows all)
export function updateCountryFilter() {
    const countryFilter = document.getElementById('countryFilter');
    countryFilter.innerHTML = '<option value="">All</option>';
    allCountries.forEach(country => {
        countryFilter.innerHTML += `<option value="${country}">${country}</option>`;
    });
}

// Function to update asset filter dropdown (always shows all)
export function updateAssetFilter() {
  const assetFilter = document.getElementById('assetFilter');
  assetFilter.innerHTML = '<option value="">All</option>';
  Object.keys(assetGroups).forEach(label => {
    assetFilter.innerHTML += `<option value="${label}">${label}</option>`;
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


export function handleAssetFilterChange(map) {
  const selectedLabel = document.getElementById('assetFilter').value;

  Object.entries(assetGroups).forEach(([label, layerIds]) => {
    const isVisible = selectedLabel === "" || selectedLabel === label;

    layerIds.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
      }
    });

    

    // Sync the legend checkbox
    const checkbox = document.getElementById(`toggle${label.replace(/\s+/g, '')}`);
    if (checkbox) checkbox.checked = isVisible;
  });
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

// Function to get all currently visible layers
export function getVisibleLayers(map) {
    return layerIds.filter(layerId => map.getLayer(layerId) && map.getLayoutProperty(layerId, 'visibility') === 'visible');
}

// Initialize filters (always show all)
export function initializeFilters(map) {
    updateCountryFilter();
    updateAssetFilter();

    document.getElementById('assetFilter').addEventListener('change', () => handleAssetFilterChange(map));
    document.getElementById('countryFilter').addEventListener('change', () => handleCountryFilterChange(map));
    document.getElementById('polutantType').addEventListener('change', () => handleCountryAndPollutantFilters(map));
}

