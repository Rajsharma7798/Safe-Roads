let map;
let markers = [];

// --- Map Initialization (Leaflet JS) ---
function initMap() {
    // Default center (Loni Kalbhor, Pune)
    const defaultLocation = [18.4968, 74.0242];

    map = L.map('map').setView(defaultLocation, 13);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    initAutocomplete();
    
    // Try HTML5 geolocation to center map on user initially
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 15);
                fetchHazards(); // Load hazards after setting user location
            },
            () => { 
                console.log("Geolocation blocked or failed. Using default."); 
                fetchHazards(); // Load hazards if geolocation fails
            }
        );
    } else {
        fetchHazards(); // Load hazards if geolocation not supported
    }
}

// --- Autocomplete & Search (Nominatim) ---
function initAutocomplete() {
    const input = document.getElementById("pac-input");
    
    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            let query = input.value.trim();
            if (!query) return;

            // Bias search towards Pune, India if not specified
            if (!query.toLowerCase().includes("pune")) {
                query += ", Pune, India";
            }

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await res.json();

                if (data && data.length > 0) {
                    const place = data[0];
                    map.setView([place.lat, place.lon], 15);
                    fetchHazards(); // Mock function to get hazards in area
                } else {
                    alert("Location not found. Try a different search.");
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            }
        }
    });
}

// --- Markers & Data Fetching ---
function addMarker(hazard) {
    // Use default Leaflet markers, colored based on type if possible, or just default.
    // For simplicity, we use the default blue marker, but we can customize colors with DivIcon
    const markerHtml = hazard.type === 'pothole' ? '🚨' : '🚦';
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style='font-size:24px;'>${markerHtml}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker([hazard.lat, hazard.lng], { icon: customIcon }).addTo(map);

    const popupContent = `
        <div style="color:black; min-width: 150px;">
            <h5 class="mb-1">${hazard.type === 'pothole' ? '🚨 Pothole' : '🚦 Traffic Light Issue'}</h5>
            <p class="mb-1">${hazard.description || 'No description provided.'}</p>
            ${hazard.photoUrl ? `<img src="${hazard.photoUrl}" alt="Hazard" style="width:100%; max-height:100px; object-fit:cover; border-radius:5px; margin-top:5px;">` : ''}
        </div>
    `;

    marker.bindPopup(popupContent);
    markers.push(marker);
    return marker;
}

// Fetch all hazards to display on map
async function fetchHazards() {
    try {
        const res = await fetch('/api/all-hazards');
        if (res.ok) {
            const hazards = await res.json();
            hazards.forEach(hazard => addMarker(hazard));
        }
    } catch (e) {
        console.error("Failed to fetch hazards:", e);
    }
}

// --- Random Hazard Button ---
document.getElementById('btn-random-hazard').addEventListener('click', async () => {
    try {
        const res = await fetch('/api/random-hazard');
        if (!res.ok) throw new Error('No hazards available');
        const hazard = await res.json();
        
        map.setView([hazard.lat, hazard.lng], 16);
        
        const marker = addMarker(hazard);
        marker.openPopup();
    } catch (e) {
        console.error(e);
        showToast("Couldn't find a random hazard. Be the first to report one!");
    }
});

// --- Report Form Handling ---
let currentReportType = 'pothole';
let userLocation = null;

function setReportType(type) {
    currentReportType = type;
    document.getElementById('report-type').value = type;
    document.getElementById('reportModalLabel').innerText = type === 'pothole' ? '🚨 Report Pothole' : '🚦 Report Traffic Light Issue';
    
    // Capture GPS on modal open
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => { userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
            () => { console.warn("Could not get location."); }
        );
    }
}

// Helper to convert file to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!userLocation) {
        alert("We need your GPS location to submit a report.");
        return;
    }

    const btn = document.getElementById('submit-report-btn');
    btn.disabled = true;
    btn.innerText = "Submitting...";

    try {
        const fileInput = document.getElementById('report-photo');
        const photoBase64 = fileInput.files.length > 0 ? await getBase64(fileInput.files[0]) : '';

        const payload = {
            type: currentReportType,
            description: document.getElementById('report-description').value,
            photoUrl: photoBase64, // Using Base64 string directly for simplicity
            lat: userLocation.lat,
            lng: userLocation.lng
        };

        const res = await fetch('/api/hazards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast("Hazard reported successfully! Thank you.");
            
            // Close modal & reset
            bootstrap.Modal.getInstance(document.getElementById('reportModal')).hide();
            document.getElementById('report-form').reset();
            
            // Add marker immediately to map
            const newMarker = addMarker(payload);
            map.setView([userLocation.lat, userLocation.lng], 16);
            newMarker.openPopup();
        } else {
            throw new Error("Server responded with error");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to submit report.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Submit Report";
    }
});

// --- Feedback Form Handling ---
document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('feedback-name').value,
        email: document.getElementById('feedback-email').value,
        phone: document.getElementById('feedback-phone').value,
        category: document.getElementById('feedback-category').value,
        message: document.getElementById('feedback-message').value
    };

    try {
        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast("Feedback submitted successfully. Help us grow!");
            document.getElementById('feedback-form').reset();
        }
    } catch (e) {
        console.error(e);
        alert("Failed to submit feedback.");
    }
});

// --- Utilities ---
function showToast(message) {
    document.getElementById('toastMessage').innerText = message;
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    toast.show();
}

// --- Live Counter Animation ---
function animateCounter() {
    const counterEl = document.getElementById('user-counter');
    let count = 1000;
    
    // Simulate real-time growth
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance to increment every few seconds
            count += Math.floor(Math.random() * 3) + 1;
            counterEl.innerText = count.toLocaleString() + '+';
        }
    }, 5000);
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    animateCounter();
});
