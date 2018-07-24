console.log("Welcome to my IndexedDB proof of concept!");
  console.log("First, type some data into the fields.");
  console.log('\n');

var myNameInput = document.getElementById('myNameInput');
var myEmailInput = document.getElementById('myEmailInput');
var submitBtn = document.getElementById('submitBtn');

function newUpDB() {
  // second param is version of the db. increment this in order to trigger the onupgradeneeded func
  var myDB = window.indexedDB.open("testEmailDB", 1);
  
  // schema changes can only be run from this func
  myDB.onupgradeneeded = function(event) {
  	var db = event.target.result;
    // may need to verify if obj store already exists, per "Failed to execute 'createObjectStore' on 'IDBDatabase': An object store with the specified name already exists. at IDBOpenDBRequest.myDB.onupgradeneeded"
  	var myObjStore = db.createObjectStore("emailObjStore", {autoIncrement: true});
    myObjStore.createIndex("name", "name", {unique: false});
    myObjStore.createIndex("email", "email", {unique: true});
    myObjStore.createIndex("dateAdded", "dateAdded", {unique: true});
  }
}

function submitData() {
  event.preventDefault();
  // be careful of only using navigator.onLine. Some browsers will return true
  // if the user is connected to a local network, but not the internet
  // check this out for an additional solution: <link>
	if(!navigator.onLine) {
      cacheData();
    } else {
    	// any logic for fetch or HTTP reqs would go here since you would be online
    }
}

function cacheData() {
	var tmpObj = {
      name: myNameInput.value,
      email: myEmailInput.value,
      dateAdded: new Date()
    };

    var myDB = window.indexedDB.open('testEmailDB');

    myDB.onsuccess = function(event) {
      var objStore = this.result.transaction('emailObjStore', 'readwrite').objectStore('emailObjStore');
      objStore.add(tmpObj);
    }
}

function getData() {
	var myDB = window.indexedDB.open('testEmailDB');
  
  myDB.onsuccess = function(event) {
  	this.result.transaction("emailObjStore").objectStore("emailObjStore").getAll().onsuccess = function(event) {
  		console.log(event.target.result);
		};
  }
}

function deleteData() {
  var myDB = window.indexedDB.open('testEmailDB');

  myDB.onsuccess = function(event) {
    this.result.transaction("emailObjStore", 'readwrite').objectStore("emailObjStore").clear().onsuccess = function(event) {
      console.log("clearing complete!");
    };
  }
}

function afterDataTyped() {
  console.log('Now that you\'ve typed some data, try turning off your internet connection.');
  console.log('NOTE: If you are connected to an internal, local network you may see different results.');
  console.log('If that is the case, you\'ll need to click the submit button, followed by the fetch data button.');
  console.log('\n');
}

newUpDB();
submitBtn.addEventListener('click', submitData);
document.getElementById('fetch-data').addEventListener('click', getData);
document.getElementById('delete-data').addEventListener('click', deleteData);
myEmailInput.addEventListener('blur', afterDataTyped);

window.addEventListener('offline', function(event) {
	// if we lose connection, we can go ahead and cache the data
  cacheData();
  console.log('You\'ve lost your internet connection! So we\'ve cached your data.');
  console.log('Now try turning your internet back on.');
  console.log('\n');
});

// window.addEventListener('online', function(event) {
// 	// if we regain connection, we can go ahead and retrieve the data
//   getData();
//   console.log('You\'ve regained your internet connection! So we\'ve retrieved your data.');
//   console.log('Here is your data!');
// });

if(navigator.serviceWorker) {
  navigator.serviceWorker.register('./serviceworker.js')
  .then(registration => navigator.serviceWorker.ready)
  .then(function(registration) {
    document.getElementById('submitBtn').addEventListener('click', () => {
      registration.sync.register('test-sync').then(() => {
        console.log('Sync registered!');
      });
    });
  });
}