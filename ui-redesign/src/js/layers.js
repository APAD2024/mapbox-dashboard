import { isAggregateToolEnabled, COUNTABLE_LAYERS_INFO, layerIdToStyleKey, layerColors } from "./aggregateTool.js";
import { hideLoadingSpinner, showLoadingSpinner } from "./utils.js";
import { layerStyles } from './layerVisibility.js';


export const layerIds = [
  "indian",
  "coal",
  "population",
  "fossil",
  "gpw",
  "brick_kilns_PK",
  "brick_kilns_IND",
  "brick_kilns_BAN",
  "brick_kilns_PK_hex",
  "brick_kilns_IND_hex",
  "brick_kilns_BAN_hex",
  "cement_IGP",
  "furnace_oil_IGP",
  "paper_pulp_IGP",
  "steel_IGP",
  "solid_waste_IGP",
  "coal_africa",
  "cement_africa",
  "paper_pulp_africa",
  "steel_africa",
  "brick_kilns_DRC",
  "brick_kilns_GHA",
  "brick_kilns_UGA",
  "brick_kilns_NGA",
  "boilers",
  "pollution_reports",
  "openaq_latest",
];
// -------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------

// -----------------------------------------------------------LAYERS LOADING-----------------------------------------------------------

// Fetch API for Pollution reports data and convert to GeoJSON
function convertPollutionDataToGeoJSON(data) {
  return {
    type: "FeatureCollection",
    features: data.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.longitude, item.latitude],
      },
      properties: {
        id: item.id,
        pollution_type: item.pollution_type,
        image_url: item.image_url,
        timestamp: item.timestamp,
        is_verified: item.is_verified,
      },
    })),
  };
}

// UNIFIED: Async loader function for pollution reports
export function loadPollutionReportsLayer(map) {
  const layerId = "pollution_reports";

  // If already loaded, just return early
  if (map.getSource(layerId)) return;

  showLoadingSpinner();

  fetch("https://api.apad.world/api/get_all_submissions?is_verified=true", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const geojson = convertPollutionDataToGeoJSON(data);

      // Ensure the custom marker image is loaded before adding the layer
      if (!map.hasImage("custom-marker")) {
        const image = await new Promise((resolve, reject) => {
          map.loadImage("/src/assets/star_open-waste-burning.png", (error, img) => {
            if (error) reject(error);
            else resolve(img);
          });
        });
        map.addImage("custom-marker", image);
      }

      // Add the source
      map.addSource(layerId, {
        type: "geojson",
        data: geojson,
      });

      // Add the layer
      map.addLayer({
        id: layerId,
        type: "symbol",
        source: layerId,
        layout: {
          "icon-image": "custom-marker",
          "icon-size": 0.25,
          "icon-anchor": "bottom",
          visibility: "visible",
        },
      });

      // Add popup on click
      map.on("click", layerId, (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="text-align: center;">
              <h4>${props.pollution_type}</h4>
              <p><strong>Reported on:</strong> ${new Date(
                props.timestamp
              ).toLocaleString()}</p>
              <img src="${props.image_url}" alt="${props.pollution_type}" width="150px" style="border-radius: 5px;"/>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseenter", layerId, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", layerId, () => (map.getCanvas().style.cursor = ""));

      hideLoadingSpinner();
    })
    .catch((err) => {
      console.error("Error loading pollution reports layer:", err);
      hideLoadingSpinner();
    });
}

//fetch data from openaq and convert into geojson
const countryNames = {
  IN: "India",
  PK: "Pakistan",
  BD: "Bangladesh",
};

async function fetchOpenAQLatestAsGeoJSON() {
  const apiUrl = "https://api.apad.world/api/openaq/latest";
  const response = await fetch(apiUrl);
  const jsonData = await response.json();

  return {
    type: "FeatureCollection",
    name: "air_quality_latest",
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    features: jsonData.items.map((item) => {
      const properties = {
        id: `AQ-${item.location_id}`,
        name: `Air Quality Station ${item.location_id}`,
        lat: item.lat,
        lon: item.lon,
        type: "AirQuality",
        fuel: null,
        region: null,
        country: countryNames[item.country_iso] || item.country_iso,
        status: "active",
        capacity: null,
      };

      let lastUpdate = null;

      // Loop over all parameters dynamically
      for (const [key, param] of Object.entries(item.parameters)) {
        const labelKey = key; // Use label if available, else key
        const value = param.value ?? null;

        // Add using label or fallback key
        properties[labelKey] = value;

        // Track the first available datetime for last_update
        if (!lastUpdate && param.datetime_utc) {
          const dateObj = new Date(param.datetime_utc);
          lastUpdate =
            dateObj.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            }) + " UTC";
        }
      }

      properties.last_update = lastUpdate;

      return {
        type: "Feature",
        properties,
        geometry: {
          type: "Point",
          coordinates: [item.lon, item.lat],
        },
      };
    }),
  };
}

