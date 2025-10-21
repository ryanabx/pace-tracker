/// <reference lib="webworker" />
/// <reference types="vite/client" />

declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching'

// self.__WB_MANIFEST is a placeholder that Vite PWA plugin will replace
// with the list of files to precache.
precacheAndRoute(self.__WB_MANIFEST);

// You can add other service worker logic here, like push notifications,
// background sync, etc.