

 mapboxgl.accessToken = 'pk.eyJ1IjoiYXBhZC13b3JsZCIsImEiOiJjbHoyc2d5b2EzNXk1MmtzaHFrdWprZ2swIn0.Z2onslEOxm7o0lbD-1WNtA';

export const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [78.8181577, 28.7650135], // starting position
    zoom: 4 // starting zoom
});

// Add navigation control (zoom and rotation) to the top-right corner
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

