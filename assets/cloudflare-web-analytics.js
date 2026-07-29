/*
 * Cloudflare Web Analytics loader.
 *
 * Setup: paste the site token from Cloudflare Web Analytics below. The token
 * identifies this public website and is not an API key or account secret.
 * Leave the value empty until the Cloudflare site has been created.
 */
(function () {
  'use strict';

  var SITE_TOKEN = 'f7624e400e4e4698a83b4a34753e715c';

  if (!SITE_TOKEN) {
    return;
  }

  var beacon = document.createElement('script');
  beacon.defer = true;
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: SITE_TOKEN }));
  document.head.appendChild(beacon);
}());
