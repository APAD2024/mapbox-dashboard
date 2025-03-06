export function initializeAreaChange(map) {
    const africaCenter = [20.0, 5.0];  // Longitude, Latitude for Africa
    const asiaCenter = [78.8181577, 28.7650135];  // Longitude, Latitude for South Asia
    const zoomLevel = 4;  // Common zoom level for both regions

    const areaChangeButton = document.getElementById('areaChange');

    if (!areaChangeButton) {
        console.error("Area change button (#areaChange) not found.");
        return;
    }

    // Add event listener for the area change button
    areaChangeButton.addEventListener('click', () => {
        const currentCenter = map.getCenter();

        // Check if the map is currently centered around Africa or Asia
        if (Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5) {
            // If the map is in Africa, shift to Asia (IGP Region)
            map.flyTo({
                center: asiaCenter,
                zoom: zoomLevel,
                essential: true
            });

            // Change the icon and title to Africa
            areaChangeButton.innerHTML = '<i class="fas fa-globe-asia"></i>';
            areaChangeButton.setAttribute('title', 'Move to Africa');

            // Show IGP Region legend and hide Africa Region legend
            document.querySelector('.collapsible-content.igp').style.display = 'block';
            document.querySelector('.collapsible-content.africa').style.display = 'none';
        } else {
            // If the map is in Asia (IGP Region), shift to Africa
            map.flyTo({
                center: africaCenter,
                zoom: zoomLevel,
                essential: true
            });

            // Change the icon and title to Asia
            areaChangeButton.innerHTML = '<i class="fas fa-globe-africa"></i>';
            areaChangeButton.setAttribute('title', 'Move to Asia');

            // Show Africa Region legend and hide IGP Region legend
            document.querySelector('.collapsible-content.africa').style.display = 'block';
            document.querySelector('.collapsible-content.igp').style.display = 'none';
        }
    });

    // Initialize the correct legend visibility on page load
    document.addEventListener('DOMContentLoaded', () => {
        const currentCenter = map.getCenter();

        if (Math.abs(currentCenter.lng - africaCenter[0]) < 5 && Math.abs(currentCenter.lat - africaCenter[1]) < 5) {
            // Map starts in Africa
            document.querySelector('.collapsible-content.africa').style.display = 'block';
            document.querySelector('.collapsible-content.igp').style.display = 'none';
        } else {
            // Map starts in Asia (IGP Region)
            document.querySelector('.collapsible-content.igp').style.display = 'block';
            document.querySelector('.collapsible-content.africa').style.display = 'none';
        }
    });
}
