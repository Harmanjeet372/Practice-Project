// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

// Import dependencies
const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const hbs = require("hbs");
const multer = require("multer");

// Initialize the Express app
const app = express();

// Connect to the database
connectDb();

// Set the view engine to Handlebars
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials"); // Path to your partials

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use("/uploads", express.static("uploads")); // Serve static files from "uploads" directory

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads"); // Set file storage destination
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix); // Define unique filename
    },
});
const upload = multer({ storage: storage });

// Import the model
const Upload = require("./model/UploadModel");

// Define routes
app.use("/api/register", require("./routes/userRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));

// Route for single file upload
app.post("/uploads", upload.single("myFile"), (req, res) => {
    console.log(req.file);
    res.send("File uploaded successfully!");
});

// Profile route for avatar upload
app.post("/profile", upload.single("avatar"), async (req, res) => {
    try {
        const profileData = {
            username: req.body.username,
            avatar: req.file.path, // Save the file path
        };

        const newProfile = new Upload(profileData);
        await newProfile.save();

        console.log("Profile saved:", newProfile);
        res.redirect("/home");
    } catch (error) {
        console.error("Error saving profile:", error);
        res.status(500).send("Error saving profile.");
    }
});

// Route to display profile on home page
app.get("/home", async (req, res) => {
    try {
        const profile = await Upload.findOne().sort({ _id: -1 }); // Fetch the latest profile

        res.render("home", {
            username: profile ? profile.username : "No Profile Found",
            avatar: profile ? profile.avatar : null,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Error fetching profile data.");
    }
});

// Example route rendering a list of users
app.get("/users", (req, res) => {
    res.render("users", {
        people: [
            { username: "Harman", age: 20 },
            { username: "Kirat", age: 21 },
        ],
    });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

