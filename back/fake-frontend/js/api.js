const api = (function() {
  'use strict';

  const module = {};

  module.getFavColour = (callback) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.error(`[${xhr.status}] ${xhr.responseText}`);
      } else {
        callback(xhr.responseText);
      }
    };

    xhr.open('POST', '/graphql', true);

    const currUser = 'James';
    const query = `query currUsrFavCol($currUser: String) {favColour(user: $currUser)}`;

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      query,
      variables: {currUser}
    }));
  };

  return module;
})();
