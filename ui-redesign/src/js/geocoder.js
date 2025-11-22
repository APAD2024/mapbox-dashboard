// Initialize Geocoder

let mapboxToken = 'pk.eyJ1IjoiYXBhZC13b3JsZCIsImEiOiJjbHoyc2d5b2EzNXk1MmtzaHFrdWprZ2swIn0.Z2onslEOxm7o0lbD-1WNtA';
export function initializeGeocoder(map) {
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search for places'
    });

    geocoder.on('result', (e) => {
  const coordinates = e.result.center;
  const randomBearing = Math.random() * 360; // random rotation
  map.flyTo({
    center: coordinates,
    zoom: 8,
    bearing: randomBearing,
    pitch: 45,
    speed: 0.4
  });
});


    // Attach the geocoder to the #geocoder div in the top bar
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
}