function getCSSColor(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

const chartFont = 'Montserrat'; // or whatever font you use

function generateEmissionsChart(emissionsData) {
  const emissionProperties = ['nox', 'so2', 'pm10', 'pm25'];
  const labels = emissionProperties.map(p => p.toUpperCase());
  const values = emissionProperties.map(p => emissionsData[p] || 0);

  const ctx = document.getElementById('emissionsChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Emissions (tn/year)',
        data: values,
        backgroundColor: getCSSColor('--light-green'),
        borderColor: getCSSColor('--dark-green'),
        borderWidth: 1,
        barThickness: 15, 
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: getCSSColor('--dark-green'),
          },
          ticks: {
            color: getCSSColor('--dark-green'), 
            font: { family: chartFont, size: 10 }
          },
          border: {color: getCSSColor('--dark-green')
          }
        },
        y: {
          grid: {
            color: getCSSColor('--dark-green'), 
          },
          ticks: {
            color: getCSSColor('--dark-green'), 
            font: { family: chartFont, size: 10 }
          },
          border: {
            color: getCSSColor('--dark-green')
          }
        }
      },
        layout: {
        padding: { top: 5, bottom: 5 }
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
          color: getCSSColor('--dark-green') // 🔹 title text color (if enabled)
        }
      }
    }
  });
}


export function generatePopupHTML(properties, coordinates, layerId = "") {
  if (!properties) return "";

  // Determine name
  const name = properties.name 
             || properties["Name of Enterprise"] 
             || properties.plant_name
             || "Unknown";

  // Determine type display name
  const displayType = COUNTABLE_LAYERS_INFO[layerId] || layerId || "Unknown";

  // Determine background color
  const styleKey = layerIdToStyleKey[layerId] || layerId;
  const backgroundColor = layerStyles[styleKey] || "hsla(182, 47.7%, 12.7%, 1)"; 
  const strokeColor = layerStyles[styleKey]?.strokeColor || "#000";  

  // Location
  let locationText = "";
  if (properties["Address of the Industry"]) {
    locationText = properties["Address of the Industry"];
  } else {
    const region = properties.region ?? "";
    const country = properties.country ?? "Unknown";
    locationText = region ? `${region}, ${country}` : country;
  }

  // Coordinates
  const [lng, lat] = coordinates ?? [null, null];
  const latLngText = (lat !== null && lng !== null) ? `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}` : "";

  // Capacity
  const capacity = properties.capacity 
                 || properties.cap_mw
                 || properties["Capacity"] 
                 || "---";

  // Pollutants
  const pm10 = properties.pm10 ?? properties["PM10"] ?? "---";
  const pm25 = properties.pm25 ?? properties["PM2.5"] ?? properties["PM25"] ?? "---";
  const so2  = properties.so2  ?? properties["SO2"]  ?? "---";
  const nox  = properties.nox  ?? properties["NOx"]  ?? "---";

  // Build HTML
  return `
    <div class="popup-table" style="font-family: 'Montserrat', sans-serif;">
      ${displayType ? `<div class="type" style="background-color: ${backgroundColor}; padding: 2px 4px; margin-bottom: 0.5rem; border-radius: 4px; border: 2px solid ${strokeColor}; font-weight: bold; color: ${strokeColor}; display: inline-block;">${displayType}</div>` : ""}
      <h3>${name}</h3>
      <div>${locationText}</div>
      ${latLngText ? `<div style="font-size: 1rem;">${latLngText}</div>` : ""}
      <div style="font-size: 1rem;">Capacity: ${capacity}</div>
      <canvas id="emissionsChart" width="auto" height="250">
      </canvas>
    </div>
  `;
}

