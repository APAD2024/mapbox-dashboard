
// Function to show the loading spinner
export function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Function to hide the loading spinner
export function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

export function closePopups() {
    const popups = document.getElementsByClassName('mapboxgl-popup');
    for (let i = 0; i < popups.length; i++) {
        popups[i].remove();
    }
}



