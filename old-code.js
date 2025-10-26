//LAYER.JS

// export async function loadSymbolLayer(
//   map,
//   layerId,
//   sourceId,
//   url,
//   imageSrc,     // local path to your image
//   iconSize = 1
// ) {
//   showLoadingSpinner();

//   try {
//     const res = await fetch(url);
//     const data = await res.json();

//     if (!map.getSource(sourceId)) {
//       map.addSource(sourceId, { type: "geojson", data });
//     } else {
//       map.getSource(sourceId).setData(data);
//     }
    

//     // Unique image name (can prefix with layerId)
//     const imageName = `${layerId}-icon`;

//     // Only add the image if it doesn't already exist
//     if (!map.hasImage(imageName)) {
//       await new Promise((resolve, reject) => {
//         map.loadImage(imageSrc, (err, image) => {
//           if (err) return reject(err);
//           try {
//             map.addImage(imageName, image);
//             resolve();
//           } catch (e) {
//             // Ignore if image already exists (race condition)
//             resolve();
//           }
//         });
//       });
//     }

//     // Then use that imageName in the layer
//     map.addLayer({
//       id: layerId,
//       type: "symbol",
//       source: sourceId,
//       layout: {
//         "icon-image": imageName,
//         "icon-size": iconSize,
//         visibility: "visible",
//       },
//     });

//     // popup
//     if (!isAggregateToolEnabled()) {
//     map.on("click", layerId, (e) => {
//     showPopup(map, e.lngLat, e.features[0].properties);
//     });
//     }

//   } catch (err) {
//     console.error(`Error loading symbol layer ${layerId}:`, err);
//   } finally {
//     hideLoadingSpinner();
//   }
// }


//NEWWWWWW

// // Utility to convert API response to GeoJSON for Pollution Reports
// function convertPollutionDataToGeoJSON(data) {
//   return {
//     type: "FeatureCollection",
//     features: data.map((item) => ({
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [item.longitude, item.latitude],
//       },
//       properties: {
//         id: item.id,
//         pollution_type: item.pollution_type,
//         image_url: item.image_url,
//         timestamp: item.timestamp,
//         is_verified: item.is_verified,
//       },
//     })),
//   };
// }

// // ✅ UNIFIED: Async loader function for pollution reports
// export async function loadPollutionReportsLayer(map) {
//   const layerId = "pollution_reports";

//   // If already loaded, just resolve
//   if (map.getLayer(layerId)) return;

//   try {
//     const response = await fetch(
//       "https://api.apad.world/api/get_all_submissions?is_verified=true",
//       {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({}),
//       }
//     );

//     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//     const data = await response.json();
//     const geojson = convertPollutionDataToGeoJSON(data);

//     // Load custom marker image if not yet loaded
//     if (!map.hasImage("custom-marker")) {
//       const image = await new Promise((resolve, reject) => {
//         map.loadImage("/src/assets/star_open-waste-burning.png", (error, img) => {
//           if (error) reject(error);
//           else resolve(img);
//         });
//       });
//       map.addImage("custom-marker", image);
//     }

//     // Add GeoJSON source
//     map.addSource(layerId, { type: "geojson", data: geojson });

//     // Add symbol layer
//     map.addLayer({
//       id: layerId,
//       type: "symbol",
//       source: layerId,
//       layout: {
//         "icon-image": "custom-marker",
//         "icon-size": 0.1,
//         "icon-anchor": "bottom",
//         visibility: "visible",
//       },
//     });

//     // Add popup interaction
//     map.on("click", layerId, (e) => {
//       const props = e.features[0].properties;
//       new mapboxgl.Popup()
//         .setLngLat(e.lngLat)
//         .setHTML(`
//           <div style="text-align: center;">
//             <h4>${props.pollution_type}</h4>
//             <p><strong>Reported on:</strong> ${new Date(
//               props.timestamp
//             ).toLocaleString()}</p>
//             <img src="${props.image_url}" alt="${props.pollution_type}" width="150px" style="border-radius: 5px;"/>
//           </div>
//         `)
//         .addTo(map);
//     });

//     map.on("mouseenter", layerId, () => (map.getCanvas().style.cursor = "pointer"));
//     map.on("mouseleave", layerId, () => (map.getCanvas().style.cursor = ""));

//   } catch (err) {
//     console.error("Error loading pollution reports layer:", err);
//   }
// }

// // ✅ UNIFIED: Async loader for OpenAQ layer
// export async function loadOpenAQLayer(map) {
//   const layerId = "openaq_latest";

//   if (map.getLayer(layerId)) return;

//   try {
//     const response = await fetch("https://api.apad.world/api/openaq/latest");
//     const jsonData = await response.json();

//     const geojson = {
//       type: "FeatureCollection",
//       features: jsonData.items.map((item) => ({
//         type: "Feature",
//         geometry: { type: "Point", coordinates: [item.lon, item.lat] },
//         properties: {
//           id: `AQ-${item.location_id}`,
//           name: `Air Quality Station ${item.location_id}`,
//           country: item.country_iso,
//           ...Object.fromEntries(
//             Object.entries(item.parameters).map(([key, val]) => [key, val.value])
//           ),
//         },
//       })),
//     };

//     map.addSource(layerId, { type: "geojson", data: geojson });

//     map.addLayer({
//       id: layerId,
//       type: "circle",
//       source: layerId,
//       paint: {
//         "circle-radius": 3,
//         "circle-color": "#C3D1CE",
//         "circle-stroke-width": 0.6,
//         "circle-stroke-color": "#112F30",
//       },
//       layout: { visibility: "visible" },
//     });
//   } catch (err) {
//     console.error("Error loading OpenAQ layer:", err);
//   }
// }



// Reusable function to add data layers with fetch and lazy loading
// export function addDataLayers(map) {

//   // Lazy load Coal IGP layer
//   if (!map.getSource("coal_IGP")) {
//     showLoadingSpinner(); // Show the spinner while loading
//     fetch(
//       "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Coal+Plants/coal_plants_main.geojson"
//     )
//       .then((response) => response.json())
//       .then((data) => {
//         map.addSource("coal_IGP", {
//           type: "geojson",
//           data: data,
//         });
//         map.addLayer({
//           id: "coal",
//           type: "circle",
//           source: "coal_IGP",
//           paint: {
//             "circle-radius": 5,
//             "circle-stroke-width": 2,
//             "circle-color": "#616161", // Add # for hex color
//             "circle-stroke-color": "white",
//           },
//           layout: {
//             visibility: "visible",
//           },
//         });

//         if (!isAggregateToolEnabled()) {
//           // Popup for the coal layer
//           map.on("click", "coal", (e) => {
//             if (!isAggregateToolEnabled()) {
//               const properties = e.features[0].properties;
//               const popupContent = `
//                             <div class="popup-table">
//                                 <h3>${properties.name}, ${properties.country}</h3>
//                                 <table>
//                                     <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
//                                     <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
//                                     <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
//                                     <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
//                                     <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
//                                 </table>
//                             </div>
//                             `;
//               new mapboxgl.Popup()
//                 .setLngLat(e.lngLat)
//                 .setHTML(popupContent)
//                 .addTo(map);
//             }
//           });
//         }

