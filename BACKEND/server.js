const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorMiddleware");
const { initFirebaseAdmin } = require("./middlewares/firebaseAuthMiddleware");
require("dotenv").config();
const { protect, adminOnly } = require("./middlewares/authMiddleware"); // Import protect and adminOnly


// Initialize Firebase Admin SDK
initFirebaseAdmin();

const app = express();

// Import routes
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/auth");
const synonymsRouter = require("./routes/synonyms.js");
const antonymsRouter = require("./routes/antonyms.js");
const newUserRoute = require("./routes/newUserRoute");
const quizRoutes = require("./routes/quizRoutes");
const studentQuizRoutes = require("./routes/studentQuizRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// CORS configuration - IMPORTANT: This must be set up before any routes
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use("/api/posts", protect, postRoutes); // All post routes are protected

app.use("/api/admin/posts", protect, adminOnly, postRoutes); // Admin-specific routes (only admins)


// Route middleware
app.use(postRoutes);
app.use("/api/auth", userRoutes);
app.use("/synonyms", synonymsRouter);
app.use("/antonyms", antonymsRouter);
app.use("/api/new-user", newUserRoute);
app.use("/api/quizzes", quizRoutes);
app.use("/api/student", studentQuizRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error Middleware for handling errors
app.use(errorHandler);

const PORT = process.env.PORT || 8070;
const DB_URL = process.env.MONGODB_URL;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.log("DB connection error", err));

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
