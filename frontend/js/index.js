(() => {
  'use strict';

  const mainContent = document.getElementById('main-content');

  window.onload = () => {
    api.getFavColour((colour) => {
      mainContent.innerHTML = colour;
    });
  };
})();