//         hideLoadingSpinner(); // Hide the spinner after loading
//       })
//       .catch((error) => {
//         console.error("Error loading Coal data:", error);
//         hideLoadingSpinner(); // Hide the spinner even if there is an error
//       });
//   }
  //   // Indian plain layer
  //   if (!map.getSource('indian_plain')) {
  //       showLoadingSpinner(); // Show the spinner while loading
  //       fetch('https://gist.githubusercontent.com/khizerzakir/a57134b1784de99b512cdcade67936c2/raw/d457183d9aa4f2e128440ebfd69da3143f933ae2/IGP_boundary.geojson')
  //           .then(response => response.json())
  //           .then(data => {
  //               map.addSource('indian_plain', {
  //                   type: 'geojson',
  //                   data: data
  //               });
  //               map.addLayer({
  //                   'id': 'indian',
  //                   'type': 'line',
  //                   'source': 'indian_plain',
  //                   'paint': {
  //                       'line-color': 'black',
  //                       'line-width': 1
  //                   }
  //               });
  //               hideLoadingSpinner(); // Hide the spinner after loading
  //           })
  //           .catch(error => {
  //               console.error('Error loading Indian plain data:', error);
  //               hideLoadingSpinner(); // Hide the spinner even if there is an error
  //           });
  //   }
    
  //   fetchAndAddPollutionLayer(map); 
    
  //   // Congo Adm Boundary
  //   if (!map.getSource('COD_Adm_boundary')) {
  //       showLoadingSpinner(); // Show the spinner while loading
  //       fetch('https://gist.githubusercontent.com/Mseher/731408a10cc9e5ed36c5fb5a1982dc1c/raw/7779b1c68faa84685e3a3eef631afa675d78f209/COD_adm_0.geojson')
  //           .then(response => response.json())
  //           .then(data => {
  //               map.addSource('COD_Adm_boundary', {
  //                   type: 'geojson',
  //                   data: data
  //               });
  //               map.addLayer({
  //                   'id': 'COD_Adm',
  //                   'type': 'line',
  //                   'source': 'COD_Adm_boundary',
  //                   'paint': {
  //                       'line-color': 'black',
  //                       'line-width': 1
  //                   }
  //               });
  //               hideLoadingSpinner(); // Hide the spinner after loading
  //           })
  //           .catch(error => {
  //               console.error('Error loading Congo Adm Boundary:', error);
  //               hideLoadingSpinner(); // Hide the spinner even if there is an error
  //           });
  //   }

  // // Ghana Adm Boundary
  // if (!map.getSource("GHA_Adm_boundary")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/Mseher/7fb33392e9c0adb358ad2a553f5eba5a/raw/3cbbe1c37ae215b6281f69f890e6641e0d73527e/GHA_adm_0.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("GHA_Adm_boundary", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "GHA_Adm",
  //         type: "line",
  //         source: "GHA_Adm_boundary",
  //         paint: {
  //           "line-color": "black",
  //           "line-width": 1,
  //         },
  //       });
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Ghana Adm Boundary:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Nigeria Adm Boundary
  // if (!map.getSource("NGA_Adm_boundary")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/Mseher/359c899443ff3d0e31ea1eb3610227b6/raw/3f33451383fc0d5967e680fc1038b85d60bf1a76/NGA_adm_0.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("NGA_Adm_boundary", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       boundaryLayer = map.addLayer({
  //         id: "NGA_Adm",
  //         type: "line",
  //         source: "NGA_Adm_boundary",
  //         paint: {
  //           "line-color": "black",
  //           "line-width": 1,
  //         },
  //       });
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Nigeria Adm Boundary:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  //   // Uganda Adm Boundary
  //   if (!map.getSource('UGA_Adm_boundary')) {
  //       showLoadingSpinner(); // Show the spinner while loading
  //       fetch('https://gist.githubusercontent.com/Mseher/542c13b528a18c3d13d43eb390efe47f/raw/7f60e28ef3b7e9df2a1f3a4f745856debff9832e/UGA_adm_0.geojson')
  //           .then(response => response.json())
  //           .then(data => {
  //               map.addSource('UGA_Adm_boundary', {
  //                   type: 'geojson',
  //                   data: data
  //               });
  //               map.addLayer({
  //                   'id': 'UGA_Adm',
  //                   'type': 'line',
  //                   'source': 'UGA_Adm_boundary',
  //                   'paint': {
  //                       'line-color': 'black',
  //                       'line-width': 1
  //                   }
  //               });
  //               hideLoadingSpinner(); // Hide the spinner after loading
  //           })
  //           .catch(error => {
  //               console.error('Error loading Uganda Adm Boundary:', error);
  //               hideLoadingSpinner(); // Hide the spinner even if there is an error
  //           });
  //   }

  //   // Kenya Adm Boundary
  //   if (!map.getSource('KEN_Adm_boundary')) {
  //       showLoadingSpinner(); // Show the spinner while loading
  //       fetch('https://gist.githubusercontent.com/khizerzakir/e7a28f5a6a27a58e68d22699981489d3/raw/60aaa8a8710c395e030ddeeecfcf6c818e9136af/Ken_adm_0.geojson')
  //           .then(response => response.json())
  //           .then(data => {
  //               map.addSource('KEN_Adm_boundary', {
  //                   type: 'geojson',
  //                   data: data
  //               });
  //               map.addLayer({
  //                   'id': 'KEN_Adm',
  //                   'type': 'line',
  //                   'source': 'KEN_Adm_boundary',
  //                   'paint': {
  //                       'line-color': 'black',
  //                       'line-width': 1
  //                   }
  //               });
  //               hideLoadingSpinner(); // Hide the spinner after loading
  //           })
  //           .catch(error => {
  //               console.error('Error loading KENYA Adm Boundary:', error);
  //               hideLoadingSpinner(); // Hide the spinner even if there is an error
  //           });
  //   }

  // // Population raster layer
  // if (!map.getSource("population")) {
  //   map.addSource("population", {
  //     type: "raster",
  //     url: "mapbox://muhammad-bilal763.bra3hxpk",
  //   });
  //   map.addLayer({
  //     id: "population",
  //     source: "population",
  //     type: "raster",
  //     layout: {
  //       visibility: "visible", // Initial visibility
  //     },
  //   });
  // }

  // // Lazy load Fossil fuel layer
  // if (!map.getSource("fossil_fuel")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/bilalpervaiz/597c50eff1747c1a3c8c948bef6ccc19/raw/6984d3a37d75dc8ca7489ee031377b2d57da67d2/fossil_fuel.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("fossil_fuel", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "fossil",
  //         type: "circle",
  //         source: "fossil_fuel",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 2,
  //           "circle-color": "blue",
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for fossil fuel layer
  //         map.on("click", "fossil", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             const cleanedOriginalI = properties.original_i.replace(
  //               /{|}/g,
  //               ""
  //             );
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `<div class="popup-table"><h3>${cleanedOriginalI}</h3></div>`
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Fossil Fuel data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  

  // // Lazy load GPW layer
  // if (!map.getSource("GPW")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/bilalpervaiz/e2c93d2017fc1ed90f9a6d5259701a5e/raw/4dd19fe557d29b9268f11e233169948e95c24803/GPW.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("GPW", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "gpw",
  //         type: "circle",
  //         source: "GPW",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 2,
  //           "circle-color": "black",
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "gpw", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `<div class="popup-table"><h3>${properties.name}</h3></div>`
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading GPW data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Cement IGP layer
  // if (!map.getSource("cementIGP")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Cement+Plants/cement_plants_main.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("cementIGP", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "cement_IGP",
  //         type: "circle",
  //         source: "cementIGP",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 0.5,
  //           "circle-color": "purple", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "cement_IGP", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `
  //                                   <div class="popup-table">
  //                                       <h3>${properties.name}, ${properties.country}</h3>
  //                                       <table>
  //                                           <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
  //                                           <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
  //                                           <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
  //                                           <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
  //                                           <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
  //                                       </table>
  //                                   </div>
  //                                   `
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Cement IGP data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Oil Gas Refining layer
  // if (!map.getSource("oilgasIGP")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/oil_and_gas/oil_gas_refining_main.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("oilgasIGP", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "oil_gas_IGP",
  //         type: "circle",
  //         source: "oilgasIGP",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 2,
  //           "circle-color": "brown", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "oil_gas_IGP", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `
  //                                   <div class="popup-table">
  //                                       <h3>${properties.name}, ${properties.country}</h3>
  //                                       <table>
  //                                           <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
  //                                           <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
  //                                           <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
  //                                           <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
  //                                           <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
  //                                       </table>
  //                                   </div>
  //                                   `
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Oil and Gas Refining IGP data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Paper Pulp IGP layer
  // if (!map.getSource("paperPulpIGP")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Pulp+and+Paper+Plants/paper_pulp_main.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("paperPulpIGP", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "paper_pulp_IGP",
  //         type: "circle",
  //         source: "paperPulpIGP",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 2,
  //           "circle-color": "rgb(112, 206, 202)", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "paper_pulp_IGP", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `
  //                                   <div class="popup-table">
  //                                       <h3>${properties.name}, ${properties.country}</h3>
  //                                       <table>
  //                                           <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
  //                                           <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
  //                                           <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
  //                                           <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
  //                                           <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
  //                                       </table>
  //                                   </div>
  //                                   `
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Paper Pulp IGP data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Steel IGP layer
  // if (!map.getSource("steelIGP")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Steel+Plants/steel_plants_main.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("steelIGP", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "steel_IGP",
  //         type: "circle",
  //         source: "steelIGP",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 2,
  //           "circle-color": "rgb(24, 54, 84)", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "steel_IGP", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `
  //                                   <div class="popup-table">
  //                               <h3>${properties.name}, ${properties.country}</h3>
  //                               <table>
  //                                   <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
  //                                   <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
  //                                   <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
  //                                   <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
  //                                   <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
  //                               </table>
  //                           </div>
  //                                   `
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Steel IGP data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load  Plastic Waste IGP layer
  // if (!map.getSource("solidWasteIGP")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Plastic+and+Landfill+Sites/waste_main.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("solidWasteIGP", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "solid_waste_IGP",
  //         type: "circle",
  //         source: "solidWasteIGP",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 2,
  //           "circle-color": "rgb(206, 131, 19)", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "solid_waste_IGP", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(
  //                 `
  //                                   <div class="popup-table">
  //                               <h3>${properties.name}, ${properties.country}</h3>
  //                               <table>
  //                                   <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
  //                                   <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
  //                                   <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
  //                                   <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
  //                                   <tr><th>SO<sub>2</sub></th><td>${properties.so2}</td></tr>
  //                               </table>
  //                           </div>
  //                                   `
  //               )
  //               .addTo(map);
  //           }
  //         });
  //       }
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Solid Waste IGP data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Pollutant decay heatmap layer
  // if (!map.getSource("pollutant_decay")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/bilalpervaiz/97a2ce64252ad5a095c9222f4c9ae5b1/raw/4fcc0590f9b28e13a369fb93f4f0ff00410844a6/pollutant_decay.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("pollutant_decay", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "pollutant",
  //         type: "heatmap",
  //         source: "pollutant_decay",
  //         maxzoom: 12,
  //         layout: {
  //           visibility: "none",
  //         },
  //         paint: {
  //           "heatmap-weight": {
  //             property: "decay_PM10_1",
  //             type: "exponential",
  //             stops: [
  //               [0.030291835876543865, 0],
  //               [3.332101946419825, 1],
  //             ],
  //           },
  //           "heatmap-color": [
  //             "interpolate",
  //             ["linear"],
  //             ["heatmap-density"],
  //             0,
  //             "rgba(255,255,178,0)",
  //             0.2,
  //             "rgb(254,204,92)",
  //             0.4,
  //             "rgb(253,141,60)",
  //             0.6,
  //             "rgb(240,59,32)",
  //             0.8,
  //             "rgb(189,0,38)",
  //           ],
  //           "heatmap-radius": {
  //             stops: [
  //               [11, 15],
  //               [15, 20],
  //             ],
  //           },
  //           "heatmap-opacity": {
  //             default: 1,
  //             stops: [
  //               [14, 1],
  //               [15, 0],
  //             ],
  //           },
  //         },
  //       });
  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Pollutant Decay data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Coal Africa layer
  // if (!map.getSource("coal_Afc")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/Mseher/b3f5e885ddae2b90be7048f87896ef48/raw/57db894dc8237b9d09a8f3ed1a5e114400cfc49f/Africa_Coal.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("coal_Afc", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "coal_africa",
  //         type: "circle",
  //         source: "coal_Afc",
  //         paint: {
  //           "circle-radius": 7,
  //           "circle-stroke-width": 2,
  //           "circle-color": "#616161", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "coal_africa", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0].properties;
  //             const popupContent = `
  //                           <div class="popup-table">
  //                               <h3>${properties.plant_name}, ${properties.country}</h3>
  //                               <table>
  //                                   <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
  //                                   <tr><th>PM<sub>10</sub></th><td>${properties.pm10}</td></tr>
  //                                   <tr><th>PM<sub>2.5</sub></th><td>${properties.pm25}</td></tr>
  //                                   <tr><th>NO<sub>2</sub></th><td>${properties.nox}</td></tr>
  //                                   <tr><th>SO<sub>2</sub></th><td>${properties.sox}</td></tr>
  //                               </table>
  //                           </div>
  //                           `;
  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(popupContent)
  //               .addTo(map);
  //           }
  //         });
  //       }

  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Africa Coal data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Cement Africa layer
  // if (!map.getSource("cement_Afc")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/Mseher/3c778bdbd8464ddc939b41c87e145bbc/raw/c605634a3e418b2a52a2125a3943d432d688755f/cement_africa.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("cement_Afc", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "cement_africa",
  //         type: "circle",
  //         source: "cement_Afc",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-stroke-width": 0.5,
  //           "circle-color": "purple", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "cement_africa", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0]?.properties || {}; // Ensure properties exist

  //             const popupContent = `
  //                           <div class="popup-table">
  //                               <h3>${properties.city || "Unknown City"}, ${
  //               properties.state || "Unknown State"
  //             }, ${properties.country || "Unknown Country"}</h3>
  //                               <table>
  //                                   <tr><th>Sub Region</th><td>${
  //                                     properties.sub_region || "N/A"
  //                                   }</td></tr>
  //                                   <tr><th>Plant Type</th><td>${
  //                                     properties.plant_type || "N/A"
  //                                   }</td></tr>
  //                                   <tr><th>Status</th><td>${
  //                                     properties.status || "N/A"
  //                                   }</td></tr>
  //                                   <tr><th>Production Type</th><td>${
  //                                     properties.production_type || "N/A"
  //                                   }</td></tr>
  //                                   <tr><th>Capacity</th><td>${
  //                                     properties.capacity || "N/A"
  //                                   } mega watt</td></tr>
  //                               </table>
  //                           </div>
  //                           `;

  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(popupContent)
  //               .addTo(map);
  //           }
  //         });
  //       }

  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Africa Cement data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Paper Pulp Africa layer
  // if (!map.getSource("paper_Pulp_Afc")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/Mseher/d77d22cea85ac0f3ef184a48d0aa1bba/raw/0751824b8af6cb919a8ec2aab869367987345545/Paper_pulp_Africa.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("paper_Pulp_Afc", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "paper_pulp_africa",
  //         type: "circle",
  //         source: "paper_Pulp_Afc",
  //         paint: {
  //           "circle-radius": 6,
  //           "circle-stroke-width": 0.6,
  //           "circle-color": "rgb(112, 206, 202)", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "paper_pulp_africa", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0]?.properties || {}; // Ensure properties exist

  //             const popupContent = `
  //                           <div class="popup-table">
  //                               <h3>${properties.plant_name}</h3>
  //                               <table>
  //                                   <tr><th>Country</th><td>${properties.country}</td></tr>
  //                                   <tr><th>City</th><td>${properties.city}</td></tr>
  //                                   <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
  //                                   <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
  //                                   <tr><th>Status</th><td>${properties.status}</td></tr>
  //                               </table>
  //                           </div>
  //                           `;

  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(popupContent)
  //               .addTo(map);
  //           }
  //         });
  //       }

  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Africa Paper Pulp data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Steel Plants Africa layer
  // if (!map.getSource("steel_Afc")) {
  //   showLoadingSpinner(); // Show the spinner while loading
  //   fetch(
  //     "https://gist.githubusercontent.com/Mseher/23af19444bdc70b115afcb6cc45879ec/raw/eda2bc6398aaa50595cfc7ed81bbca1d15d78c31/Steel_Plants_Africa.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("steel_Afc", {
  //         type: "geojson",
  //         data: data,
  //       });
  //       map.addLayer({
  //         id: "steel_africa",
  //         type: "circle",
  //         source: "steel_Afc",
  //         paint: {
  //           "circle-radius": 6,
  //           "circle-stroke-width": 0.6,
  //           "circle-color": "rgb(24, 54, 84)", // Add # for hex color
  //           "circle-stroke-color": "white",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       if (!isAggregateToolEnabled()) {
  //         // Popup for the coal layer
  //         map.on("click", "steel_africa", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const properties = e.features[0]?.properties || {}; // Ensure properties exist

  //             const popupContent = `
  //                           <div class="popup-table">
  //                               <h3>${properties.state}, ${properties.city}</h3>
  //                               <table>
  //                                   <tr><th>Country</th><td>${properties.country}</td></tr>
  //                                   <tr><th>Sub Region</th><td>${properties.sub_region}</td></tr>
  //                                   <tr><th>Plant Type</th><td>${properties.plant_type}</td></tr>
  //                                   <tr><th>Status</th><td>${properties.status}</td></tr>
  //                               </table>
  //                           </div>
  //                           `;

  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(popupContent)
  //               .addTo(map);
  //           }
  //         });
  //       }

  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Africa Steel Plants data:", error);
  //       hideLoadingSpinner(); // Hide the spinner even if there is an error
  //     });
  // }

  // // Lazy load Boilers layer
  // if (!map.getSource("boilers_layer")) {
  //   showLoadingSpinner(); // Show loading spinner while fetching data

  //   fetch(
  //     "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/boilers/boilers.geojson"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       map.addSource("boilers_layer", {
  //         type: "geojson",
  //         data: data,
  //       });

  //       map.addLayer({
  //         id: "boilers",
  //         type: "circle",
  //         source: "boilers_layer",
  //         paint: {
  //           "circle-radius": 6,
  //           "circle-color": "#FF5722",
  //           "circle-stroke-color": "white",
  //           "circle-stroke-width": 0.6,
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       // Enable popup on click
  //       if (!isAggregateToolEnabled()) {
  //         map.on("click", "boilers", (e) => {
  //           if (!isAggregateToolEnabled()) {
  //             const props = e.features[0].properties;

  //             // Concatenate Address of Industry and Industry with comma, ignoring empty values
  //             const addressIndustry = [
  //               props["Name of Enterprise"],
  //               props["Address of the Industry"],
  //             ]
  //               .filter(Boolean)
  //               .join(", ");

  //             const popupContent = `
  //                           <div class="popup-table">
  //                               <h3>${addressIndustry || ""}</h3>
  //                           </div>
  //                       `;

  //             new mapboxgl.Popup()
  //               .setLngLat(e.lngLat)
  //               .setHTML(popupContent)
  //               .addTo(map);
  //           }
  //         });
  //       }

  //       hideLoadingSpinner(); // Hide spinner after successful load
  //     })
  //     .catch((error) => {
  //       console.error("Error loading Industries GeoJSON:", error);
  //       hideLoadingSpinner(); // Hide spinner even if load fails
  //     });
  // }

  // //Air pollutants layer
  // // Lazy load OpenAQ Air Quality layer
  // if (!map.getSource("openaq_latest")) {
  //   showLoadingSpinner(); // Show the spinner while loading

  //   fetchOpenAQLatestAsGeoJSON()
  //     .then((data) => {
  //       // Add the GeoJSON as a new source
  //       map.addSource("openaq_latest", {
  //         type: "geojson",
  //         data: data,
  //       });

  //       // Add a circle layer for air quality stations
  //       map.addLayer({
  //         id: "openaq_latest",
  //         type: "circle",
  //         source: "openaq_latest",
  //         paint: {
  //           "circle-radius": 5,
  //           "circle-color": "rgba(73, 84, 24, 1)",
  //           "circle-stroke-width": 0.6,
  //           "circle-stroke-color": "#fff",
  //         },
  //         layout: {
  //           visibility: "visible",
  //         },
  //       });

  //       // Add popups for air quality stations
  //       map.on("click", "openaq_latest", (e) => {
  //         const properties = e.features[0].properties;

  //         // Dynamically generate rows for available pollutants
  //         const excludeKeys = [
  //           "id",
  //           "name",
  //           "lat",
  //           "lon",
  //           "type",
  //           "fuel",
  //           "region",
  //           "country",
  //           "status",
  //           "capacity",
  //           "last_update",
  //         ];
  //         let tableRows = "";

  //         // Function to convert numbers in string to subscript using <sub> tags
  //         function toSubTag(str) {
  //           return str.replace(/(\d+)/g, "<sub>$1</sub>");
  //         }

  //         // Inside your popup generation loop
  //         for (const [key, value] of Object.entries(properties)) {
  //           if (!excludeKeys.includes(key) && value != null) {
  //             // Format the label
  //             let label = key.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();

  //             // Special case for PM25 -> PM2.5
  //             if (label === "PM25") label = "PM2.5";

  //             // Wrap any numbers in <sub>
  //             label = toSubTag(label);

  //             const roundedValue = Number(value).toFixed(2);

  //             tableRows += `
  //           <tr>
  //               <td><strong>${label}</strong></td>
  //               <td>${roundedValue}</td>
  //           </tr>
  //       `;
  //           }
  //         }

  //         // Add last_update row if exists
  //         if (properties.last_update) {
  //           tableRows += `
  //                       <tr>
  //                           <td><strong>Last Update<strong></td>
  //                           <td>${properties.last_update}</td>
  //                       </tr>
  //                   `;
  //         }

  //         const popupContent = `
  //                   <div class="popup-table">
  //                       <table>
  //                           <thead>
  //                               <tr>
  //                                   <th>Pollutant</th>
  //                                   <th>Value (µg/m³)</th>
  //                               </tr>
  //                           </thead>
  //                           <tbody>
  //                               ${
  //                                 tableRows ||
  //                                 '<tr><td colspan="2">No recent measurements</td></tr>'
  //                               }
  //                           </tbody>
  //                       </table>
  //                   </div>
  //               `;

  //         new mapboxgl.Popup()
  //           .setLngLat(e.lngLat)
  //           .setHTML(popupContent)
  //           .addTo(map);
  //       });

  //       hideLoadingSpinner(); // Hide the spinner after loading
  //     })
  //     .catch((error) => {
  //       console.error("Error loading OpenAQ data:", error);
  //       hideLoadingSpinner(); // Hide spinner even if there is an error
  //     });
  // }