// Keep track of the currently open popup
let currentPopup = null;
let removeCurrentDot = null;
// Show popup, passing coordinates for Lat/Lng and layer name
export function showPopup(map, lngLat, properties, layerId = "") {
  // Close existing popup and pulsing dot
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  if (removeCurrentDot) {
    removeCurrentDot();
    removeCurrentDot = null;
  }

  // Generate HTML
  const html = generatePopupHTML(properties, [lngLat.lng, lngLat.lat], layerId);

  // Create new popup
  currentPopup = new mapboxgl.Popup()
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(map);

  // Add pulsing dot at the popup location
  removeCurrentDot = addPulsingDot(map, [lngLat.lng, lngLat.lat]);

  // Once popup is added to DOM, draw chart
  setTimeout(() => {
    const emissionsData = {
      nox: parseFloat(properties.nox || properties["NOx"]) || 0,
      so2: parseFloat(properties.so2 || properties["SO2"]) || 0,
      pm10: parseFloat(properties.pm10 || properties["PM10"]) || 0,
      pm25: parseFloat(properties.pm25 || properties["PM2.5"] || properties["PM25"]) || 0
    };
    generateEmissionsChart(emissionsData);
  }, 200);

  // Remove pulsing dot when popup closes
  currentPopup.on("close", () => {
    if (removeCurrentDot) removeCurrentDot();
    removeCurrentDot = null;
    currentPopup = null;
  });

  return currentPopup;
}


export function loadOpenAQLayer(map) {
  showLoadingSpinner();

  // Lazy load OpenAQ Air Quality layer
  if (!map.getSource("openaq_latest")) {
    fetchOpenAQLatestAsGeoJSON()
      .then((data) => {

        // --- Compute normalization for PM2.5 ---
        const pm25Values = data.features
          .map(f => parseFloat(f.properties["pm25"]))
          .filter(v => !isNaN(v));

        const maxPM25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 1;

        // --- Add PM2.5-scaled size property to each feature ---
        data.features.forEach(f => {
          const pm25 = parseFloat(f.properties["pm25"]);
          // normalize between 0.2 and 1
          const normalized = !isNaN(pm25) ? pm25 / maxPM25 : 0.2;
          // scale to pixel radius range (e.g. 3px – 12px)
          f.properties.circle_size = 3 + normalized * 9;
        });

        // --- Add GeoJSON source ---
        map.addSource("openaq_latest", {
          type: "geojson",
          data: data,
        });

        // --- Add a circle layer for air quality stations ---
        map.addLayer({
          id: "openaq_latest",
          type: "circle",
          source: "openaq_latest",
          paint: {
            "circle-radius": ["get", "circle_size"], // 👈 dynamic by PM2.5
            "circle-color": "hsla(324, 50%, 75%, 0.5)",
            "circle-stroke-width": 0.6,
            "circle-stroke-color": "hsla(324, 50%, 75%, 1)",
          },
          layout: {
            visibility: "visible",
          },
        });

        // --- Add popups for air quality stations ---
        map.on("click", "openaq_latest", (e) => {
          const properties = e.features[0].properties;

          const excludeKeys = [
            "id",
            "name",
            "lat",
            "lon",
            "type",
            "fuel",
            "region",
            "country",
            "status",
            "capacity",
            "last_update",
            "circle_size", // exclude the added size property
          ];

          let tableRows = "";
          const toSubTag = str => str.replace(/(\d+)/g, "<sub>$1</sub>");

          for (const [key, value] of Object.entries(properties)) {
            if (!excludeKeys.includes(key) && value != null) {
              let label = key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();
              if (label === "PM25") label = "PM2.5";
              label = toSubTag(label);
              const roundedValue = Number(value).toFixed(2);
              tableRows += `
                <tr>
                    <td><strong>${label}</strong></td>
                    <td>${roundedValue}</td>
                </tr>`;
            }
          }

          if (properties.last_update) {
            tableRows += `
              <tr>
                  <td><strong>Last Update<strong></td>
                  <td>${properties.last_update}</td>
              </tr>`;
          }

          const popupContent = `
            <div class="popup-table">
                <table>
                    <thead>
                        <tr>
                            <th>Pollutant</th>
                            <th>Value (µg/m³)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          tableRows ||
                          '<tr><td colspan="2">No recent measurements</td></tr>'
                        }
                    </tbody>
                </table>
            </div>`;

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
        });

        hideLoadingSpinner();
      })
      .catch((error) => {
        console.error("Error loading OpenAQ data:", error);
        hideLoadingSpinner();
      });
  }
}

