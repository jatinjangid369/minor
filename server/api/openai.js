// api/openai.js
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const db = require("../db");
const authenticateToken = require("../middleware/auth");
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

router.post("/recommend/beats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Check cache (limit 1 recent recommendation in last 12 hours)
    const [cached] = await db.execute(
      "SELECT recommendation, created_at FROM binaural_recommendations WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 12 HOUR) ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (cached.length > 0) {
      let rec = cached[0].recommendation;
      if (typeof rec === 'string') {
        try {
          rec = JSON.parse(rec);
        } catch (e) {
          console.error("Failed to parse cached recommendation", e);
        }
      }
      return res.json({ status: "success", data: rec, source: "cache" });
    }

    // 2. Fetch context (Mood Logs & Quiz)
    const [moodLogs] = await db.execute(
      "SELECT mood, note, created_at FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const [quizResults] = await db.execute(
      "SELECT score, mood_label, answers, created_at FROM mood_quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 3",
      [userId]
    );

    // Context Definitions
    const MOOD_DEFINITIONS = {
      1: "Very Sad", 2: "Sad", 3: "Neutral", 4: "Happy", 5: "Very Happy"
    };

    const QUIZ_DEFINITIONS = {
      1: "Sleep Quality (1=Poor, 5=Excellent)",
      2: "Energy Level (1=Drained, 5=High)",
      3: "Social Interest (1=Avoid, 5=Excited)",
      4: "Optimism (1=Pessimistic, 5=Optimistic)",
      5: "Concentration (1=No Focus, 5=Excellent)"
    };

    // Enrich Data
    const enrichedMoods = moodLogs.map(log => ({
      ...log,
      mood_text: MOOD_DEFINITIONS[log.mood] || "Unknown"
    }));

    const enrichedQuiz = quizResults.map(result => {
      let answers = result.answers;
      if (typeof answers === 'string') {
        try { answers = JSON.parse(answers); } catch (e) { }
      }
      // Map answers if array exists
      const mappedAnswers = Array.isArray(answers) ? answers.map(a => ({
        question: QUIZ_DEFINITIONS[a.q] || `Question ${a.q}`,
        score: a.v
      })) : answers;

      return {
        ...result,
        answers: mappedAnswers
      };
    });

    // 3. Construct Prompt
    const context = {
      recent_moods: enrichedMoods,
      recent_quiz_results: enrichedQuiz
    };

    const systemPrompt = `You are an expert in binaural beats therapy. 
    Analyze the user's recent mood history and recommend the BEST single binaural beat session.
    
    Data Legend:
    - Moods are 1-5 (Very Sad to Very Happy).
    - Quiz answers are detailed self-reports on Sleep, Energy, Social, Optimism, Focus (1-5 scale).
    
    Return ONLY a JSON object with this exact schema:
    {
      "frequency": number (in Hz, e.g., 40 for focus, 8 for relaxation),
      "preset_name": string (short title e.g. "Deep Focus", "Stress Relief"),
      "reason": string (short explanation tailored to their mood, max 2 sentences),
      "volume": number (recommended volume 0-100, usually 50-70),
      "duration": number (recommended duration in minutes, e.g. 10, 15, 20)
    }
    
    Guidelines:
    - High Stress/Anxiety -> Alpha (8-13Hz) or Theta (4-8Hz)
    - Low Energy/Depression -> Beta (13-30Hz) or Gamma (30Hz+)
    - Sleep Issues -> Delta (0.5-4Hz)
    - Focus/Work -> Gamma (40Hz) or Beta (15-20Hz)
    `;

    const userPrompt = `User Context: ${JSON.stringify(context)}. Recommend a session.`;

    // 4. Call OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });
    const recommendationRaw = response.choices[0].message.content;
    const recommendation = JSON.parse(recommendationRaw);

    // 5. Save to Cache
    await db.execute(
      "INSERT INTO binaural_recommendations (user_id, recommendation) VALUES (?, ?)",
      [userId, JSON.stringify(recommendation)]
    );

    return res.json({ status: "success", data: recommendation, source: "ai" });

  } catch (err) {
    console.error("Error generating recommendation:", err);
    return res.status(500).json({ error: "Failed to generate recommendation" });
  }
});

module.exports = router;





