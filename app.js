const GAS_URL = 'https://script.google.com/macros/s/AKfycbzzoBAlQ38wkelKu8gtA-FIJzllzPgippgHR1z2fgDgUJ1SPm_NEsJzHUgU3PBS-i6c/exec';
const DB_NAME = 'DrugDB';
const STORE_NAME = 'drugs';

// Open IndexedDB with version 2 (force schema update)
let db;
const request = indexedDB.open(DB_NAME, 2);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Delete old store if it exists (to ensure a fresh start)
    if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
    }

    // Create new object store
    db.createObjectStore(STORE_NAME, { keyPath: "Generic Name" });
    console.log('✅ Object store created');
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('✅ IndexedDB Opened Successfully');

    loadOfflineData();  // Load offline data first
    fetchData();  // Fetch new data from GAS
};

request.onerror = function (event) {
    console.error('❌ IndexedDB Error:', event.target.error);
};

// Save data to IndexedDB
function saveToIndexedDB(data) {
    if (!db) return console.error('❌ Database not initialized');
    
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.clear(); // Remove old data
    data.forEach(item => store.put(item));
    
    console.log('✅ Data saved to IndexedDB');
}

// Load data from IndexedDB
function loadOfflineData() {
    if (!db) return console.error('❌ Database not initialized');

    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function () {
        if (request.result.length > 0) {
            console.log('✅ Loaded from IndexedDB:', request.result);
        } else {
            console.log('⚠️ No offline data found.');
        }
    };
}

// Fetch new data and store in IndexedDB
async function fetchData() {
    try {
        let response = await fetch(GAS_URL);
        let data = await response.json();
        
        saveToIndexedDB(data); // Store in IndexedDB
        console.log('✅ Data updated from online source.');
    } catch (error) {
        console.error('❌ Error fetching data:', error);
    }
}