// --- PULSING DOT HELPER ---
export function addPulsingDot(map, coordinates) {
  const size = 200;

  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },
    render: function () {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;
      const radius = size / 2 * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      context.clearRect(0, 0, this.width, this.height);

      // Outer circle
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
      context.fill();

      // Inner circle
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = " hsla(167, 13.2%, 79.2%, 0.5)";
      context.strokeStyle = "white";
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map.triggerRepaint();
      return true;
    },
  };

  // Add image once
  if (!map.hasImage("pulsing-dot")) {
    map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });
  }

  // Add source and layer once
  if (!map.getSource("pulsing-dot-source")) {
    map.addSource("pulsing-dot-source", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
  }
  if (!map.getLayer("pulsing-dot-layer")) {
    map.addLayer({
      id: "pulsing-dot-layer",
      type: "symbol",
      source: "pulsing-dot-source",
      layout: {
        "icon-image": "pulsing-dot",
        "icon-size": 0.5,
        "icon-allow-overlap": true,
      },
    });
  }

  // Set the pulsing dot position
  map.getSource("pulsing-dot-source").setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates },
      },
    ],
  });

  // Return a function to remove the pulsing dot
  return function removePulsingDot() {
    map.getSource("pulsing-dot-source").setData({
      type: "FeatureCollection",
      features: [],
    });
  };
}


export async function loadGroupLayers(
  map,
  layerId,
  sourceId,
  url,
  circleColor = "#000",
  baseRadius = 3,
  strokeWidth = 2,
  strokeColor = "#fff"
) {
  showLoadingSpinner();

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Find max PM2.5 value for this asset type
    const pm25Values = data.features
      .map(f => parseFloat(f.properties["pm25"]))
      .filter(v => !isNaN(v));

    const maxPM25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 1;

    // Normalize and add scaled radius property
    data.features.forEach(f => {
      const pm25 = parseFloat(f.properties["pm25"]);
      const normalized = !isNaN(pm25) ? pm25 / maxPM25 : 0.2;
      f.properties.scaled_radius = baseRadius + normalized * 15;
    });

    // Add or update source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: "geojson", data });
    } else {
      map.getSource(sourceId).setData(data);
    }

    // Add circle layer if not existing
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-color": circleColor,
          "circle-radius": ["get", "scaled_radius"],
          "circle-stroke-width": strokeWidth,
          "circle-stroke-color": strokeColor,
        },
        layout: { visibility: "visible" },
      });
    }

    // --- Click handler with popup and pulsing dot ---
    if (!isAggregateToolEnabled()) {
      let removeCurrentDot = null;

      map.on("click", layerId, (e) => {
        const feature = e.features[0];

        // Show existing popup
        const popup = showPopup(map, e.lngLat, feature.properties, layerId);

        // Remove previous pulsing dot if exists
        if (removeCurrentDot) removeCurrentDot();

        // Add new pulsing dot at clicked point
        removeCurrentDot = addPulsingDot(map, feature.geometry.coordinates);

        // Stop pulsing when popup closes
        popup.on("close", () => {
          if (removeCurrentDot) removeCurrentDot();
          removeCurrentDot = null;
        });
      });
    }

    hideLoadingSpinner();
  } catch (err) {
    console.error(`Error loading layer ${layerId}:`, err);
    hideLoadingSpinner();
  }
}


export function loadCountryBoundary(map, countryCode, url) {
  const sourceId = `${countryCode}_boundary_source`;
  const layerId = `${countryCode}_boundary_layer`;

  // Avoid re-adding the same layer
  if (map.getSource(sourceId)) return;

  map.addSource(sourceId, {
    type: "geojson",
    data: url
  });

  // Fill layer (optional, light color)
  map.addLayer({
    id: `${layerId}_fill`,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": "hsla(167, 13.2%, 79.2%, 0)",
      "fill-opacity": 0.05
    }
  });

  // Outline layer
  map.addLayer({
    id: `${layerId}_outline`,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "hsla(167, 13.2%, 79.2%, 1)",
      "line-width": 0.5
        }
  });

  console.log(`Boundary loaded for ${countryCode}`);
}





