const DB_NAME = "DrugInfoDB";
const DB_VERSION = 1;
const STORE_NAME = "drugs";

// Open IndexedDB
let db;
const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "genericName" }); // Make sure this store exists
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("IndexedDB opened successfully.");
    fetchData(); // Fetch data from GAS and store it
};

request.onerror = function(event) {
    console.error("IndexedDB error:", event.target.errorCode);
};

// Fetch data from GAS and store it in IndexedDB
async function fetchData() {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzzoBAlQ38wkelKu8gtA-FIJzllzPgippgHR1z2fgDgUJ1SPm_NEsJzHUgU3PBS-i6c/exec';

    try {
        let response = await fetch(GAS_URL);
        let data = await response.json();

        // Store data in IndexedDB
        let transaction = db.transaction(STORE_NAME, "readwrite");
        let store = transaction.objectStore(STORE_NAME);
        store.clear(); // Clear old data before adding new data

        data.forEach(item => {
            store.put(item);
        });

        console.log("Data successfully stored in IndexedDB.");
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Load data from IndexedDB for offline use
function loadOfflineData() {
    if (!db) {
        console.error("Database is not initialized yet.");
        return;
    }

    let transaction = db.transaction(STORE_NAME, "readonly");
    let store = transaction.objectStore(STORE_NAME);
    let request = store.getAll();

    request.onsuccess = function(event) {
        let offlineData = event.target.result;
        console.log("Loaded offline data:", offlineData);
    };

    request.onerror = function(event) {
        console.error("Error loading offline data:", event.target.error);
    };
}




