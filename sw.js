const filesToCache = [
    '/index.html',
    '/assets/app.js'
];

const assets = 'pages-cache-v1'

const uploads = () => {
    return caches.open(assets).then((cache) => fetch('/uploads').then((response) => {
        cache.add('/uploads')
        return response.json()
    }))
};

addEventListener('install', function (event) {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(caches.open(assets).then(cache => cache.addAll(filesToCache)));
});

addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(assets)
            .then((cache) => {
                if (event.request.method !== 'GET') {
                    return fetch(event.request)
                }
                return cache.match(event.request).then(function (response) {
                    return response ||
                        fetch(event.request)
                            .then((response) => {
                                cache.put(event.request, response.clone());
                                return response;
                            });
                })
            })
    );
});

addEventListener('message', function (event) {
    uploads()
        .then(uploads => caches.keys().then(keys => ({uploads, keys})))
        .then(() => event.ports[0].postMessage('SUCCESS'))
});