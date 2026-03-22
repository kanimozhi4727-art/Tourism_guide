// ===== GLOBALS =====
const navItems = document.querySelectorAll('.nav-item:not(.profile)');
const sections = document.querySelectorAll('.page-section');

let map = null;
let mapInitialized = false;
let liveMarker = null;
let searchMarker = null;
let watchId = null;
let userInteracted = false;

// ===== NAV HANDLING =====
navItems.forEach(item => {
    item.addEventListener('click', () => {

        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(sec => sec.classList.remove('active'));
        const targetId = item.id.replace('Btn', 'Section');
        document.getElementById(targetId).classList.add('active');

        if (item.id === "wrapBtn" && !mapInitialized) {
            initMap();
            startLiveTracking();
        }

        if (item.id === "wrapBtn") {
            setTimeout(() => map.invalidateSize(), 200);
        }
    });
});

// ===== MAP INIT =====
function initMap() {
    map = L.map('map').setView([11.1271, 78.6569], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
    }).addTo(map);

    mapInitialized = true;

    map.on('dragstart zoomstart', () => {
        userInteracted = true;
    });
}

// ===== HOME PAGE SEARCH (INFO MODE) =====
document.addEventListener("DOMContentLoaded", () => {

    // HOME PAGE SEARCH
    const homeSearchBtn = document.getElementById("homeSearchBtn");
    if (homeSearchBtn) {
        homeSearchBtn.addEventListener("click", searchPlaceInfo);
    }
    
    // WRAP PAGE SEARCH (MAP)
    const wrapSearchBtn = document.getElementById("searchBtn");
    if (wrapSearchBtn) {
        wrapSearchBtn.addEventListener("click", searchLocation);
    }

});


