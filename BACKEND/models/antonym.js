const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const antonymSchema = new Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true, // Adding index for faster searches
    },
    antonym: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

module.exports = mongoose.model("antonym", antonymSchema);
