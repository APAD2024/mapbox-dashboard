import { loadGroupLayers, loadSymbolLayer  } from './layers.js';
import { initializeGeocoder } from './geocoder.js';
import { initializeBasemapMenu } from './basemapMenu.js';
import { initializeAreaChange } from './areaChange.js';
import { initAggregateTool } from './aggregateTool.js';

import { initializeLayerVisibilityControls } from './layerVisibility.js';
import { initializeLegend } from './legend.js';


import { initializeOverlayCharts } from './mapOverlayCharts.js';

import { initializeFilters } from './filters.js';


import { initializeADM3FilterPanel } from './adm3Filters.js';


// -----------------------------------------------------------MAP INITIALIZATION-----------------------------------------------------------

mapboxgl.accessToken = 'pk.eyJ1IjoiYXBhZC13b3JsZCIsImEiOiJjbHoyc2d5b2EzNXk1MmtzaHFrdWprZ2swIn0.Z2onslEOxm7o0lbD-1WNtA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: [78.8181577, 28.7650135], // starting position
    zoom: 5 // starting zoom
});

// Add navigation control (zoom and rotation) to the top-right corner
map.addControl(new mapboxgl.NavigationControl(), 'top-right');


// ---------------------------------------------------------------LAYER LOADING -------------------------------------------------------------
// Ensure map is initialized
map.on('load', () => {
    loadGroupLayers(map);
    loadSymbolLayer(map);
    initAggregateTool(map);
    initializeGeocoder(map);
});


// ----------------------------------------------------------------BASEMAP MENU-----------------------------------------------------------

map.on('load', () => {
    initializeBasemapMenu(map);
});



// -----------------------------------------------------------LAYERS VISIBILITY SETTINGS-------------------------------------------------------

map.on('load', () => {
    initializeLayerVisibilityControls(map);
});

// ----------------------------------------------------------------LEGEND-----------------------------------------------------------

map.on('load', () => {
    initializeLegend(map);
});


map.on('load', () => {
    initializeADM3FilterPanel(map);
});

// -----------------------------------------------------------AREA CHANGE-----------------------------------------------------------
initializeAreaChange(map);


// ----------------------------------------------------------- MAP OVERLAY CHARTS-------------------------------------------------------------

map.on('load', () => {
    initializeOverlayCharts(map);
});


// --------------------------------------------------------POLLUTANT FILETRS-------------------------------------------------------
map.on('load', () => {
    initializeFilters(map);
});


