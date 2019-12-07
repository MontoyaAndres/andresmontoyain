/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "bundle.css",
    "revision": "1b04175c7f4840e4b307422ef2a0642c"
  },
  {
    "url": "bundle.js",
    "revision": "6ebb542cdac8f4c0f154950a560979d5"
  },
  {
    "url": "index.html",
    "revision": "ed55c6f3aa5dc94781caa73fc6b70e81"
  },
  {
    "url": "init.js",
    "revision": "2827a8ff74a63e6f562341bc209241b3"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/Primer\/11.0.0\/build.css/, new workbox.strategies.NetworkFirst({ "cacheName":"https-calls","networkTimeoutSeconds":15, plugins: [new workbox.expiration.Plugin({ maxEntries: 150, maxAgeSeconds: 2592000000, purgeOnQuotaError: false }), new workbox.cacheableResponse.Plugin({ statuses: [ 0, 200 ] })] }), 'GET');
workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|svg|gif)$/, new workbox.strategies.CacheFirst({ "cacheName":"image-cache", plugins: [new workbox.expiration.Plugin({ maxEntries: 150, maxAgeSeconds: 864000000, purgeOnQuotaError: false }), new workbox.cacheableResponse.Plugin({ statuses: [ 0, 200 ] })] }), 'GET');
