// api/openai.js
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
require("dotenv").config();

// init client (server only)
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Crisis keywords for immediate safety messaging (keep this check server-side)
const CRISIS_KEYWORDS = ["suicide", "suicidal", "kill myself", "end my life", "hurt myself", "self-harm"];

router.post("/pirate", async (req, res) => {
  try {
    const body = req.body || {};
    let prompt = "";

    if (typeof body.question === "string") {
      prompt = body.question;
    } else if (typeof body.user_input === "string") {
      const ctx = Array.isArray(body.context) ? body.context.map(c => `${c.role}: ${c.content}`).join("\n") : "";
      prompt = `${ctx}\nUser: ${body.user_input}\nAssistant:`;
    } else {
      return res.status(400).json({ error: "Missing question or user_input" });
    }

    const normalized = prompt.toLowerCase();

    // Crisis handling: if user mentions suicidal ideation or self-harm, return an immediate safety message
    if (CRISIS_KEYWORDS.some((k) => normalized.includes(k))) {
      const crisisMessage = "I'm really sorry you're feeling this way. I can't provide emergency help. If you're in immediate danger, please call your local emergency number right now. If you're able, consider contacting a suicide prevention hotline (in the US: 988) or your local crisis line. Would you like resources for reaching out to someone now?";
      return res.json({ answer: crisisMessage });
    }

    // No local refusal — send the prompt to OpenAI and return the model's response.
    // The model is guided to be a compassionate mental-health assistant, but it may
    // still answer non-mental-health questions if appropriate. This lets the API
    // determine the best response rather than the server's keyword filters.
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: "You are a compassionate, non-judgmental mental health support assistant. Provide empathetic, validating responses focused on feelings, coping strategies, and small practical steps. Do not provide medical diagnoses or clinical advice. Keep language calm, supportive, and brief.",
      input: prompt,
    });

    const answer = response.output_text ?? (response.output && response.output[0]?.content?.[0]?.text) ?? null;
    if (!answer) return res.status(502).json({ error: "AI returned no text" });

    return res.json({ answer });
  } catch (err) {
    console.error("OpenAI error:", err?.message ?? err);
    return res.status(500).json({ error: err?.message ?? "Internal AI error" });
  }
});

module.exports = router;