// }

// // Layers Paper Pulp
// export function loadPaperPulpIGP(map) {
//   if (!map.getSource("paperPulpIGP")) {
//     showLoadingSpinner();
//     return fetch(
//       "https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Pulp+and+Paper+Plants/paper_pulp_main.geojson"
//     )
//       .then(response => response.json())
//       .then((data) => {
//         map.addSource("paperPulpIGP", { type: "geojson", data });
//         map.addLayer({
//           id: "paper_pulp_IGP",
//           type: "circle",
//           source: "paperPulpIGP",
//           paint: {
//             "circle-radius": 5,
//             "circle-stroke-width": 2,
//             "circle-color": "rgb(112, 206, 202)",
//             "circle-stroke-color": "white",
//           },
//           layout: { visibility: "visible" },
//         });


//         if (!isAggregateToolEnabled()) {
//                   map.on("click", "paper_pulp_IGP", (e) => {
//                     const props = e.features[0].properties;
//                     new mapboxgl.Popup()
//                       .setLngLat(e.lngLat)
//                       .setHTML(`
//                         <div class="popup-table">
//                           <h3>${props.name}, ${props.country}</h3>
//                           <table>
//                             <tr><th>Pollutant</th><td> tonnes/Yr</td></tr>
//                             <tr><th>PM<sub>10</sub></th><td>${props.pm10}</td></tr>
//                             <tr><th>PM<sub>2.5</sub></th><td>${props.pm25}</td></tr>
//                             <tr><th>NO<sub>2</sub></th><td>${props.nox}</td></tr>
//                             <tr><th>SO<sub>2</sub></th><td>${props.so2}</td></tr>
//                           </table>
//                         </div>
//                       `)
//                       .addTo(map);
//                   });
//                 }

