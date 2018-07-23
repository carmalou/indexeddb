self.oninstall = function(event) {
    self.oninstall = function(event) {
        // this function runs on install
        // first it opens/defines a cache for our files to live
        // next it adds those files to the cache
        // last it catches any errors
    
        var version = '1.0.0';
        var cacheName = 'ThunderplainsCountdown' + version;
    
        // first we open/define our cache
        caches.open(cacheName)
        .then(function(cache) {
            cache.addAll([
                '/',
                'index.html',
                'index.js'
            ])
            .catch(function(err) {
                console.log('Files not added ', err);
            })
        })
        .catch(function(err) {
            console.log('Err: ', err);
        })
    }
}

self.addEventListener('sync', function(event) {
    console.log('sync event!');
    console.log(event);
    console.log();
})

function accessIndexedDB() {
    var myDB = indexedDB.open('testEmailDB');

    console.log('myDB from accessIndexedDB ', myDB);

    myDB.onsuccess = function(event) {
        this.result.transaction("emailObjStore").objectStore("emailObjStore").getAll().onsuccess = function(event) {
            console.log(event.target.result);
            return event.target.result;
        };
    }
}