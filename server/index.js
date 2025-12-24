const express = require("express");
const cors = require("cors");
const authRoutes = require("./api/auth");
const openAIRoutes = require("./api/openai");
const moodRoutes = require("./api/mood");
const activityRoutes = require("./api/activity");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", openAIRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/activity", activityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
