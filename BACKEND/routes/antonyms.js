const express = require("express");
const router = express.Router();
const Antonym = require("../models/antonym");
// Remove the cors import since we're using the global configuration
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Remove the redundant cors middleware - it's already applied at the app level
router.use(express.json());

// PUBLIC ROUTES
// Search for antonyms by word (available to all users)
router.get("/antonymSearch", async (req, res) => {
  try {
    const word = req.query.word?.trim();

    if (!word) {
      return res.status(400).json([]);
    }

    // Case-insensitive search
    const antonyms = await Antonym.find({
      word: new RegExp(`^${word}$`, "i"),
      status: "active", // Only return active antonyms to users
    });

    if (!antonyms.length) {
      return res.status(404).json([]);
    }

    // Format the response to return an array of antonyms
    // Handle both string and array format for backward compatibility
    const antonymsArray = antonyms.flatMap((item) => {
      if (Array.isArray(item.antonym)) {
        return item.antonym;
      } else {
        return [item.antonym];
      }
    });

    res.json(antonymsArray);
  } catch (err) {
    console.error("Error searching antonyms:", err);
    res.status(500).json([]);
  }
});

// ADMIN ROUTES
// Add new antonym (admin only)
router.post("/AntonymAdd", protect, adminOnly, async (req, res) => {
  try {
    const { word, antonym, status = "active" } = req.body;

    if (!word || !antonym) {
      return res
        .status(400)
        .json({ error: "Word and at least one antonym are required" });
    }

    // Handle both string and array formats
    const antonymValue = Array.isArray(antonym) ? antonym : [antonym];

    // Create a document for each antonym
    const promises = antonymValue.map(async (ant) => {
      const newAntonym = new Antonym({
        word: word.trim().toLowerCase(),
        antonym: ant.trim(),
        status,
      });
      return newAntonym.save();
    });

    await Promise.all(promises);

    res.status(201).json({
      message: "Antonyms added successfully",
    });
  } catch (err) {
    console.error("Error adding antonym:", err);
    res.status(500).json({ error: "Error adding antonym" });
  }
});

// View all antonyms (admin only)
router.get("/antonymTable", protect, adminOnly, async (req, res) => {
  try {
    const antonyms = await Antonym.find();

    // Group antonyms by word
    const groupedAntonyms = {};
    antonyms.forEach((item) => {
      if (!groupedAntonyms[item.word]) {
        groupedAntonyms[item.word] = {
          _id: item._id, // Use the first ID for this word
          word: item.word,
          antonym: [],
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      }

      groupedAntonyms[item.word].antonym.push(item.antonym);
    });

    // Convert the grouped object to an array
    const result = Object.values(groupedAntonyms);

    res.json(result);
  } catch (err) {
    console.error("Error fetching antonyms:", err);
    res.status(500).json({ error: "Error fetching antonyms" });
  }
});

// Delete antonym (admin only)
router.delete("/deleteAntonym/:id", protect, adminOnly, async (req, res) => {
  try {
    const antonym = await Antonym.findById(req.params.id);

    if (!antonym) {
      return res.status(404).json({ error: "Antonym not found" });
    }

    // Delete all antonyms for this word
    const result = await Antonym.deleteMany({
      word: antonym.word,
    });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} antonyms successfully`,
    });
  } catch (err) {
    console.error("Error deleting antonym:", err);
    res.status(500).json({ error: "Error deleting antonym" });
  }
});

// Update antonym (admin only)
router.put("/updateAntonym/:id", protect, adminOnly, async (req, res) => {
  try {
    const { word, antonym, status } = req.body;

    if (!word || !antonym) {
      return res
        .status(400)
        .json({ error: "Word and at least one antonym are required" });
    }

    // Get the original antonym to find its word
    const originalAntonym = await Antonym.findById(req.params.id);

    if (!originalAntonym) {
      return res.status(404).json({ error: "Antonym not found" });
    }

    // Delete all existing antonyms for this word
    await Antonym.deleteMany({ word: originalAntonym.word });

    // Create new antonym entries
    const antonymArray = Array.isArray(antonym) ? antonym : [antonym];

    const promises = antonymArray.map(async (ant) => {
      const newAntonym = new Antonym({
        word: word.trim().toLowerCase(),
        antonym: ant.trim(),
        status,
      });
      return newAntonym.save();
    });

    await Promise.all(promises);

    res.json({
      message: "Antonyms updated successfully",
    });
  } catch (err) {
    console.error("Error updating antonym:", err);
    res.status(500).json({ error: "Error updating antonym" });
  }
});

module.exports = router;
