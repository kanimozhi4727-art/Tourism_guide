const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Temporary memory storage
let users = {};

// ------------------
// 1️⃣ Share Location
// ------------------
app.get("/", (req, res) => {
    res.send("Backend is running successfully 🚀");
});
app.post("/share-location", (req, res) => {
    const { phone, latitude, longitude, allowedFriend } = req.body;

    if (!phone || !latitude || !longitude || !allowedFriend) {
        return res.status(400).json({ message: "All fields required" });
    }

    users[phone] = {
        latitude,
        longitude,
        allowedFriend
    };

    res.json({ message: "Location shared successfully" });
});

// ------------------
// 2️⃣ Get Location
// ------------------
app.post("/get-location", (req, res) => {
    const { phone, requester } = req.body;

    if (!users[phone]) {
        return res.status(404).json({ message: "User not found" });
    }

    if (users[phone].allowedFriend !== requester) {
        return res.status(403).json({ message: "Access denied" });
    }

    res.json({
        latitude: users[phone].latitude,
        longitude: users[phone].longitude
    });
});

// ------------------
// 3️⃣ Visiting Suggestion
// ------------------
app.post("/suggest-places", (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Location required" });
    }

    // Dummy nearby places (for demo)
    const places = [
        { name: "City Park", distance: "1.2 km" },
        { name: "Shopping Mall", distance: "2.5 km" },
        { name: "Coffee Shop", distance: "800 m" }
    ];

    res.json({
        message: "Nearby places",
        places: places
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.use(express.json());   // MUST be above routes

app.post("/share-location", (req, res) => {
    const { phone, name, latitude, longitude } = req.body;

    console.log("📡 Location received:");
    console.log("Name:", name);
    console.log("Phone:", phone);
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    res.json({
        success: true,
        message: "Location stored successfully"
    });
});
