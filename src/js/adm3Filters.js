import { showLoadingSpinner, hideLoadingSpinner } from './utils.js';

export function initializeADM3FilterPanel(map) {
    const panel = document.getElementById('adm3FilterPanel');
    const countrySelect = document.getElementById('adm3CountryFilter');
    const districtSelect = document.getElementById('adm3DistrictFilter');

    const sources = {
        'Pakistan': 'adm3_PAK',
        'India': 'adm3_IND'
    };

    if (!panel || !countrySelect || !districtSelect) return;

    // Panel visibility based on ADM3 layer visibility
    function updatePanelVisibility() {
        let isVisible = false;

        for (const id of Object.values(sources)) {
            if (map.getLayer(id)) {
                const visibility = map.getLayoutProperty(id, 'visibility');
                if (visibility === 'visible') {
                    isVisible = true;
                    break;
                }
            }
        }

        panel.style.display = isVisible ? 'block' : 'none';

        if (isVisible) {
            populateCountryOptions();
        }
    }

    map.on('idle', updatePanelVisibility);
    map.on('moveend', updatePanelVisibility);

    function populateCountryOptions() {
        countrySelect.innerHTML = '<option value="">Select Country</option>';
        for (const [country, sourceId] of Object.entries(sources)) {
            if (map.getSource(sourceId)) {
                countrySelect.innerHTML += `<option value="${country}">${country}</option>`;
            }
        }
    }

    countrySelect.addEventListener('change', () => {
        const country = countrySelect.value;
        districtSelect.innerHTML = '<option value="">Select District</option>';
        if (!country) return;

        const sourceId = sources[country];

        let features = [];
        if (map.getSource(sourceId)) {
            try {
                features = map.querySourceFeatures(sourceId);
            } catch (e) { }

            if (!features.length) {
                try {
                    features = map.queryRenderedFeatures({ layers: [sourceId] });
                } catch (e) { }
            }
        }

        const districtNames = [...new Set(features.map(f => f.properties.NAME_3))].sort();
        for (const name of districtNames) {
            districtSelect.innerHTML += `<option value="${name}">${name}</option>`;
        }
    });

    districtSelect.addEventListener('change', () => {
        const country = countrySelect.value;
        const district = districtSelect.value;
        if (!country || !district) return;

        const sourceId = sources[country];
        let features = [];

        try {
            features = map.querySourceFeatures(sourceId, {
                filter: ['==', 'NAME_3', district]
            });
        } catch (e) { }

        if (!features.length) {
            try {
                features = map.queryRenderedFeatures({ layers: [sourceId] })
                    .filter(f => f.properties.NAME_3 === district);
            } catch (e) { }
        }

        if (!features.length) return;

        const feature = features[0];
        const center = turf.center(feature).geometry.coordinates;

        if (!center || center.includes(null)) return;

        // 🔸 Remove previous highlight layer if it exists
        if (map.getLayer('adm3-highlight')) {
            map.removeLayer('adm3-highlight');
        }
        if (map.getSource('adm3-highlight')) {
            map.removeSource('adm3-highlight');
        }

        // 🔸 Add a new source and layer to highlight selected district
        map.addSource('adm3-highlight', {
            type: 'geojson',
            data: feature
        });

        map.addLayer({
            id: 'adm3-highlight',
            type: 'line',
            source: 'adm3-highlight',
            paint: {
                'line-color': '#ffcc00',
                'line-width': 3,
                'line-blur': 1.5,
                'line-opacity': 0.9
            }
        });


        map.flyTo({ center, zoom: 9 });


        const p = feature.properties;

        const kilnCount = p.Kiln_Count ?? p.Kiln_count ?? 'N/A'; // supports both


        const popupContent = `
            <div class="popup-table">
                <h3>District: ${p.NAME_3}</h3>
                <table>
                    <tr><th>Total Kilns:</th><td>${kilnCount}</td></tr>
                    <tr><th>Coal Plants:</th><td>${p.Coal_plant}</td></tr>
                    <tr><th>Schools:</th><td>${p.School_cou}</td></tr>
                    <tr><th>Hospitals:</th><td>${p.Hospital_c}</td></tr>
                </table>
            </div>
        `;

        new mapboxgl.Popup()
            .setLngLat(center)
            .setHTML(popupContent)
            .addTo(map);
    });
}
