// Initialize Geocoder

let mapboxToken = 'pk.eyJ1IjoiYXBhZC13b3JsZCIsImEiOiJjbHoyc2d5b2EzNXk1MmtzaHFrdWprZ2swIn0.Z2onslEOxm7o0lbD-1WNtA';
export function initializeGeocoder(map) {
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxToken,
        mapboxgl: mapboxgl,
        marker: true,
        placeholder: 'Search for places'
    });

    // Attach the geocoder to the #geocoder div in the top bar
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
}