//         hideLoadingSpinner();
//       })
//       .catch((error) => {
//         console.error("Error loading Paper Pulp IGP data:", error);
//         hideLoadingSpinner();
//       });
//   }
//   return Promise.resolve();
// }


//AGGREGATETOOL.JS

// Usage example
// generateEmissionsChart(totalCoalEmissions);


// // Function to handle aggregation
// function handleAggregation(map, lngLat) {
//     const clickCoordinates = [lngLat.lng, lngLat.lat];
//     const bufferRadius = parseFloat(document.getElementById('bufferSizeSelector').value);

//     if (isNaN(bufferRadius) || bufferRadius <= 0) {
//         console.error("Invalid buffer size selected.");
//         return;
//     }

//     const buffer = turf.buffer(turf.point(clickCoordinates), bufferRadius, { units: 'kilometers' });

//     if (!buffer || buffer.geometry.coordinates.length === 0) {
//         console.error("Buffer generation failed.");
//         return;
//     }

//     // Add the buffer to the map as a new layer
//     clearBuffer(map);
//     map.addSource('bufferSource', { type: 'geojson', data: buffer });
//     map.addLayer({
//         id: 'bufferLayer',
//         type: 'fill',
//         source: 'bufferSource',
//         paint: {
//             'fill-color': 'rgba(128, 128, 128, 0.5)',
//             'fill-outline-color': 'black'
//         }
//     });

//     let popupContent = `<div class="popup-table"><h3>Aggregated Data (${bufferRadius} km buffer)</h3>`;

//      // 1. Aggregate brick kilns based on visibility
//     let totalBrickKilns = 0;
//     const brickKilnsLayers = ['BK_PK', 'BK_IND', 'BK_BAN', 'Brick_kilns_DRC', 'Brick_kilns_GHA', 'Brick_kilns_NGA', 'Brick_kilns_UGA'];
    
//     brickKilnsLayers.forEach(layerId => {
//         if (map.getLayer(layerId) && map.getLayoutProperty(layerId, 'visibility') === 'visible') {
//             const features = map.queryRenderedFeatures({ layers: [layerId] });
//             features.forEach(feature => {
//                 if (turf.booleanPointInPolygon(turf.point(feature.geometry.coordinates), buffer)) {
//                     totalBrickKilns++;
//                 }
//             });
//         }
//     });

//     if (totalBrickKilns > 0) {
//         popupContent += `<p>Brick Kilns: ${totalBrickKilns}</p>`;
//     }
//     console.log('Total Brick Kilns Count:', totalBrickKilns);
    


//       // 2. Aggregate coal plants within the buffer
//       let totalCoalEmissions = {
//           nox: 0,
//           so2: 0,
//           pm10: 0,
//           pm25: 0
//       };
//       let totalCoalPlants = 0;

//       if (map.getLayer('coal')) {
//           const coalVisibility = map.getLayoutProperty('coal', 'visibility');
//           if (coalVisibility === 'visible') {
//               const coalLayerFeatures = map.queryRenderedFeatures({ layers: ['coal'] });

//               coalLayerFeatures.forEach((feature) => {
//                   const coalPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(coalPoint, buffer)) {
//                       totalCoalEmissions.nox += feature.properties.nox_tn_y || 0;
//                       totalCoalEmissions.so2 += feature.properties.so2_tn_y || 0;
//                       totalCoalEmissions.pm10 += feature.properties.p10_tn_y || 0;
//                       totalCoalEmissions.pm25 += feature.properties.p25_tn_y || 0;
//                       totalCoalPlants++; // Count coal plants within the buffer
//                   }
//               });
//           }
//       }

//       if (map.getLayer('coal_africa')) {
//           const coalVisibility = map.getLayoutProperty('coal_africa', 'visibility');
//           if (coalVisibility === 'visible') {
//               const coalLayerFeatures = map.queryRenderedFeatures({ layers: ['coal_africa'] });

//               coalLayerFeatures.forEach((feature) => {
//                   const coalPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(coalPoint, buffer)) {
//                       totalCoalEmissions.nox += feature.properties.nox || 0;
//                       totalCoalEmissions.so2 += feature.properties.sox || 0;
//                       totalCoalEmissions.pm10 += feature.properties.pm10 || 0;
//                       totalCoalEmissions.pm25 += feature.properties.pm25 || 0;
//                       totalCoalPlants++; // Count coal plants within the buffer
//                   }
//               });

            
//           }
//       }

//       // if (totalCoalPlants > 0) {
//       //     popupContent += `<p>Coal Points: ${totalCoalPlants}</p>`;
//       // }

//       // 2. Aggregate cement IGP data within the buffer
//       let cementIGPCount = 0;
//       if (map.getLayer('cement_IGP')) {
//           const  cementIGPVisibility = map.getLayoutProperty('cement_IGP', 'visibility');
//           if ( cementIGPVisibility === 'visible') {
//               const  cementIGPFeatures = map.queryRenderedFeatures({ layers: ['cement_IGP'] });

//               cementIGPFeatures.forEach((feature) => {
//                   const  cementIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( cementIGPPoint, buffer)) {
//                       cementIGPCount += 1;
//                   }
//               });

//               // if ( cementIGPCount > 0) {
//               //     popupContent += `<p>Cement Plants: ${ cementIGPCount}</p>`;
//               // }
//           }
//       }


//       // 3. Aggregate africa cement data within the buffer
//       let cementAfricaCount = 0;
//       if (map.getLayer('cement_africa')) {
//           const cementAfricaVisibility = map.getLayoutProperty('cement_africa', 'visibility');
//           if (cementAfricaVisibility === 'visible') {
//               const cementAfricaFeatures = map.queryRenderedFeatures({ layers: ['cement_africa'] });

//               cementAfricaFeatures.forEach((feature) => {
//                   const cementAfricaPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(cementAfricaPoint, buffer)) {
//                       cementAfricaCount += 1;
//                   }
//               });

//               // if (cementAfricaCount > 0) {
//               //     popupContent += `<p>Cement Plants: ${cementAfricaCount}</p>`;
//               // }
//           }
//       }

//       // 4. Aggregate IGP paper pulp data within the buffer
//       let paperPulpIGPCount = 0;
//       if (map.getLayer('paper_pulp_IGP')) {
//           const  paperPulpIGPVisibility = map.getLayoutProperty('paper_pulp_IGP', 'visibility');
//           if ( paperPulpIGPVisibility === 'visible') {
//               const  paperPulpIGPFeatures = map.queryRenderedFeatures({ layers: ['paper_pulp_IGP'] });

//               paperPulpIGPFeatures.forEach((feature) => {
//                   const  paperPulpIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( paperPulpIGPPoint, buffer)) {
//                       paperPulpIGPCount += 1;
//                   }
//               });

//               // if ( paperPulpIGPCount > 0) {
//               //     popupContent += `<p>Paper Pulp Plants: ${ paperPulpIGPCount}</p>`;
//               // }
//           }
//       }

//       // 5. Aggregate africa paper pulp data within the buffer
//       let paperPulpAfricaCount = 0;
//       if (map.getLayer('paper_pulp_africa')) {
//           const  paperPulpAfricaVisibility = map.getLayoutProperty('paper_pulp_africa', 'visibility');
//           if ( paperPulpAfricaVisibility === 'visible') {
//               const  paperPulpAfricaFeatures = map.queryRenderedFeatures({ layers: ['paper_pulp_africa'] });

//               paperPulpAfricaFeatures.forEach((feature) => {
//                   const  paperPulpAfricaPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( paperPulpAfricaPoint, buffer)) {
//                       paperPulpAfricaCount += 1;
//                   }
//               });

//               if ( paperPulpAfricaCount > 0) {
//                   popupContent += `<p>Paper Pulp Plants: ${ paperPulpAfricaCount}</p>`;
//               }
//           }
//       }

//       // 6. Aggregate africa steel plants data within the buffer
//       let steelIGPCount = 0;
//       if (map.getLayer('steel_IGP')) {
//           const  steelIGPVisibility = map.getLayoutProperty('steel_IGP', 'visibility');
//           if (steelIGPVisibility === 'visible') {
//               const  steelIGPFeatures = map.queryRenderedFeatures({ layers: ['steel_IGP'] });

//               steelIGPFeatures.forEach((feature) => {
//                   const  steelIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( steelIGPPoint, buffer)) {
//                       steelIGPCount += 1;
//                   }
//               });

//               // if ( steelIGPCount > 0) {
//               //     popupContent += `<p>Steel Plants: ${ steelIGPCount}</p>`;
//               // }
//           }
//       }

//       // 7. Aggregate africa steel plants data within the buffer
//       let steelAfricaCount = 0;
//       if (map.getLayer('steel_africa')) {
//           const  steelAfricaVisibility = map.getLayoutProperty('steel_africa', 'visibility');
//           if (steelAfricaVisibility === 'visible') {
//               const  steelAfricaFeatures = map.queryRenderedFeatures({ layers: ['steel_africa'] });

