const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const synonymSchema = new Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    synonym: {
      type: [String], // Changed to array of strings to match UI expectations
      required: true,
      validate: [(arr) => arr.length > 0, "At least one synonym is required"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

module.exports = mongoose.model("synonym", synonymSchema);
