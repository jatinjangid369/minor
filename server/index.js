const express = require("express");
const cors = require("cors");
const authRoutes = require("./api/auth");
const openAIRoutes = require("./api/openai");
const moodRoutes = require("./api/mood"); // ⬅️ added

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", openAIRoutes);
app.use("/api/mood", moodRoutes); // ⬅️ added

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