//               steelAfricaFeatures.forEach((feature) => {
//                   const  steelAfricaPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( steelAfricaPoint, buffer)) {
//                       steelAfricaCount += 1;
//                   }
//               });

//               // if ( steelAfricaCount > 0) {
//               //     popupContent += `<p>Steel Plants: ${ steelAfricaCount}</p>`;
//               // }
//           }
//       }

//       // 8. Aggregate fossil fuel data within the buffer
//       let fossilFuelCount = 0;
//       if (map.getLayer('fossil')) {
//           const fossilFuelVisibility = map.getLayoutProperty('fossil', 'visibility');
//           if (fossilFuelVisibility === 'visible') {
//               const fossilFuelLayerFeatures = map.queryRenderedFeatures({ layers: ['fossil'] });

//               fossilFuelLayerFeatures.forEach((feature) => {
//                   const fossilFuelPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(fossilFuelPoint, buffer)) {
//                       fossilFuelCount += 1;
//                   }
//               });

//               // if (fossilFuelCount > 0) {
//               //     popupContent += `<p>Fossil Fuel Points: ${fossilFuelCount}</p>`;
//               // }
//           }
//       }

//       // 9. Aggregate GPW data (population or area) within the buffer
//       let totalPopulation = 0;
//       let totalGPWPoints = 0;
//       if (map.getLayer('gpw')) {
//           const gpwVisibility = map.getLayoutProperty('gpw', 'visibility');
//           if (gpwVisibility === 'visible') {
//               const gpwLayerFeatures = map.queryRenderedFeatures({ layers: ['gpw'] });

//               gpwLayerFeatures.forEach((feature) => {
//                   const gpwPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon(gpwPoint, buffer)) {
//                       totalPopulation += feature.properties.area_new || 0; // Sum the area values (replace with population if available)
//                       totalGPWPoints++; // Count GPW points
//                   }
//               });

//               // if (totalGPWPoints > 0) {
//               //     popupContent += `<p>Total GPW Points: ${totalGPWPoints}</p>`;
//               // }
//           }
//       }

//       // 10. Aggregate africa steel plants data within the buffer
//       let oilGasIGPCount = 0;
//       if (map.getLayer('oil_gas_IGP')) {
//           const  oilGasIGPVisibility = map.getLayoutProperty('oil_gas_IGP', 'visibility');
//           if (oilGasIGPVisibility === 'visible') {
//               const  oilGasIGPFeatures = map.queryRenderedFeatures({ layers: ['oil_gas_IGP'] });

//               oilGasIGPFeatures.forEach((feature) => {
//                   const  oilGasIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( oilGasIGPPoint, buffer)) {
//                       oilGasIGPCount += 1;
//                   }
//               });

//               // if ( oilGasIGPCount > 0) {
//               //     popupContent += `<p>Oil Gas Refineries: ${ oilGasIGPCount}</p>`;
//               // }
//           }
//       }

//       // 11. Aggregate africa steel plants data within the buffer
//       let plasticWasteIGPCount = 0;
//       if (map.getLayer('plastic_waste_IGP')) {
//           const  plasticWasteIGPVisibility = map.getLayoutProperty('plastic_waste_IGP', 'visibility');
//           if (plasticWasteIGPVisibility === 'visible') {
//               const  plasticWasteIGPFeatures = map.queryRenderedFeatures({ layers: ['plastic_waste_IGP'] });

//               plasticWasteIGPFeatures.forEach((feature) => {
//                   const  plasticWasteIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( plasticWasteIGPPoint, buffer)) {
//                       plasticWasteIGPCount += 1;
//                   }
//               });

//               // if ( plasticWasteIGPCount > 0) {
//               //     popupContent += `<p>Plastic Waste Burning Sites: ${ plasticWasteIGPCount}</p>`;
//               // }
//           }
//       }

//       // 11. Aggregate africa steel plants data within the buffer
//       let solidWasteIGPCount = 0;
//       if (map.getLayer('solid_waste_IGP')) {
//           const  solidWasteIGPVisibility = map.getLayoutProperty('solid_waste_IGP', 'visibility');
//           if (solidWasteIGPVisibility === 'visible') {
//               const  solidWasteIGPFeatures = map.queryRenderedFeatures({ layers: ['solid_waste_IGP'] });

//               solidWasteIGPFeatures.forEach((feature) => {
//                   const  solidWasteIGPPoint = turf.point(feature.geometry.coordinates);
//                   if (turf.booleanPointInPolygon( solidWasteIGPPoint, buffer)) {
//                       solidWasteIGPCount += 1;
//                   }
//               });

//               // if ( solidWasteIGPCount > 0) {
//               //     popupContent += `<p>Solid Waste Burning Sites: ${ solidWasteIGPCount}</p>`;
//               // }
//           }
//       }

//           // End the popup content and add canvas for the charts
//               popupContent += `
//               <canvas id="emissionsChart" width="250" height="250"></canvas>
//               <canvas id="countsChart" width="250" height="250"></canvas>
//               </div>
//           `;
      

//     // Show popup
//     // new mapboxgl.Popup()
//     //     .setLngLat(lngLat)
//     //     .setHTML(popupContent)
//     //     .addTo(map);
//     const resultBox = document.getElementById('aggregateResults');
//     resultBox.innerHTML = popupContent;


//     // Generate charts after popup renders
//     setTimeout(() => generateCharts(totalCoalEmissions, totalCoalPlants, totalBrickKilns, totalGPWPoints, fossilFuelCount,
//         cementIGPCount,cementAfricaCount,paperPulpIGPCount,paperPulpAfricaCount, steelIGPCount, steelAfricaCount,oilGasIGPCount,
//         plasticWasteIGPCount, solidWasteIGPCount
//     ), 100);
// }

// // Function to generate charts
// function generateCharts(totalCoalEmissions, totalCoalPlants, totalBrickKilns, totalGPWPoints, fossilFuelCount, cementIGPCount,cementAfricaCount,paperPulpIGPCount,paperPulpAfricaCount, steelIGPCount, steelAfricaCount,oilGasIGPCount,plasticWasteIGPCount, solidWasteIGPCount) {
//     const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
//     new Chart(emissionsCtx, {
//         type: 'pie',
//         data: {
//             labels: ['NO₂', 'SO₂', 'PM₁₀', 'PM₂.₅'],
//             datasets: [{
//                 label: 'Emissions (tons/year)',
//                 data: [
//                     totalCoalEmissions.nox.toFixed(2),
//                     totalCoalEmissions.so2.toFixed(2),
//                     totalCoalEmissions.pm10.toFixed(2),
//                     totalCoalEmissions.pm25.toFixed(2)
//                 ],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.6)', // NO₂ color
//                     'rgba(54, 162, 235, 0.6)', // SO₂ color
//                     'rgba(255, 206, 86, 0.6)', // PM₁₀ color
//                     'rgba(75, 192, 192, 0.6)'  // PM₂.₅ color
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Coal Emissions (tons/year)'
//                 }
//             }
//         }
//     });

//      // Map layer colors for different features
//      const layerColors = {
//         'Coal Plants': '#616161',
//         'GPW Points': 'black',
//         'Fossil Fuel Points': 'blue',
//         'Cement IGP': 'purple',
//         'Cement Africa': 'purple',  // Assuming same color as IGP for simplicity
//         'Paper Pulp IGP': 'rgb(112, 206, 202)',
//         'Paper Pulp Africa': 'rgb(112, 206, 202)',  // Assuming same color as IGP
//         'Steel IGP': 'rgb(24, 54, 84)',
//         'Steel Africa': 'rgb(24, 54, 84)',  // Assuming same color as IGP
//         'Oil Gas Refineries': 'brown',
//         'Plastic Waste': 'rgb(165, 146, 23)',
//         'Solid Waste': 'rgb(206, 131, 19)'
//     };

//     // Prepare data for the Counts Chart by filtering non-zero counts
//     const countsData = [
//         { label: 'Coal Plants', value: totalCoalPlants },
//         { label: 'GPW Points', value: totalGPWPoints },
//         { label: 'Fossil Fuel Points', value: fossilFuelCount },
//         { label: 'Cement IGP', value: cementIGPCount },
//         { label: 'Cement Africa', value: cementAfricaCount },
//         { label: 'Paper Pulp IGP', value: paperPulpIGPCount },
//         { label: 'Paper Pulp Africa', value: paperPulpAfricaCount },
//         { label: 'Steel IGP', value: steelIGPCount },
//         { label: 'Steel Africa', value: steelAfricaCount },
//         { label: 'Oil Gas Refineries', value: oilGasIGPCount },
//         { label: 'Plastic Waste', value: plasticWasteIGPCount },
//         { label: 'Solid Waste', value: solidWasteIGPCount }
//     ].filter(entry => entry.value > 0);  // Filter out zero-count entries
    
//     const countsLabels = countsData.map(entry => entry.label);
//         const countsValues = countsData.map(entry => entry.value);
//         const backgroundColors = countsLabels.map(label => layerColors[label]);
//         const borderColors = countsLabels.map(label => layerColors[label]);
    
