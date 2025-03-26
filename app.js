const GAS_URL = 'https://script.google.com/macros/s/AKfycbzzoBAlQ38wkelKu8gtA-FIJzllzPgippgHR1z2fgDgUJ1SPm_NEsJzHUgU3PBS-i6c/exec';
const DB_NAME = 'DrugDB';
const STORE_NAME = 'drugs';

// Open IndexedDB with version 2 (force schema update)
let db;
const request = indexedDB.open(DB_NAME, 2);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    console.log("🔄 onupgradeneeded triggered, updating database...");

    if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
        console.log("✅ Deleted old object store");
    }

    db.createObjectStore(STORE_NAME, { keyPath: "Generic Name" });
    console.log("✅ Created new object store");
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('✅ IndexedDB Opened Successfully');

    loadOfflineData();  // Try loading offline data
    fetchData();  // Fetch new data from GAS
};

request.onerror = function (event) {
    console.error('❌ IndexedDB Error:', event.target.error);
};

// Save data to IndexedDB
function saveToIndexedDB(data) {
    if (!db) {
        console.error('❌ Database not initialized');
        return;
    }

    console.log("💾 Saving data to IndexedDB...");
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.clear(); // Remove old data first
    data.forEach(item => store.put(item));
    
    console.log('✅ Data saved to IndexedDB:', data);
}

// Load data from IndexedDB
function loadOfflineData() {
    if (!db) {
        console.error('❌ Database not initialized');
        return;
    }

    console.log("📦 Loading data from IndexedDB...");
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

    request.onerror = function () {
        console.error('❌ Error loading from IndexedDB');
    };
}

// Fetch new data and store in IndexedDB
async function fetchData() {
    console.log("🌐 Fetching data from GAS...");
    
    try {
        let response = await fetch(GAS_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        let data = await response.json();
        console.log("✅ Data fetched from GAS:", data);

        saveToIndexedDB(data); // Store in IndexedDB
    } catch (error) {
        console.error('❌ Error fetching data:', error);
    }
}



