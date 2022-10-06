//* we keep the app prefix, version and full name in separate vars incase we change it 
//* we don't have to rewrite a lot of code just 3 vars, same for files to cache 
const APP_PREFIX = 'FoodFest-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  './index.html',
  './events.html',
  './tickets.html',
  './schedule.html',
  './assets/css/style.css',
  './assets/css/bootstrap.css',
  './assets/css/tickets.css',
  './dist/app.bundle.js',
  './dist/events.bundle.js',
  './dist/tickets.bundle.js',
  './dist/schedule.bundle.js'
];

//*the self is referring to the service worker
self.addEventListener('install', function(e) {
  e.waitUntil(
    //*this creates a new cache and adds all of the files we want to the cache
    caches.open(CACHE_NAME).then((Cache) => {
      console.log('installing cache : ' + CACHE_NAME);
      return Cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    //*.keys()= returns a arr of all caches 
    caches.keys().then(function(keyList) {
      //* the var↓ holds arr but it filters out all caches that don't have the same name as the APP_PREFIX
      let cacheKeepList = keyList.filter(function(key) {
        return key.indexOf(APP_PREFIX);
      });

      //* we then push the CACHE_NAME to the cache arr(cacheKeepList)
      cacheKeepList.push(CACHE_NAME);

      //*we take the key list and we use the .map to target the last(basically the only one that can exist)
      //*and we use a console log to alert if and which cache is being deleted 
      return Promise.all(keyList.map(function(key, i) {
        if (!cacheKeepList.indexOf(key) === -1) {
          return;
        }

        console.log('deleting cache : ' + keyList[i]);
        return caches.delete(keyList[i]);
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    // the .match() takes the request and searches the cache to see if it matches
    caches.match(e.request).then(function(request) {
      if (request) {
        // if the request matches with the cache it will return the the cached version of the files requested
        console.log('respond with cache : ' + e.request.url);
        return request;
      } else {
        //if not the else statement will try to fetch it from the server and return it
        console.log('file is not cached, fetching : ' + e.request.url);
        return fetch(e.request);
      }
    })
  );
});