//         // Counts Chart
//         const countsCtx = document.getElementById('countsChart').getContext('2d');
//         new Chart(countsCtx, {
//             type: 'bar',
//             data: {
//                 labels: countsLabels,
//                 datasets: [{
//                     label: 'Counts',
//                     data: countsValues,
//                     backgroundColor: backgroundColors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.6)')),
//                     borderColor: borderColors,
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 scales: {
//                     y: {
//                         beginAtZero: true
//                     }
//                 },
//                 plugins: {
//                     title: {
//                         display: true,
//                         text: 'Counts for Selected Layers',
//                         font: {
//                             size: 14,
//                             weight: 'bold'
//                         },
//                         padding: {
//                             top: 10,
//                             bottom: 20
//                         }
//                     },
//                     legend: {
//                         position: 'none',
//                     }
//                 }
//             }
//         });
// }




// //try2
// function handleAggregation(map, lngLat) {
//     const clickCoordinates = [lngLat.lng, lngLat.lat];
//     const bufferRadius = parseFloat(document.getElementById('bufferSizeSelector').value);
//     if (isNaN(bufferRadius) || bufferRadius <= 0) return;

//     const buffer = turf.buffer(turf.point(clickCoordinates), bufferRadius, { units: 'kilometers' });
//     if (!buffer) return;

//     // Clear previous buffer
//     clearBuffer(map);
//     map.addSource('bufferSource', { type: 'geojson', data: buffer });
//     map.addLayer({
//         id: 'bufferLayer',
//         type: 'fill',
//         source: 'bufferSource',
//         paint: { 'fill-color': 'rgba(128,128,128,0.5)', 'fill-outline-color': 'black' }
//     });

//     const popupData = {}; // To store counts/emissions dynamically

//     map.getStyle().layers.forEach(layer => {
//         const layerId = layer.id;

//         if (!map.getLayer(layerId)) return;

//         const visibility = map.getLayoutProperty(layerId, 'visibility') || 'none';
//         if (visibility !== 'visible') return;

//         const features = map.queryRenderedFeatures({ layers: [layerId] });
//         if (!features.length) return;

//         features.forEach(f => {
//             const point = turf.point(f.geometry.coordinates);

//             if (!turf.booleanPointInPolygon(point, buffer)) return;

//             // Check if layer has emission properties
//             let hasEmission = false;
//             const emissions = {};
//             emissionProperties.forEach(prop => {
//                 if (f.properties[prop] !== undefined) {
//                     hasEmission = true;
//                     emissions[prop] = (emissions[prop] || 0) + f.properties[prop];
//                 }
//             });

//             if (hasEmission) {
//                 if (!popupData[layerId]) popupData[layerId] = { emissions: {}, count: 0 };
//                 popupData[layerId].count++;
//                 emissionProperties.forEach(prop => {
//                     if (emissions[prop] !== undefined) {
//                         popupData[layerId].emissions[prop] = (popupData[layerId].emissions[prop] || 0) + emissions[prop];
//                     }
//                 });
//             } else {
//                 // Just count features without emissions
//                 if (!popupData[layerId]) popupData[layerId] = { count: 0 };
//                 popupData[layerId].count++;
//             }
//         });
//     });

//     // Build popup HTML
//     let popupContent = `<div class="popup-table"><h3>Aggregated Data (${bufferRadius} km buffer)</h3>`;
//     for (const [layerId, data] of Object.entries(popupData)) {
//         if (data.count > 0) {
//             popupContent += `<p>${layerId}: ${data.count} feature(s)</p>`;
//             if (data.emissions) {
//                 const emStr = Object.entries(data.emissions).map(([k, v]) => `${k.toUpperCase()}: ${v.toFixed(2)}`).join(', ');
//                 popupContent += `<p>Emissions: ${emStr}</p>`;
//             }
//         }
//     }

//     // Add canvases for charts
//     popupContent += `<canvas id="emissionsChart" width="250" height="250"></canvas>`;
//     popupContent += `<canvas id="countsChart" width="250" height="250"></canvas>`;
//     popupContent += `</div>`;

//     document.getElementById('aggregateResults').innerHTML = popupContent;

//     // Generate charts dynamically based on popupData
//     setTimeout(() => generateChartsFromPopupData(popupData), 100);
// }

// // Function to generate charts from popup data
// function generateChartsFromPopupData(popupData) {
//     // Ensure popupData exists and has default values
//     const totalCoalEmissions = popupData.totalCoalEmissions || { nox: 0, so2: 0, pm10: 0, pm25: 0 };
//     const totalCoalPlants = popupData.totalCoalPlants || 0;
//     const totalBrickKilns = popupData.totalBrickKilns || 0;
//     const totalGPWPoints = popupData.totalGPWPoints || 0;
//     const fossilFuelCount = popupData.fossilFuelCount || 0;
//     const cementIGPCount = popupData.cementIGPCount || 0;
//     const cementAfricaCount = popupData.cementAfricaCount || 0;
//     const paperPulpIGPCount = popupData.paperPulpIGPCount || 0;
//     const paperPulpAfricaCount = popupData.paperPulpAfricaCount || 0;
//     const steelIGPCount = popupData.steelIGPCount || 0;
//     const steelAfricaCount = popupData.steelAfricaCount || 0;
//     const oilGasIGPCount = popupData.oilGasIGPCount || 0;
//     const plasticWasteIGPCount = popupData.plasticWasteIGPCount || 0;
//     const solidWasteIGPCount = popupData.solidWasteIGPCount || 0;

//     // Get canvas contexts
//     const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
//     const countsCtx = document.getElementById('countsChart').getContext('2d');

//     // Destroy previous charts if they exist
//     if (emissionsChart) emissionsChart.destroy();
//     if (countsChart) countsChart.destroy();

//     // Pie chart for coal emissions
//     emissionsChart = new Chart(emissionsCtx, {
//         type: 'pie',
//         data: {
//             labels: ['NO₂', 'SO₂', 'PM₁₀', 'PM₂.₅'],
//             datasets: [{
//                 label: 'Emissions (tons/year)',
//                 data: [
//                     totalCoalEmissions.nox.toFixed(2),
//                     totalCoalEmissions.so2.toFixed(2),
//                     totalCoalEmissions.pm10.toFixed(2),
//                     totalCoalEmissions.pm25.toFixed(2)
//                 ],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.6)',
//                     'rgba(54, 162, 235, 0.6)',
//                     'rgba(255, 206, 86, 0.6)',
//                     'rgba(75, 192, 192, 0.6)'
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Coal Emissions (tons/year)'
//                 },
//                 legend: {
//                     position: 'bottom'
//                 }
//             }
//         }
//     });

//     // Layer colors for counts chart
//     const layerColors = {
//         'Coal Plants': '#616161',
//         'GPW Points': 'black',
//         'Fossil Fuel Points': 'blue',
//         'Cement IGP': 'purple',
//         'Cement Africa': 'purple',
//         'Paper Pulp IGP': 'rgb(112, 206, 202)',
//         'Paper Pulp Africa': 'rgb(112, 206, 202)',
//         'Steel IGP': 'rgb(24, 54, 84)',
//         'Steel Africa': 'rgb(24, 54, 84)',
//         'Oil Gas Refineries': 'brown',
//         'Plastic Waste': 'rgb(165, 146, 23)',
//         'Solid Waste': 'rgb(206, 131, 19)'
//     };

//     // Prepare counts data
//     const countsData = [
//         { label: 'Coal Plants', value: totalCoalPlants },
//         { label: 'GPW Points', value: totalGPWPoints },
//         { label: 'Fossil Fuel Points', value: fossilFuelCount },
//         { label: 'Cement IGP', value: cementIGPCount },
//         { label: 'Cement Africa', value: cementAfricaCount },
//         { label: 'Paper Pulp IGP', value: paperPulpIGPCount },
//         { label: 'Paper Pulp Africa', value: paperPulpAfricaCount },
//         { label: 'Steel IGP', value: steelIGPCount },
//         { label: 'Steel Africa', value: steelAfricaCount },
//         { label: 'Oil Gas Refineries', value: oilGasIGPCount },
//         { label: 'Plastic Waste', value: plasticWasteIGPCount },
//         { label: 'Solid Waste', value: solidWasteIGPCount }
//     ].filter(entry => entry.value > 0);

//     const countsLabels = countsData.map(entry => entry.label);
//     const countsValues = countsData.map(entry => entry.value);
//     const backgroundColors = countsLabels.map(label => layerColors[label]).map(c => c.replace('rgb', 'rgba').replace(')', ', 0.6)'));
//     const borderColors = countsLabels.map(label => layerColors[label]);

//     // Bar chart for counts
//     countsChart = new Chart(countsCtx, {
//         type: 'bar',
//         data: {
//             labels: countsLabels,
//             datasets: [{
//                 label: 'Counts',
//                 data: countsValues,
//                 backgroundColor: backgroundColors,
//                 borderColor: borderColors,
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: { beginAtZero: true }
//             },
//             plugins: {
//                 title: {
//                     display: true,
//                     text: 'Counts for Selected Layers',
//                     font: { size: 14, weight: 'bold' },
//                     padding: { top: 10, bottom: 20 }
//                 },
//                 legend: { display: false }
//             }
//         }
//     });
// }


// const layerColors = {
//     'coal': getCSSColor('--red'),
//     'coal_africa': getCSSColor('--red'),
//     'fossil': getCSSColor('--orange'),
//     'furnace_oil_IGP': getCSSColor('--blue'),
//     'steel_IGP': getCSSColor('--blue-t'),
//     'steel_africa': getCSSColor('--blue-t'),
//     'paper_pulp_IGP': getCSSColor('--pink-t'),
//     'paper_pulp_africa': getCSSColor('--pink-t'),
//     'cement_IGP': getCSSColor('--vivid-green-t'),
//     'cement_africa': getCSSColor('--vivid-green-t'),
//     'boilers': getCSSColor('--red-t'),
//     'solid_waste_IGP': getCSSColor('--orange'),
//     'gpw': getCSSColor('--light-blue')
// };

//BRICKKILNS.JS

// export function loadBrickKilnLayerPKhex(map) {
//     if (!map.getSource('brickKilnsPKHex')) {
//         showLoadingSpinner(); // Show the spinner while loading

//         // Fetch the brick kilns GeoJSON data and create a hexagonal grid
//         fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_PAK_coal.geojson')
//             .then(response => response.json())
//             .then(data => {
//                 // Get the bounding box of the points
//                 const bbox = turf.bbox(data);

//                 // Generate the hexagonal grid
//                 const hexGrid = turf.hexGrid(bbox, 15, { units: 'kilometers' }); // 10 km hexagon size

//                 // Count points within each hexagon
//                 hexGrid.features.forEach(hex => {
//                     const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
//                     hex.properties.pointCount = pointsWithinHex.features.length;
//                 });

//                 // Add the hex grid as a source
//                 map.addSource('brickKilnsPKHex', {
//                     type: 'geojson',
//                     data: hexGrid
//                 });

//                 // Add the hexagonal grid as a fill layer
//                 map.addLayer({
//                     'id': 'brick_kilns_PK_hex',
//                     'type': 'fill',
//                     'source': 'brickKilnsPKHex',
//                     'maxzoom': 12,
//                     layout: {
//                         visibility: 'visible'  // Make the grid visible immediately
//                     },
//                     'paint': {
//                         'fill-color': [
//                             'interpolate',
//                             ['linear'],
//                             ['get', 'pointCount'],
//                             0, 'rgba(255,255,178,0)',
//                             10, 'rgba(255,255,178,0.3)',
//                             20, 'rgb(254,229,132)',
//                             30, 'rgb(254,204,92)',
//                             50, 'rgb(253,174,64)',
//                             100, 'rgb(253,141,60)',
//                             150, 'rgb(252,78,42)',
//                             200, 'rgb(240,59,32)',
//                             250, 'rgb(220,30,30)',
//                             300, 'rgb(189,0,38)',
//                             350, 'rgb(140,0,30)',
//                             400, 'rgb(100,0,20)'
//                             ],
//                         'fill-opacity': 0.7,

//                     },
//                 });

//                 // Wait for the map to become idle, meaning all sources and tiles have been loaded
//                 map.on('idle', function () {
//                     if (map.getLayer('brickKilnsPKHex') && map.getSource('brickKilnsPKHex')) {
//                         hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
//                     }
//                 });

//                 if (!isAggregateToolEnabled()) {
//                     // Add a click event to display a popup with brick kiln density details
//                     map.on('click', 'brick_kilns_PK_hex', (e) => {
//                         if (!isAggregateToolEnabled()) {
//                             const properties = e.features[0].properties;

//                             // Prepare the popup content displaying only the density/count
//                             const popupContent = `
//                     <div class="popup-table">
//                         <h3>Brick Kiln Density / 15km</h3>
//                         <table>
//                             <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
//                         </table>
//                     </div>`;

//                             // Display the popup
//                             new mapboxgl.Popup()
//                                 .setLngLat(e.lngLat)
//                                 .setHTML(popupContent)
//                                 .addTo(map);
//                         }

//                     });

//                     // Change the cursor to pointer when hovering over the grid
//                     map.on('mouseenter', 'brick_kilns_PK_hex', () => {
//                         map.getCanvas().style.cursor = 'pointer';
//                     });

//                     // Reset the cursor when leaving the grid
//                     map.on('mouseleave', 'brick_kilns_PK_hex', () => {
//                         map.getCanvas().style.cursor = '';
//                     });
//                 }

//             })
//             .catch(error => {
//                 console.error('Error loading Brick Kiln Hex data for Pakistan:', error);
//                 hideLoadingSpinner(); // Hide the spinner if there is an error
//             });

//     } else {
//         map.setLayoutProperty('brick_kilns_PK_hex', 'visibility', 'visible');
//     }
// }


// export function loadBrickKilnLayerINDhex(map) {
//     if (!map.getSource('brickKilnsINDHex')) {
//         showLoadingSpinner();

//         fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_IND_coal.geojson')
//             .then(response => response.json())
//             .then(data => {
//                 const bbox = turf.bbox(data);

//                 const hexGrid = turf.hexGrid(bbox, 15, { units: 'kilometers' });

//                 hexGrid.features.forEach(hex => {
//                     const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
//                     hex.properties.pointCount = pointsWithinHex.features.length;
//                 });

//                 map.addSource('brickKilnsINDHex', {
//                     type: 'geojson',
//                     data: hexGrid
//                 });

//                 map.addLayer({
//                     'id': 'brick_kilns_IND_hex',
//                     'type': 'fill',
//                     'source': 'brickKilnsINDHex',
//                     'maxzoom': 12,
//                     layout: {
//                         visibility: 'visible' // Fix typo: should be 'visible'
//                     },
//                     'paint': {
//                         'fill-color': [
//                             'interpolate',
//                             ['linear'],
//                             ['get', 'pointCount'],
//                             0, 'rgba(255,255,178,0)',
//                             10, 'rgba(255,255,178,0.3)',
//                             20, 'rgb(254,229,132)',
//                             30, 'rgb(254,204,92)',
//                             50, 'rgb(253,174,64)',
//                             100, 'rgb(253,141,60)',
//                             150, 'rgb(252,78,42)',
//                             200, 'rgb(240,59,32)',
//                             250, 'rgb(220,30,30)',
//                             300, 'rgb(189,0,38)',
//                             350, 'rgb(140,0,30)',
//                             400, 'rgb(100,0,20)'
//                             ],
//                         'fill-opacity': 0.7,

//                     },
//                     layout: {
//                         visibility: 'visible'
//                     }
//                 });

//                 // Wait for the map to become idle, meaning all sources and tiles have been loaded
//                 map.on('idle', function () {
//                     if (map.getLayer('brick_kilns_IND_hex') && map.getSource('brickKilnsINDHex')) {
//                         hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
//                     }
//                 });

//                 if (!isAggregateToolEnabled()) {
//                     // Add popup click event
//                     map.on('click', 'brick_kilns_IND_hex', (e) => {
//                         if (!isAggregateToolEnabled()) {
//                             const properties = e.features[0].properties;
//                             const popupContent = `
//                             <div class="popup-table">
//                                 <h3>Brick Kiln Density / 15km</h3>
//                                 <table>
//                                     <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
//                                 </table>
//                             </div>`;

//                             new mapboxgl.Popup()
//                                 .setLngLat(e.lngLat)
//                                 .setHTML(popupContent)
//                                 .addTo(map);
//                         }

//                     });

//                     // Change cursor to pointer when hovering over the grid
//                     map.on('mouseenter', 'brick_kilns_IND_hex', () => {
//                         map.getCanvas().style.cursor = 'pointer';
//                     });

//                     map.on('mouseleave', 'brick_kilns_IND_hex', () => {
//                         map.getCanvas().style.cursor = '';
//                     });
//                 }



//             }).catch(error => {
//                 console.error('Error loading Brick Kiln Hex data for India:', error);
//                 hideLoadingSpinner();
//             });
//     } else {
//         map.setLayoutProperty('brick_kilns_IND_hex', 'visibility', 'visible');
//     }
// }

// export function loadBrickKilnLayerBANhex(map) {
//     if (!map.getSource('brickKilnsBANHex')) {
//         showLoadingSpinner();

//         fetch('https://assetdata-igp.s3.ap-southeast-1.amazonaws.com/Brick+Kilns/Brick_kilns_BAN_coal.geojson')
//             .then(response => response.json())
//             .then(data => {
//                 const bbox = turf.bbox(data);

//                 const hexGrid = turf.hexGrid(bbox, 15, { units: 'kilometers' });

//                 hexGrid.features.forEach(hex => {
//                     const pointsWithinHex = turf.pointsWithinPolygon(data, hex);
//                     hex.properties.pointCount = pointsWithinHex.features.length;
//                 });

//                 map.addSource('brickKilnsBANHex', {
//                     type: 'geojson',
//                     data: hexGrid
//                 });

//                 map.addLayer({
//                     'id': 'brick_kilns_BAN_hex',
//                     'type': 'fill',
//                     'source': 'brickKilnsBANHex',
//                     'maxzoom': 12,
//                     layout: {
//                         visibility: 'visible' // Fix typo: should be 'visible'
//                     },
//                     'paint': {
//                         'fill-color': [
//                             'interpolate',
//                             ['linear'],
//                             ['get', 'pointCount'],
//                             0, 'rgba(255,255,178,0)',
//                             10, 'rgba(255,255,178,0.3)',
//                             20, 'rgb(254,229,132)',
//                             30, 'rgb(254,204,92)',
//                             50, 'rgb(253,174,64)',
//                             100, 'rgb(253,141,60)',
//                             150, 'rgb(252,78,42)',
//                             200, 'rgb(240,59,32)',
//                             250, 'rgb(220,30,30)',
//                             300, 'rgb(189,0,38)',
//                             350, 'rgb(140,0,30)',
//                             400, 'rgb(100,0,20)'
//                             ],
//                         'fill-opacity': 0.9,

//                     },
//                     layout: {
//                         visibility: 'visible'
//                     }
//                 });
//                 // Wait for the map to become idle, meaning all sources and tiles have been loaded
//                 map.on('idle', function () {
//                     if (map.getLayer('brick_kilns_BAN_hex') && map.getSource('brickKilnsBANHex')) {
//                         hideLoadingSpinner();  // Hide the spinner once the grid is fully loaded
//                     }
//                 });

//                 if (!isAggregateToolEnabled()) {
//                     // Add popup click event
//                     map.on('click', 'brick_kilns_BAN_hex', (e) => {
//                         if (!isAggregateToolEnabled()) {
//                             const properties = e.features[0].properties;
//                             const popupContent = `
//                         <div class="popup-table">
//                             <h3>Brick Kiln Density / 15km</h3>
//                             <table>
//                                 <tr><th>Total Kilns: </th><td>${properties.pointCount}</td></tr>
//                             </table>
//                         </div>`;

//                             new mapboxgl.Popup()
//                                 .setLngLat(e.lngLat)
//                                 .setHTML(popupContent)
//                                 .addTo(map);
//                         }

//                     });

//                     map.on('mouseenter', 'brick_kilns_BAN_hex', () => {
//                         map.getCanvas().style.cursor = 'pointer';
//                     });

//                     map.on('mouseleave', 'brick_kilns_BAN_hex', () => {
//                         map.getCanvas().style.cursor = '';
//                     });
//                 }



//             }).catch(error => {
//                 console.error('Error loading Brick Kiln Hex data for Bangladesh:', error);
//                 hideLoadingSpinner();
//             });
//     } else {
//         map.setLayoutProperty('brick_kilns_BAN_hex', 'visibility', 'visible');
//     }
// }


//LAYERVISIBILITY.JS

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


//MAPOVERLAYCHARTS.JS

// // Global variables to store the last known pollutant data
// let lastPm10 = 0;
// let lastPm25 = 0;
// let lastSo2 = 0;
// let lastNo2 = 0;

// // Layers to monitor
// const pollutantLayers = [
//     'coal', 'fossil', 'gpw', 'BK_PK', 'BK_IND', 'BK_BAN', 'cement_IGP', 'oil_gas_IGP', 'paper_pulp_IGP', 'steel_IGP', 'solid_waste_IGP',
//     'coal_africa', 'cement_africa', 'paper_pulp_africa', 'steel_africa', 'brick_kilns_DRC', 'brick_kilns_GHA', 'brick_kilns_UGA', 'brick_kilns_NGA'
// ];

// export function initializeOverlayCharts(map) {
//     const collapseBtn = document.getElementById('collapseBtn');
//     const expandBtn = document.getElementById('expandBtn');
//     const chartContent = document.getElementById('chartContent');
//     const featuresDiv = document.getElementById('features');
//     const frequencySelect = document.getElementById('frequencySelect');
//     const hoverText = document.getElementById('hoverText');
//     const plantInfo = document.getElementById('plantInfo');

//     let dataFrequency = 'year';
//     let pollutantChart1, pollutantChart2;

//     // Collapse / Expand controls
//     chartContent.style.display = 'none';
//     collapseBtn.style.display = 'none';
//     expandBtn.style.display = 'block';
//     featuresDiv.style.width = '200px';
//     featuresDiv.style.padding = '5px';

//     collapseBtn.addEventListener('click', () => {
//         chartContent.style.display = 'none';
//         collapseBtn.style.display = 'none';
//         expandBtn.style.display = 'block';
//         featuresDiv.style.width = '200px';
//         featuresDiv.style.padding = '5px';
//     });

//     expandBtn.addEventListener('click', () => {
//         chartContent.style.display = 'block';
//         collapseBtn.style.display = 'block';
//         expandBtn.style.display = 'none';
//         featuresDiv.style.width = '400px';
//         featuresDiv.style.padding = '15px';
//     });


//     const layerNames = {
//         coal: 'Coal Plant',
//         fossil: 'Fossil Fuel Facility',
//         gpw: 'Population Source',
//         brick_kilns_PK: 'Brick Kilns (Pakistan)',
//         brick_kilns_IND: 'Brick Kilns (India)',
//         brick_kilns_BAN: 'Brick Kilns (Bangladesh)',
//         cement_IGP: 'Cement Plant',
//         oil_gas_IGP: 'Oil & Gas Facility',
//         paper_pulp_IGP: 'Paper Pulp Plant',
//         steel_IGP: 'Steel Plant',
//         solid_waste_IGP: 'Solid Waste Facility',
//         coal_africa: 'Coal Plant (Africa)',
//         cement_africa: 'Cement Plant (Africa)',
//         paper_pulp_africa: 'Paper Pulp (Africa)',
//         steel_africa: 'Steel Plant (Africa)',
//         brick_kilns_DRC: 'Brick Kilns (DRC)',
//         brick_kilns_GHA: 'Brick Kilns (Ghana)',
//         brick_kilns_UGA: 'Brick Kilns (Uganda)',
//         brick_kilns_NGA: 'Brick Kilns (Nigeria)'
//     };





//     // Convert yearly/day frequency
//     function getConvertedData(value) {
//         const num = Number(value);
//         return dataFrequency === 'day' ? (isNaN(num) ? 0 : num / 365) : (isNaN(num) ? 0 : num);
//     }

//     function updatePollutantCharts(pm10, pm25, so2, no2) {
//         const ctx1 = document.getElementById('pollutantChart1').getContext('2d');
//         const ctx2 = document.getElementById('pollutantChart2').getContext('2d');

//         if (pollutantChart1) pollutantChart1.destroy();
//         if (pollutantChart2) pollutantChart2.destroy();

//         pollutantChart1 = new Chart(ctx1, {
//             type: 'bar',
//             data: {
//                 labels: ['PM₁₀', 'PM₂.₅'],
//                 datasets: [{
//                     data: [getConvertedData(pm10), getConvertedData(pm25)],
//                     backgroundColor: ['rgba(75, 192, 192, 0.3)', 'rgba(54, 162, 235, 0.3)'],
//                     borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)'],
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 indexAxis: 'y',
//                 plugins: { legend: { display: false } },
//                 scales: {
//                     x: {
//                         beginAtZero: true,
//                         title: { display: true, text: `Tonnes per ${dataFrequency}` }
//                     }
//                 }
//             }
//         });

//         pollutantChart2 = new Chart(ctx2, {
//             type: 'bar',
//             data: {
//                 labels: ['SO₂', 'NO₂'],
//                 datasets: [{
//                     data: [getConvertedData(so2), getConvertedData(no2)],
//                     backgroundColor: ['rgba(255, 206, 86, 0.3)', 'rgba(255, 99, 132, 0.3)'],
//                     borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 indexAxis: 'y',
//                 plugins: { legend: { display: false } },
//                 scales: {
//                     x: {
//                         beginAtZero: true,
//                         title: { display: true, text: `Tonnes per ${dataFrequency}` }
//                     }
//                 }
//             }
//         });
//     }

//     frequencySelect.addEventListener('change', () => {
//         dataFrequency = frequencySelect.value;
//         updatePollutantCharts(lastPm10, lastPm25, lastSo2, lastNo2);
//     });

//     map.on('mousemove', (event) => {
//         let found = false;

//         for (const layerId of pollutantLayers) {
//             if (!map.getLayer(layerId)) continue;

//             const features = map.queryRenderedFeatures(event.point, { layers: [layerId] });
//             if (!features.length) continue;

//             const props = features[0].properties || {};
//             const hasPollution = ['pm10', 'pm25', 'so2', 'nox'].some(key => key in props);
  

//             const parseOrZero = (val) => isNaN(Number(val)) ? 0 : Number(val);

//             lastPm10 = parseOrZero(props.pm10);
//             lastPm25 = parseOrZero(props.pm25);
//             lastSo2  = parseOrZero(props.so2);
//             lastNo2  = parseOrZero(props.nox);



//             const name = props.name || props.NAME_3 || 'Unnamed';
//             const country = props.country || props.COUNTRY || '';

//             plantInfo.innerHTML = `<h3>${name}, ${country}</h3>`;
//             updatePollutantCharts(lastPm10, lastPm25, lastSo2, lastNo2);
//             hoverText.style.display = 'none';

//             // ✅ Set source title dynamically here
//             const layerTitle = layerNames[layerId] || 'Unknown Source';
//             const sourceTitle = document.getElementById('pollutantSourceTitle');
//             if (sourceTitle) sourceTitle.innerText = `Pollutants from ${layerTitle}`;

//             found = true;
//             break;
//         }

//         if (!found) {
//             hoverText.style.display = 'block';
//         }
//     });




//     // Initialize on DOM load
//     document.addEventListener('DOMContentLoaded', () => {
//         updatePollutantCharts(0, 0, 0, 0);
//         chartContent.style.display = 'none';
//         collapseBtn.style.display = 'none';
//         expandBtn.style.display = 'block';
//     });
// }

//INDEX.HTML

//  <!-- Heatmap Control Box
//       <div
//         id="heatmapBox"
//         style="
//           display: none;
//           position: absolute;
//           bottom: 100px;
//           right: 20px;
//           z-index: 100;
//           background: white;
//           padding: 15px;
//           border-radius: 8px;
//           box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
//         "
//       >
//         <button class="closeButton">&times;</button>
//         <label for="heatmapToggle">
//           <strong>Heatmap</strong>
//           <input type="checkbox" id="heatmapToggle" checked />
//         </label>
//         <div style="margin-top: 5px; display: flex; align-items: center">
//           <span style="font-size: 12px">Poor</span>
//           <div
//             style="
//               flex-grow: 1;
//               height: 10px;
//               background: linear-gradient(
//                 90deg,
//                 #7f0400 0%,
//                 #fa0f00 10.1%,
//                 #fa8c00 30.41%,
//                 #fdff00 49.98%,
//                 #83ce34 69.1%,
//                 #1a9e3a 100%
//               );
//               margin: 0 10px;
//             "
//           ></div>
//           <span style="font-size: 12px">Excellent</span>
//         </div>
//       </div> -->

// <!-- Population Grid
//             <div class="legend-section" id="legend-population" draggable="true">
//               <input
//                 id="togglepop"
//                 type="checkbox"
//                 data-layer="population"
//                 checked
//               />
//               <span>Population Grid</span> <br />
//               <span class="legend-subunit">Count / 800 m<sup>2</sup></span>

//               <div class="row colors"></div>
//               <div class="row labels">
//                 <div class="label">0</div>
//                 <div class="label"></div>
//                 <div class="label"></div>
//                 <div class="label"></div>
//                 <div class="label">17192</div>
//               </div>
//             </div> -->

//             <!-- Pollutant Decay
//             <div
//               class="legend-section"
//               id="legend-populationDecay"
//               draggable="true"
//             >
//               <input
//                 id="toggledecay"
//                 type="checkbox"
//                 data-layer="population-decay"
//               />
//               <span>Pollutant Decay</span><br />
//               <div class="rowdecay colorsdecay"></div>
//               <div class="rowdecay labelsdecay">
//                 <div class="labeldecay">Min</div>
//                 <div class="labeldecay"></div>
//                 <div class="labeldecay"></div>
//                 <div class="labeldecay"></div>
//                 <div class="labeldecay">Max</div>
//               </div>
//             </div>  -->

// <!-------------------------------------------------------------- Hover Charts Display ---------------------------------------------------------->
//       <!-- <div class="map-overlay" id="features">
//         <h2>
//           <i class="fas fa-chart-bar"></i>
//           <span id="pollutantSourceTitle">Pollutants</span>
//           <button id="collapseBtn" class="collapse-btn">-</button>
//         </h2> -->

//         <!-- Dropdown for selecting Per Year / Per Day -->
//         <!-- <div id="dataFrequency">
//           <select id="frequencySelect">
//             <option value="year">Per Year</option>
//             <option value="day">Per Day</option>
//           </select>
//         </div> -->

//         <!-- <div id="chartContent"> -->
//           <!-- Plant Name and Country Info -->
//           <!-- <div id="plantInfo"></div> -->

//           <!-- Canvas for the two charts -->
//           <!-- <canvas id="pollutantChart1" width="400"></canvas>
//           <canvas id="pollutantChart2" width="400"></canvas> -->

//           <!-- Hover text -->
//           <!-- <p id="hoverText">
//             Hover over a Data and Check Details about Pollutants
//           </p>
//         </div> -->

//         <!-- Expand Button (Initially hidden) -->
//         <!-- <button id="expandBtn" class="expand-btn" style="display: none">
//           Expand
//         </button>
//       </div>  -->