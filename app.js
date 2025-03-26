const GAS_URL = 'https://script.google.com/macros/s/AKfycbz_NGOcXVeWDEWVswLCgZ47ylOgnCwrRnFdeaYGEaIk_Ij5pIaEIUO0NbUt4bYy-Pmy/exec';  // Replace with your actual Web App URL
let drugData = [];
let dropdown = document.getElementById('dropdown');
let searchBar = document.getElementById('searchBar');
let resultsDiv = document.getElementById('results');

// Open IndexedDB
let db;
let request = indexedDB.open('DrugDB', 1);
request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('drugs', { keyPath: 'GenericName' });
};
request.onsuccess = function(event) {
    db = event.target.result;
    loadOfflineData();
};

// Fetch data from Google Apps Script and update IndexedDB
async function fetchData() {
    try {
        let response = await fetch(GAS_URL);
        drugData = await response.json();
        saveToIndexedDB(drugData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Save data to IndexedDB
function saveToIndexedDB(data) {
    let transaction = db.transaction(['drugs'], 'readwrite');
    let store = transaction.objectStore('drugs');
    store.clear(); // Clear old data
    data.forEach(drug => store.put(drug));
}

// Load data from IndexedDB if offline
function loadOfflineData() {
    let transaction = db.transaction(['drugs'], 'readonly');
    let store = transaction.objectStore('drugs');
    let request = store.getAll();

    request.onsuccess = function() {
        if (request.result.length > 0) {
            drugData = request.result;
        }
    };
}

// Filter and show dropdown list
function filterResults() {
    let query = searchBar.value.toLowerCase();
    dropdown.innerHTML = '';

    if (!query) {
        dropdown.style.display = 'none';
        return;
    }

    let filteredData = drugData.filter(drug => 
        drug.GenericName.toLowerCase().startsWith(query)
    );

    if (filteredData.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.style.display = 'block';
    filteredData.forEach(drug => {
        let item = document.createElement('div');
        item.textContent = drug.GenericName;
        item.onclick = () => selectDrug(drug);
        dropdown.appendChild(item);
    });
}

// Show details after selection
function selectDrug(drug) {
    dropdown.style.display = 'none';
    searchBar.value = drug.GenericName; // Set selected value

    resultsDiv.innerHTML = `
        <div class="title">Generic Name:</div>
        <div class="data">${drug.GenericName}</div>

        <div class="title">Brand:</div>
        <div class="data">${drug.Brand}</div>

        <div class="title">FUKKM System/Group:</div>
        <div class="data">${drug.FUKKMSystemGroup}</div>

        <div class="title">MDC:</div>
        <div class="data">${drug.MDC}</div>

        <div class="title">NEML:</div>
        <div class="data">${drug.NEML}</div>

        <div class="title">Method of Purchase:</div>
        <div class="data">${drug.MethodOfPurchase}</div>

        <div class="title">Category:</div>
        <div class="data">${drug.Category}</div>

        <div class="title">Indications:</div>
        <div class="data">${drug.Indications}</div>

        <div class="title">Prescribing Restrictions:</div>
        <div class="data">${drug.PrescribingRestrictions}</div>

        <div class="title">Dosage:</div>
        <div class="data">${drug.Dosage}</div>

        <div class="title">Adverse Reaction:</div>
        <div class="data">${drug.AdverseReaction}</div>

        <div class="title">Contraindications:</div>
        <div class="data">${drug.Contraindications}</div>

        <div class="title">Interactions:</div>
        <div class="data">${drug.Interactions}</div>

        <div class="title">Precautions:</div>
        <div class="data">${drug.Precautions}</div>

        <hr>
    `;
    
    resultsDiv.style.display = 'block'; // Show results
}

// Try fetching data from online
fetchData();
