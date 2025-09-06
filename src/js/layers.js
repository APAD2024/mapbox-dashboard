import { isAggregateToolEnabled } from "./aggregateTool.js";
import { hideLoadingSpinner, showLoadingSpinner } from "./utils.js";

export const layerIds = [
  "indian",
  "coal",
  "population",
  "fossil",
  "gpw",
  "BK_PK",
  "BK_IND",
  "BK_BAN",
  "brick_kilns_PK",
  "brick_kilns_IND",
  "brick_kilns_BAN",
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
let boundaryLayer, populationLayer, gpwLayer;
// -------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------

// -----------------------------------------------------------LAYERS LOADING-----------------------------------------------------------

// Fetch API data and convert to GeoJSON
//convert reported pollutants data into geojson
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

async function fetchAndAddPollutionLayer(map) {
  try {
    const response = await fetch(
      "https://api.apad.world/api/get_all_submissions?is_verified=true",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    const geojson = convertPollutionDataToGeoJSON(data);

    // Load and add the red marker image before adding the layer
    if (!map.hasImage("custom-marker")) {
      await new Promise((resolve, reject) => {
        map.loadImage(
          "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
          (error, image) => {
            if (error) reject(error);
            else {
              map.addImage("custom-marker", image);
              resolve();
            }
          }
        );
      });
    }

    if (map.getSource("pollution_reports")) {
      map.getSource("pollution_reports").setData(geojson);
    } else {
      map.addSource("pollution_reports", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "pollution_reports",
        type: "symbol",
        source: "pollution_reports",
        layout: {
          "icon-image": "custom-marker", // Use the loaded red marker image here
          "icon-size": 1,
          "icon-anchor": "bottom",
          visibility: "visible",
        },
      });

      map.on("click", "pollution_reports", (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `
                        <div style="text-align: center;">
                            <h4>${props.pollution_type}</h4>
                            <p><strong>Reported on:</strong> ${new Date(
                              props.timestamp
                            ).toLocaleString()}</p>
                            <img src="${props.image_url}" alt="${
              props.pollution_type
            }" width="150px" style="border-radius: 5px;"/>
                        </div>
                    `
          )
          .addTo(map);
      });

      map.on("mouseenter", "pollution_reports", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "pollution_reports", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  } catch (err) {
    console.error("Error fetching or adding pollution data:", err);
  }
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

// Reusable function to add data layers with fetch and lazy loading
export function addDataLayers(map) {

    // Indian plain layer
    if (!map.getSource('indian_plain')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/khizerzakir/a57134b1784de99b512cdcade67936c2/raw/d457183d9aa4f2e128440ebfd69da3143f933ae2/IGP_boundary.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('indian_plain', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'indian',
                    'type': 'line',
                    'source': 'indian_plain',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Indian plain data:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }
    
    fetchAndAddPollutionLayer(map); 
    
    // Congo Adm Boundary
    if (!map.getSource('COD_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/731408a10cc9e5ed36c5fb5a1982dc1c/raw/7779b1c68faa84685e3a3eef631afa675d78f209/COD_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('COD_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'COD_Adm',
                    'type': 'line',
                    'source': 'COD_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Congo Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

  // Ghana Adm Boundary
  if (!map.getSource("GHA_Adm_boundary")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/Mseher/7fb33392e9c0adb358ad2a553f5eba5a/raw/3cbbe1c37ae215b6281f69f890e6641e0d73527e/GHA_adm_0.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("GHA_Adm_boundary", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "GHA_Adm",
          type: "line",
          source: "GHA_Adm_boundary",
          paint: {
            "line-color": "black",
            "line-width": 1,
          },
        });
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Ghana Adm Boundary:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Nigeria Adm Boundary
  if (!map.getSource("NGA_Adm_boundary")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/Mseher/359c899443ff3d0e31ea1eb3610227b6/raw/3f33451383fc0d5967e680fc1038b85d60bf1a76/NGA_adm_0.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("NGA_Adm_boundary", {
          type: "geojson",
          data: data,
        });
        boundaryLayer = map.addLayer({
          id: "NGA_Adm",
          type: "line",
          source: "NGA_Adm_boundary",
          paint: {
            "line-color": "black",
            "line-width": 1,
          },
        });
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Nigeria Adm Boundary:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

    // Uganda Adm Boundary
    if (!map.getSource('UGA_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/Mseher/542c13b528a18c3d13d43eb390efe47f/raw/7f60e28ef3b7e9df2a1f3a4f745856debff9832e/UGA_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('UGA_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'UGA_Adm',
                    'type': 'line',
                    'source': 'UGA_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading Uganda Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

    // Kenya Adm Boundary
    if (!map.getSource('KEN_Adm_boundary')) {
        showLoadingSpinner(); // Show the spinner while loading
        fetch('https://gist.githubusercontent.com/khizerzakir/e7a28f5a6a27a58e68d22699981489d3/raw/60aaa8a8710c395e030ddeeecfcf6c818e9136af/Ken_adm_0.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('KEN_Adm_boundary', {
                    type: 'geojson',
                    data: data
                });
                map.addLayer({
                    'id': 'KEN_Adm',
                    'type': 'line',
                    'source': 'KEN_Adm_boundary',
                    'paint': {
                        'line-color': 'black',
                        'line-width': 1
                    }
                });
                hideLoadingSpinner(); // Hide the spinner after loading
            })
            .catch(error => {
                console.error('Error loading KENYA Adm Boundary:', error);
                hideLoadingSpinner(); // Hide the spinner even if there is an error
            });
    }

  // Population raster layer
  if (!map.getSource("population")) {
    map.addSource("population", {
      type: "raster",
      url: "mapbox://muhammad-bilal763.bra3hxpk",
    });
    map.addLayer({
      id: "population",
      source: "population",
      type: "raster",
      layout: {
        visibility: "visible", // Initial visibility
      },
    });
  }

  // Lazy load Fossil fuel layer
  if (!map.getSource("fossil_fuel")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/bilalpervaiz/597c50eff1747c1a3c8c948bef6ccc19/raw/6984d3a37d75dc8ca7489ee031377b2d57da67d2/fossil_fuel.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("fossil_fuel", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "fossil",
          type: "circle",
          source: "fossil_fuel",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "blue",
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for fossil fuel layer
          map.on("click", "fossil", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              const cleanedOriginalI = properties.original_i.replace(
                /{|}/g,
                ""
              );
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `<div class="popup-table"><h3>${cleanedOriginalI}</h3></div>`
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Fossil Fuel data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Coal IGP layer
  if (!map.getSource("coal_IGP")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Coal+Plants/coal_plants_main.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("coal_IGP", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "coal",
          type: "circle",
          source: "coal_IGP",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "#616161", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "coal", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.name}, ${properties.country}</h3>
                                <table>
                                    <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
                                </table>
                            </div>
                            `;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            }
          });
        }

        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Coal data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load GPW layer
  if (!map.getSource("GPW")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/bilalpervaiz/e2c93d2017fc1ed90f9a6d5259701a5e/raw/4dd19fe557d29b9268f11e233169948e95c24803/GPW.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("GPW", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "gpw",
          type: "circle",
          source: "GPW",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "black",
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "gpw", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `<div class="popup-table"><h3>${properties.name}</h3></div>`
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading GPW data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Cement IGP layer
  if (!map.getSource("cementIGP")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Cement+Plants/cement_plants_main.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("cementIGP", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "cement_IGP",
          type: "circle",
          source: "cementIGP",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 0.5,
            "circle-color": "purple", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "cement_IGP", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `
                                    <div class="popup-table">
                                        <h3>${properties.name}, ${properties.country}</h3>
                                        <table>
                                            <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                            <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                            <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                            <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                            <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
                                        </table>
                                    </div>
                                    `
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Cement IGP data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Furnace Oil layer
  if (!map.getSource("furnaceoilIGP")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/oil_and_gas/Furnace_oil_main.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("furnaceoilIGP", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "furnace_oil_IGP",
          type: "circle",
          source: "furnaceoilIGP",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "brown", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "furnace_oil_IGP", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `
                                    <div class="popup-table">
                                        <h3>${properties.name}, ${properties.country}</h3>
                                        <table>
                                            <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                            <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                            <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                            <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                            <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
                                        </table>
                                    </div>
                                    `
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Furnace Oil IGP data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Paper Pulp IGP layer
  if (!map.getSource("paperPulpIGP")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Pulp+and+Paper+Plants/paper_pulp_main.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("paperPulpIGP", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "paper_pulp_IGP",
          type: "circle",
          source: "paperPulpIGP",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "rgb(112, 206, 202)", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "paper_pulp_IGP", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `
                                    <div class="popup-table">
                                        <h3>${properties.name}, ${properties.country}</h3>
                                        <table>
                                            <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                            <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                            <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                            <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                            <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
                                        </table>
                                    </div>
                                    `
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Paper Pulp IGP data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Steel IGP layer
  if (!map.getSource("steelIGP")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Steel+Plants/steel_plants_main.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("steelIGP", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "steel_IGP",
          type: "circle",
          source: "steelIGP",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "rgb(24, 54, 84)", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "steel_IGP", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `
                                    <div class="popup-table">
                                <h3>${properties.name}, ${properties.country}</h3>
                                <table>
                                    <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
                                </table>
                            </div>
                                    `
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Steel IGP data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load  Plastic Waste IGP layer
  if (!map.getSource("solidWasteIGP")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Plastic+and+Landfill+Sites/waste_main.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("solidWasteIGP", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "solid_waste_IGP",
          type: "circle",
          source: "solidWasteIGP",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 2,
            "circle-color": "rgb(206, 131, 19)", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "solid_waste_IGP", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `
                                    <div class="popup-table">
                                <h3>${properties.name}, ${properties.country}</h3>
                                <table>
                                    <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
                                </table>
                            </div>
                                    `
                )
                .addTo(map);
            }
          });
        }
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Solid Waste IGP data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Pollutant decay heatmap layer
  if (!map.getSource("pollutant_decay")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/bilalpervaiz/97a2ce64252ad5a095c9222f4c9ae5b1/raw/4fcc0590f9b28e13a369fb93f4f0ff00410844a6/pollutant_decay.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("pollutant_decay", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "pollutant",
          type: "heatmap",
          source: "pollutant_decay",
          maxzoom: 12,
          layout: {
            visibility: "none",
          },
          paint: {
            "heatmap-weight": {
              property: "decay_PM10_1",
              type: "exponential",
              stops: [
                [0.030291835876543865, 0],
                [3.332101946419825, 1],
              ],
            },
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(255,255,178,0)",
              0.2,
              "rgb(254,204,92)",
              0.4,
              "rgb(253,141,60)",
              0.6,
              "rgb(240,59,32)",
              0.8,
              "rgb(189,0,38)",
            ],
            "heatmap-radius": {
              stops: [
                [11, 15],
                [15, 20],
              ],
            },
            "heatmap-opacity": {
              default: 1,
              stops: [
                [14, 1],
                [15, 0],
              ],
            },
          },
        });
        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Pollutant Decay data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Coal Africa layer
  if (!map.getSource("coal_Afc")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/Mseher/b3f5e885ddae2b90be7048f87896ef48/raw/57db894dc8237b9d09a8f3ed1a5e114400cfc49f/Africa_Coal.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("coal_Afc", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "coal_africa",
          type: "circle",
          source: "coal_Afc",
          paint: {
            "circle-radius": 7,
            "circle-stroke-width": 2,
            "circle-color": "#616161", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "coal_africa", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0].properties;
              const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.plant_name}, ${properties.country}</h3>
                                <table>
                                    <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
                                    <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
                                    <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
                                    <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
                                    <tr><th>SO<sub>2</sub></th><td>${properties.sox}</td></tr>
                                </table>
                            </div>
                            `;
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            }
          });
        }

        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Africa Coal data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Cement Africa layer
  if (!map.getSource("cement_Afc")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/Mseher/3c778bdbd8464ddc939b41c87e145bbc/raw/c605634a3e418b2a52a2125a3943d432d688755f/cement_africa.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("cement_Afc", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "cement_africa",
          type: "circle",
          source: "cement_Afc",
          paint: {
            "circle-radius": 5,
            "circle-stroke-width": 0.5,
            "circle-color": "purple", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "cement_africa", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0]?.properties || {}; // Ensure properties exist

              const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.city || "Unknown City"}, ${
                properties.state || "Unknown State"
              }, ${properties.country || "Unknown Country"}</h3>
                                <table>
                                    <tr><th>Sub Region</th><td>${
                                      properties.sub_region || "N/A"
                                    }</td></tr>
                                    <tr><th>Plant Type</th><td>${
                                      properties.plant_type || "N/A"
                                    }</td></tr>
                                    <tr><th>Status</th><td>${
                                      properties.status || "N/A"
                                    }</td></tr>
                                    <tr><th>Production Type</th><td>${
                                      properties.production_type || "N/A"
                                    }</td></tr>
                                    <tr><th>Capacity</th><td>${
                                      properties.capacity || "N/A"
                                    } mega watt</td></tr>
                                </table>
                            </div>
                            `;

              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            }
          });
        }

        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Africa Cement data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Paper Pulp Africa layer
  if (!map.getSource("paper_Pulp_Afc")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/Mseher/d77d22cea85ac0f3ef184a48d0aa1bba/raw/0751824b8af6cb919a8ec2aab869367987345545/Paper_pulp_Africa.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("paper_Pulp_Afc", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "paper_pulp_africa",
          type: "circle",
          source: "paper_Pulp_Afc",
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 0.6,
            "circle-color": "rgb(112, 206, 202)", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "paper_pulp_africa", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0]?.properties || {}; // Ensure properties exist

              const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.plant_name}</h3>
                                <table>
                                    <tr><th>Country</th><td>${properties.country}</td></tr>
                                    <tr><th>City</th><td>${properties.city}</td></tr>
                                    <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
                                    <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
                                    <tr><th>Status</th><td>${properties.status}</td></tr>
                                </table>
                            </div>
                            `;

              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            }
          });
        }

        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Africa Paper Pulp data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Steel Plants Africa layer
  if (!map.getSource("steel_Afc")) {
    showLoadingSpinner(); // Show the spinner while loading
    fetch(
      "https://gist.githubusercontent.com/Mseher/23af19444bdc70b115afcb6cc45879ec/raw/eda2bc6398aaa50595cfc7ed81bbca1d15d78c31/Steel_Plants_Africa.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("steel_Afc", {
          type: "geojson",
          data: data,
        });
        map.addLayer({
          id: "steel_africa",
          type: "circle",
          source: "steel_Afc",
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 0.6,
            "circle-color": "rgb(24, 54, 84)", // Add # for hex color
            "circle-stroke-color": "white",
          },
          layout: {
            visibility: "visible",
          },
        });

        if (!isAggregateToolEnabled()) {
          // Popup for the coal layer
          map.on("click", "steel_africa", (e) => {
            if (!isAggregateToolEnabled()) {
              const properties = e.features[0]?.properties || {}; // Ensure properties exist

              const popupContent = `
                            <div class="popup-table">
                                <h3>${properties.state}, ${properties.city}</h3>
                                <table>
                                    <tr><th>Country</th><td>${properties.country}</td></tr>
                                    <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
                                    <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
                                    <tr><th>Status</th><td>${properties.status}</td></tr>
                                </table>
                            </div>
                            `;

              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            }
          });
        }

        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading Africa Steel Plants data:", error);
        hideLoadingSpinner(); // Hide the spinner even if there is an error
      });
  }

  // Lazy load Boilers layer
  if (!map.getSource("boilers_layer")) {
    showLoadingSpinner(); // Show loading spinner while fetching data

    fetch(
      "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/boilers/boilers.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        map.addSource("boilers_layer", {
          type: "geojson",
          data: data,
        });

        map.addLayer({
          id: "boilers",
          type: "circle",
          source: "boilers_layer",
          paint: {
            "circle-radius": 6,
            "circle-color": "#FF5722",
            "circle-stroke-color": "white",
            "circle-stroke-width": 0.6,
          },
          layout: {
            visibility: "visible",
          },
        });

        // Enable popup on click
        if (!isAggregateToolEnabled()) {
          map.on("click", "boilers", (e) => {
            if (!isAggregateToolEnabled()) {
              const props = e.features[0].properties;

              // Concatenate Address of Industry and Industry with comma, ignoring empty values
              const addressIndustry = [
                props["Name of Enterprise"],
                props["Address of the Industry"],
              ]
                .filter(Boolean)
                .join(", ");

              const popupContent = `
                            <div class="popup-table">
                                <h3>${addressIndustry || ""}</h3>
                            </div>
                        `;

              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
            }
          });
        }

        hideLoadingSpinner(); // Hide spinner after successful load
      })
      .catch((error) => {
        console.error("Error loading Industries GeoJSON:", error);
        hideLoadingSpinner(); // Hide spinner even if load fails
      });
  }

  //Air pollutants layer
  // Lazy load OpenAQ Air Quality layer
  if (!map.getSource("openaq_latest")) {
    showLoadingSpinner(); // Show the spinner while loading

    fetchOpenAQLatestAsGeoJSON()
      .then((data) => {
        // Add the GeoJSON as a new source
        map.addSource("openaq_latest", {
          type: "geojson",
          data: data,
        });

        // Add a circle layer for air quality stations
        map.addLayer({
          id: "openaq_latest",
          type: "circle",
          source: "openaq_latest",
          paint: {
            "circle-radius": 5,
            "circle-color": "rgba(73, 84, 24, 1)",
            "circle-stroke-width": 0.6,
            "circle-stroke-color": "#fff",
          },
          layout: {
            visibility: "none",
          },
        });

        // Add popups for air quality stations
        map.on("click", "openaq_latest", (e) => {
          const properties = e.features[0].properties;

          // Dynamically generate rows for available pollutants
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
          ];
          let tableRows = "";

          // Function to convert numbers in string to subscript using <sub> tags
          function toSubTag(str) {
            return str.replace(/(\d+)/g, "<sub>$1</sub>");
          }

          // Inside your popup generation loop
          for (const [key, value] of Object.entries(properties)) {
            if (!excludeKeys.includes(key) && value != null) {
              // Format the label
              let label = key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();

              // Special case for PM25 -> PM2.5
              if (label === "PM25") label = "PM2.5";

              // Wrap any numbers in <sub>
              label = toSubTag(label);

              const roundedValue = Number(value).toFixed(2);

              tableRows += `
            <tr>
                <td><strong>${label}</strong></td>
                <td>${roundedValue}</td>
            </tr>
        `;
            }
          }

          // Add last_update row if exists
          if (properties.last_update) {
            tableRows += `
                        <tr>
                            <td><strong>Last Update<strong></td>
                            <td>${properties.last_update}</td>
                        </tr>
                    `;
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
                    </div>
                `;

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
        });

        hideLoadingSpinner(); // Hide the spinner after loading
      })
      .catch((error) => {
        console.error("Error loading OpenAQ data:", error);
        hideLoadingSpinner(); // Hide spinner even if there is an error
      });
  }
}
