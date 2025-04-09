const express = require("express");
const router = express.Router();
const Synonym = require("../models/synonym");
// Remove the cors import since we're using the global configuration
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Remove the redundant cors middleware - it's already applied at the app level
router.use(express.json());

// PUBLIC ROUTES
// Search for synonyms by word (available to all users)
router.get("/synonymSearch", async (req, res) => {
  try {
    const word = req.query.word?.trim();

    if (!word) {
      return res.status(400).json([]);
    }

    // Case-insensitive search
    const synonyms = await Synonym.find({
      word: new RegExp(`^${word}$`, "i"),
      status: "active", // Only return active synonyms to users
    });

    if (!synonyms.length) {
      return res.status(404).json([]);
    }

    // Return an array of synonyms as the front-end expects
    const synonymData = synonyms.map((item) => item.synonym).flat();
    res.json(synonymData);
  } catch (err) {
    console.error("Error searching synonyms:", err);
    res.status(500).json([]);
  }
});

// ADMIN ROUTES
// Add new synonym (admin only)
router.post("/SynonymAdd", protect, adminOnly, async (req, res) => {
  try {
    const { word, synonym, status = "active" } = req.body;

    if (!word || !synonym || !synonym.length) {
      return res
        .status(400)
        .json({ error: "Word and at least one synonym are required" });
    }

    const newSynonym = new Synonym({
      word: word.trim().toLowerCase(),
      synonym: Array.isArray(synonym) ? synonym : [synonym],
      status,
    });

    await newSynonym.save();
    res.status(201).json({
      message: "Synonym added successfully",
    });
  } catch (err) {
    console.error("Error adding synonym:", err);
    res.status(500).json({ error: "Error adding synonym" });
  }
});

// View all synonyms (admin only)
router.get("/synonymTable", protect, adminOnly, async (req, res) => {
  try {
    const synonyms = await Synonym.find();
    res.json(synonyms);
  } catch (err) {
    console.error("Error fetching synonyms:", err);
    res.status(500).json({ error: "Error fetching synonyms" });
  }
});

// Delete synonym (admin only)
router.delete("/deleteSynonym/:id", protect, adminOnly, async (req, res) => {
  try {
    const result = await Synonym.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ error: "Synonym not found" });
    }

    res.status(200).json({ message: "Synonym deleted successfully" });
  } catch (err) {
    console.error("Error deleting synonym:", err);
    res.status(500).json({ error: "Error deleting synonym" });
  }
});

// Update synonym (admin only)
router.put("/updateSynonym/:id", protect, adminOnly, async (req, res) => {
  try {
    const { word, synonym, status } = req.body;

    if (!word || !synonym || !synonym.length) {
      return res
        .status(400)
        .json({ error: "Word and at least one synonym are required" });
    }

    const updatedSynonym = await Synonym.findByIdAndUpdate(
      req.params.id,
      {
        word: word.trim().toLowerCase(),
        synonym: Array.isArray(synonym) ? synonym : [synonym],
        status,
      },
      { new: true }
    );

    if (!updatedSynonym) {
      return res.status(404).json({ error: "Synonym not found" });
    }

    res.json({
      message: "Synonym updated successfully",
      synonym: updatedSynonym,
    });
  } catch (err) {
    console.error("Error updating synonym:", err);
    res.status(500).json({ error: "Error updating synonym" });
  }
});

module.exports = router;
