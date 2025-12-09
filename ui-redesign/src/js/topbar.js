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

// PM2.5/WHO Dropdown Toggle
const pm25MainButton = document.getElementById('pm25MainButton');
const pm25DropdownMenu = document.getElementById('pm25DropdownMenu');
const pm25Option = document.getElementById('buttonPM25Data');
const whoOption = document.getElementById('buttonWHO25Data');

if (pm25MainButton && pm25DropdownMenu && pm25Option && whoOption) {
  // Toggle dropdown when main button is clicked
  pm25MainButton.addEventListener('click', (e) => {
    e.stopPropagation();
    pm25DropdownMenu.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!pm25MainButton.contains(e.target) && !pm25DropdownMenu.contains(e.target)) {
      pm25DropdownMenu.classList.add('hidden');
    }
  });

  // Handle mutual exclusion: only one option can be active at a time
  const menuItems = [pm25Option, whoOption];
  
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      menuItems.forEach(i => i.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');
      // Close dropdown
      pm25DropdownMenu.classList.add('hidden');
    });
  });
}
