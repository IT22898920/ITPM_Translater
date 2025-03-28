const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const newUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      minLength: [6, "Password must be at least 6 characters"],
      // Not required for Firebase auth users
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "admin",
    },
    firebaseUid: {
      type: String,
      unique: true,
      required: false,
    },
    photo: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving to DB (only if password is modified)
newUserSchema.pre("save", async function (next) {
  // Skip password hashing if no password or not modified or using OAuth
  if (
    !this.password ||
    !this.isModified("password") ||
    this.authProvider !== "email"
  ) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const NewUser = mongoose.model("NewUser", newUserSchema);
module.exports = NewUser;
