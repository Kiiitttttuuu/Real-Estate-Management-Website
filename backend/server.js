const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/real_estate", {
        useNewUrlParser: true,
        useUnifiedTopology: true, // Corrected typo: useUnifiedTopology
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

// Schema and Model
const propertySchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    contact: String,
    reviews: [
        {
            user: String,
            rating: Number,
            comment: String,
        }
    ]
});

const Property = mongoose.model("Property", propertySchema);

// API Endpoints

// Route to add a new property
app.post("/api/properties", async (req, res) => {
    try {
        const { title, description, image, contact } = req.body; // Corrected: 'constact' to 'contact'

        // Validate request data
        if (!title || !description || !image || !contact) {
            return res
                .status(400)
                .json({ message: "Incomplete property data" });
        }

        // Create a new property
        const newProperty = new Property({
            title,
            description,
            image,
            contact,
            reviews: [],
        });

        // Save the new property to the database
        const savedProperty = await newProperty.save();

        // Respond with the newly added property
        res.status(201).json(savedProperty);
    } catch (error) {
        console.error("Error adding property:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to get all properties
app.get("/api/properties", async (req, res) => {
    try {
        const properties = await Property.find();
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to add a review for a property
app.post("/api/properties/:id/review", async (req, res) => {
    const { user, rating, comment } = req.body;

    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        property.reviews.push({ user, rating, comment });
        await property.save();
        res.status(201).json(property);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route to delete a property by ID
app.delete("/api/properties/:id", async (req, res) => {
    const propertyId = req.params.id;

    try {
        // Find the property by ID and delete it from the database
        const deletedProperty = await Property.findByIdAndDelete(propertyId);

        if (!deletedProperty) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.json({ message: "Property deleted", deletedProperty });
    } catch (error) {
        console.error("Error deleting property:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