// ✅ SINGLE, WORKING FUNCTION
async function searchPlaceInfo() {
    const input = document.getElementById("homeSearchInput");
    const resultBox = document.getElementById("placeResult");
    const title = document.getElementById("placeTitle");
    const info = document.getElementById("placeInfo");
    const link = document.getElementById("wikiLink");

    if (!input || !resultBox) return;

    const place = input.value.trim();
    if (!place) return;

    resultBox.classList.remove("hidden");
    title.innerText = "🔍 Loading...";
    info.innerText = "Fetching information…";
    link.href = "#";
    const searchQuery = `${place} India`;

    try {
    const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place)}`
    );

    if (response.status === 404) {
        title.innerText = "Place not found ❌";
        info.innerText = "Check the spelling or try a nearby city / district name.";
        link.href = "#";
        return;
    }

    if (!response.ok) {
        throw new Error("Network issue");
    }

    const data = await response.json();

    title.innerText = data.title;
    info.innerText = data.extract || "No detailed information available.";
    link.href = data.content_urls.desktop.page;

} catch (error) {
    title.innerText = "Network error 🌐";
    info.innerText = "Unable to connect right now. Please check your internet.";
    link.href = "#";
}

}
function searchLocation() {
    if (!mapInitialized || !map) {
        alert("Map is still loading. Please wait a moment.");
        return;
    }

    const input = document.getElementById("locationInput");
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                alert("Place not found. Check spelling.");
                return;
            }

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            if (searchMarker) {
                map.removeLayer(searchMarker);
            }

            searchMarker = L.circleMarker([lat, lon], {
                radius: 9,
                color: "#1e40ff",
                fillColor: "#1e40ff",
                fillOpacity: 1
            }).addTo(map);

            map.setView([lat, lon], 14);
            searchMarker.bindPopup(query).openPopup();
        })
        .catch(() => {
            alert("Network issue. Unable to fetch map location.");
        });
}

// ===== LIVE LOCATION =====
function startLiveTracking() {
    if (!navigator.geolocation) {
        document.getElementById("locationStatus").innerText = "Geolocation not supported";
        return;
    }

    watchId = navigator.geolocation.watchPosition(
        async pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const timeNow = new Date().toLocaleTimeString();

            if (!liveMarker) {
                liveMarker = L.circleMarker([lat, lon], {
                    radius: 10,
                    color: "red",
                    fillColor: "red",
                    fillOpacity: 1
                }).addTo(map);

                map.setView([lat, lon], 15);
            } else {
                liveMarker.setLatLng([lat, lon]);
                if (!userInteracted) {
                    map.setView([lat, lon]);
                }
            }

            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();

            document.getElementById("locationStatus").innerText = "Live";
            document.getElementById("placeName").innerText = data.display_name || "Unknown place";
            document.getElementById("lastUpdated").innerText = timeNow;
        },
        () => {
            document.getElementById("locationStatus").innerText =
                "Location turned off at " + new Date().toLocaleTimeString();
        },
        { enableHighAccuracy: true }
    );
}

// ===== PROFILE PANEL =====
const profileBtn = document.getElementById("profileBtn");
const profilePanel = document.getElementById("profilePanel");

profileBtn.addEventListener("click", e => {
    e.stopPropagation();
    profilePanel.classList.toggle("active");
});

window.addEventListener("click", e => {
    if (!profilePanel.contains(e.target) && !profileBtn.contains(e.target)) {
        profilePanel.classList.remove("active");
    }
});
const darkThemeToggle = document.getElementById("darkTheme");

// Load saved theme
if (localStorage.getItem("darkTheme") === "enabled") {
    document.body.classList.add("dark-theme");
    darkThemeToggle.checked = true;
}

// Toggle theme
darkThemeToggle.addEventListener("change", () => {
    if (darkThemeToggle.checked) {
        document.body.classList.add("dark-theme");
        localStorage.setItem("darkTheme", "enabled");
    } else {
        document.body.classList.remove("dark-theme");
        localStorage.setItem("darkTheme", "disabled");
    }
});
const generateBtn = document.getElementById("generateQR");
const qrContainer = document.getElementById("qrCode");

generateBtn.addEventListener("click", () => {
    qrContainer.innerHTML = ""; // clear old QR

    const name = document.getElementById("userName")?.value || "Not set";
    const phone = document.getElementById("userPhone")?.value || "Not set";
    const connectorName = document.getElementById("userConnectorName")?.value || "Not set";
    const connectorPhone = document.getElementById("userConnectorPhone")?.value || "Not set";

    const qrData = `Name: ${name}\nPhone: ${phone}\nConnector: ${connectorName}\nConnector Phone: ${connectorPhone}`;

    new QRCode(qrContainer, {
        text: qrData,
        width: 160,
        height: 160,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
});

// (UNCHANGED — SAFE)
document.getElementById("homeSearchInput").addEventListener("input", e => {
    if (e.target.value.trim() === "") {
        document.getElementById("placeResult").classList.add("hidden");
    }
});
const weatherBox = document.getElementById("weatherBox");
const weatherStatus = document.getElementById("weatherStatus");

// ===== WEATHER (LIVE LOCATION) =====
const API_KEY = "0e170d19d23cce0ea791a59a8a7c4164";

function getLiveWeather() {

    if (!navigator.geolocation) {
        showWeatherError("Location not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            )
                .then(response => response.json())
                .then(data => {
                    console.log("TEMP:", data.main.temp);        
                    if (data.cod !== 200) {
                        showWeatherError("Weather not available");
                        return;
                    }

                    document.getElementById("temperature").textContent =
                        Math.round(data.main.feels_like) + "°C";

                    document.getElementById("weatherCondition").textContent =
                        data.weather[0].main;

                    document.getElementById("weatherLocation").textContent =
                        "📍 " + data.name;

                    document.getElementById("weatherIcon").src =
                        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                })
                .catch(() => {
                    showWeatherError("Network issue");
                });
        },
        () => {
            showWeatherError("Location permission denied");
        }
    );
}

function showWeatherError(message) {
    document.getElementById("weatherCondition").textContent = message;
}

// Load weather on page load
window.addEventListener("load", getLiveWeather);

const addBtn = document.getElementById("addPersonBtn");
const addBox = document.getElementById("addPersonBox");
const saveBtn = document.getElementById("savePerson");
const list = document.getElementById("personsList");

const nameInput = document.getElementById("personName");
const phoneInput = document.getElementById("personPhone");

// SHOW / HIDE FORM
addBtn.addEventListener("click", () => {
    addBox.classList.toggle("hidden");
});

// SAVE PERSON
saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        alert("Fill all fields");
        return;
    }

    const people = JSON.parse(localStorage.getItem("connections")) || [];
    people.push({ name, phone });

    localStorage.setItem("connections", JSON.stringify(people));

    nameInput.value = "";
    phoneInput.value = "";
    addBox.classList.add("hidden");

    renderConnections();
});

// DISPLAY PEOPLE
function renderConnections() {
    list.innerHTML = "";

    const people = JSON.parse(localStorage.getItem("connections")) || [];

    people.forEach((person, index) => {
        const div = document.createElement("div");
        div.className = "person-card";
        div.innerHTML = `
            <p><strong>Person ${index + 1}</strong></p>
            <p>${person.name}</p>
            <p>${person.phone}</p>
        `;
        list.appendChild(div);
    });
}

window.addEventListener("load", renderConnections);

const sosBtn = document.getElementById("sosBtn");
const sosPopup = document.getElementById("sosPopup");
const closeSOS = document.getElementById("closeSOS");
const favCall = document.getElementById("favCall");

// TEMP favourite person (later from connection section)
const favName = localStorage.getItem("favName") || "Favourite Person";
const favPhone = localStorage.getItem("favPhone") || "9876543210";

favCall.textContent = `❤️ Call ${favName}`;
favCall.href = `tel:${favPhone}`;

sosBtn.addEventListener("click", () => {
    sosPopup.classList.toggle("hidden");
});

closeSOS.addEventListener("click", () => {
    sosPopup.classList.add("hidden");
});
const viewLocationBtn = document.getElementById("viewLocationBtn");
const friendsList = document.getElementById("friendsList");
const friendsContainer = document.getElementById("friendsContainer");

// SHOW FRIENDS FOR LOCATION
viewLocationBtn.addEventListener("click", () => {
  friendsList.style.display = "block";
  renderFriendsForLocation();
});

// RENDER FRIENDS LIST
function renderFriendsForLocation() {
  friendsContainer.innerHTML = "";

  const people = JSON.parse(localStorage.getItem("connections")) || [];

  if (people.length === 0) {
    friendsContainer.innerHTML = "<p>No connections found</p>";
    return;
  }

  people.forEach((person, index) => {
    const li = document.createElement("li");
    li.textContent = person.name + " (" + person.phone + ")";
    li.style.cursor = "pointer";

    li.addEventListener("click", () => {
      const action = prompt(
        "Choose action:\n1. Share Location\n2. Delete Contact\n\nEnter 1 or 2"
      );

      if (action === "1") {
        shareLiveLocation(person.phone, person.name);
      } else if (action === "2") {
        deleteContact(index);
      } else {
        alert("Invalid option");
      }
    });

    friendsContainer.appendChild(li);
  });
}

// DELETE CONTACT
function deleteContact(index) {
  const confirmDelete = confirm("Are you sure you want to delete this contact?");

  if (!confirmDelete) return;

  const people = JSON.parse(localStorage.getItem("connections")) || [];

  people.splice(index, 1);

  localStorage.setItem("connections", JSON.stringify(people));

  alert("Contact deleted successfully");

  renderFriendsForLocation(); // refresh properly
}
