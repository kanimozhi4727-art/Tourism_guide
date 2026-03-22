// Dummy login action: Redirect to a fictional dashboard page on form submission
// This is for demo purposes - in a real app, replace with actual authentication logic

// Select the login form
const loginForm = document.querySelector('.login-form');

// Add event listener for form submission
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission (page reload)
    
    // Dummy check: In a real app, validate credentials here
    // For now, just redirect to a placeholder page
    window.location.href = 'dashboard.html'; // Redirect to another page (create this file if needed)
});
function showPlace(place) {
    const title = document.getElementById("placeTitle");
    const desc = document.getElementById("placeDesc");
    const box = document.getElementById("placeInfo");

    const places = {
        ooty: {
            name: "Ooty",
            info: "Queen of hill stations, famous for tea gardens and cool climate."
        },
        kodaikanal: {
            name: "Kodaikanal",
            info: "Misty hills, lakes, and peaceful nature."
        },
        rameswaram: {
            name: "Rameswaram",
            info: "Sacred pilgrimage site with Ramanathaswamy Temple."
        },
        madurai: {
            name: "Madurai",
            info: "Historic city famous for Meenakshi Amman Temple."
        },
        thanjavur: {
            name: "Thanjavur",
            info: "Home of the Brihadeeswarar Temple and Chola architecture."
        },
        yercaud: {
            name: "Yercaud",
            info: "Calm hill station with coffee plantations."
        }
    };

    title.textContent = places[place].name;
    desc.textContent = places[place].info;
    box.style.display = "block";
}

