const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const showRoutes = require("./routes/showRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const lookRoutes = require("./routes/lookRoutes");
const seatingRoutes = require("./routes/seatingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/looks", lookRoutes);
app.use("/api/seating", seatingRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});