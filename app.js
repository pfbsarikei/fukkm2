const GAS_URL = 'https://script.google.com/macros/s/AKfycbzzoBAlQ38wkelKu8gtA-FIJzllzPgippgHR1z2fgDgUJ1SPm_NEsJzHUgU3PBS-i6c/exec';
const DB_NAME = 'DrugDB';
const STORE_NAME = 'drugs';

// Open IndexedDB
let db;
const request = indexedDB.open(DB_NAME, 1);

// Setup database schema
request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "Generic Name" });
    }
};

// Handle database open success
request.onsuccess = function (event) {
    db = event.target.result;
    loadOfflineData();  // Try loading offline data first
    fetchData();  // Fetch new data from GAS
};

// Handle errors
request.onerror = function (event) {
    console.error('IndexedDB Error:', event.target.error);
};

// Save data to IndexedDB
function saveToIndexedDB(data) {
    if (!db) return;
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear(); // Clear old data
    data.forEach(item => store.put(item));
}

// Load data from IndexedDB when offline
function loadOfflineData() {
    if (!db) return;
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function () {
        if (request.result.length > 0) {
            console.log('Loaded from IndexedDB:', request.result);
        } else {
            console.log('No offline data found.');
        }
    };
}

// Fetch online data and update IndexedDB
async function fetchData() {
    try {
        let response = await fetch(GAS_URL);
        let data = await response.json();
        saveToIndexedDB(data); // Store in IndexedDB
        console.log('Data updated from online source.');
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

