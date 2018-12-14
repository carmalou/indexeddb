self.oninstall = function(event) {
        // this function runs on install
        // first it opens/defines a cache for our files to live
        // next it adds those files to the cache
        // last it catches any errors
    
        // first we open/define our cache
        caches.open('indexedDBSample')
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
    console.log('i am sync');
    console.log('event-tag == ', event.tag);
    console.log(new Date());
    event.waitUntil(sendToServer().catch((err) => {
        if(event.lastChance) {
            console.log('LAST CHANCE');
        }
    }));
});

function accessIndexedDB() {
    var myDB = indexedDB.open('testEmailDB');

    return new Promise(function (resolve, reject) {
        myDB.onsuccess = function(event) {
            var request = this.result.transaction("emailObjStore").objectStore("emailObjStore").getAll();
            
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onerror = function (err) {
                reject(err);
            };
        };

        myDB.onerror = function (err) {
            reject(err);
        };
    });
}

function sendToServer() {
    return accessIndexedDB()
        .then(function (data) {
            return Promise.all(data.map(function(response) {
                return fetch('https://www.mocky.io/v2/5b568fb131000053004d1df2', {
                        method: 'POST',
                        data: response
                    })
                    .then(function(rez2) {
                        return rez2.json();
                    })
                    .then(function(rez2) {
                        console.log('sync response: ', rez2);
                        return rez2;
                    })
            }))
            .then(function(response) {
                console.log('arr of fetches: ', response);
            })
        })
}
