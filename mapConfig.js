// ------------------- mapConfig.js -------------------
export function initializeMap() {
    mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [78.8181577, 28.7650135],
        zoom: 4
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    return map;
}