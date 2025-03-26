const GAS_URL = 'https://script.google.com/macros/s/AKfycbz_NGOcXVeWDEWVswLCgZ47ylOgnCwrRnFdeaYGEaIk_Ij5pIaEIUO0NbUt4bYy-Pmy/exec';  // Replace with your actual Web App URL
let drugData = [];

// Fetch data from Google Apps Script
async function fetchData() {
    try {
        let response = await fetch(GAS_URL);
        drugData = await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Filter results based on search input
function filterResults() {
    let query = document.getElementById('searchBar').value.toLowerCase();
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    let filteredData = drugData.filter(drug => 
        drug.GenericName.toLowerCase().includes(query)
    );

    if (filteredData.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    filteredData.forEach(drug => {
        resultsDiv.innerHTML += `
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
    });
}

// Load data when the page loads
fetchData();
