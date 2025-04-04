export function initializeHeatmapControls(map) {
    const heatmapBox = document.getElementById('heatmapBox');
    const heatmapToggle = document.getElementById('heatmapToggle');


    document.querySelector('#heatmapBox .closeButton').addEventListener('click', () => {
        document.getElementById('heatmapBox').style.display = 'none';
    });
    
    if (!heatmapBox || !heatmapToggle) {
        console.error("🚨 Heatmap UI elements not found!");
        return;
    }

    // ✅ Function to toggle heatmap layer visibility
    function updateHeatmapVisibility() {
        if (map.getLayer('google-air-quality')) {
            const visibility = heatmapToggle.checked ? 'visible' : 'none';
            map.setLayoutProperty('google-air-quality', 'visibility', visibility);
            console.log(`🔄 Heatmap toggled: ${visibility}`);
        } else {
            console.warn("⚠️ Google Air Quality Layer not found.");
        }
    }

    // ✅ Toggle Heatmap when checkbox is clicked
    heatmapToggle.addEventListener('change', updateHeatmapVisibility);

    // ✅ Show/Hide Heatmap Control Box when Google Air Quality is selected
    function toggleHeatmapUI(show) {
        heatmapBox.style.display = show ? "block" : "none";
    }

    // ✅ Listen for Basemap Changes
    document.querySelectorAll('#menu input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            const selectedBasemap = input.value;

            if (selectedBasemap === 'google-air-quality') {
                console.log("✅ Showing Heatmap Box");
                toggleHeatmapUI(true);
            } else {
                console.log("❌ Hiding Heatmap Box");
                toggleHeatmapUI(false);
            }
        });
    });

    // ✅ Ensure Heatmap Toggle Syncs with Map Load
    map.on('style.load', () => {
        if (map.getLayer('google-air-quality')) {
            heatmapToggle.checked = map.getLayoutProperty('google-air-quality', 'visibility') === 'visible';
        }
    });
}
