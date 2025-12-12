export default defineNuxtPlugin(() => {
    if (process.client) {
      window.smartlook ||
        (function (d) {
          var o = (window.smartlook = function () {
            o.api.push(arguments);
          });
          var h = d.getElementsByTagName('head')[0];
          var c = d.createElement('script');
          o.api = new Array();
          c.async = true;
          c.type = 'text/javascript';
          c.charset = 'utf-8';
          c.src = 'https://web-sdk.smartlook.com/recorder.js';
          h.appendChild(c);
        })(document);
  
      window.smartlook('init', '1e0ca209c444712450d38ac8c1df6f1feb17a111', {
        region: 'eu',
      });
    }
  });