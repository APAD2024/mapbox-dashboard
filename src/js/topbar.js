const menuButton = document.getElementById('menuButton');
const menuList = document.getElementById('menuList');

// Toggle menu visibility
menuButton.addEventListener('click', () => {
  menuList.classList.toggle('hidden');
});

// Close the menu when clicking outside
document.addEventListener('click', (e) => {
  if (!menuButton.contains(e.target) && !menuList.contains(e.target)) {
    menuList.classList.add('hidden');
  }
});

// Handle option clicks
menuList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('Selected:', e.target.dataset.value);
    menuList.classList.add('hidden');
    // You can add any action here when an option is clicked
  }
});
