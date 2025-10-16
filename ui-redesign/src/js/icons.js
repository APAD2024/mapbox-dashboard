export function loadIcons(map) {
  const icons = [
    { name: "cross-coal-icon", url: "/src/assets/cross_coal.png" },
  ];

  return Promise.all(
    icons.map(icon =>
      new Promise((resolve, reject) => {
        map.loadImage(icon.url, (error, image) => {
          if (error) return reject(error);
          if (!map.hasImage(icon.name)) {
            map.addImage(icon.name, image);
          }
          resolve();
        });
      })
    )
  );
}



