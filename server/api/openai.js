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


router.post("/recommend/stories", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;


    // 1. SKIP CACHE - ALWAYS GENERATE FRESH PER USER REQUEST
    // const [cached] = await db.execute(...) 

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

    // Enrich Data
    const enrichedMoods = moodLogs.map(log => ({
      ...log,
      mood_text: MOOD_DEFINITIONS[log.mood] || "Unknown"
    }));

    // Parse Quiz Answers if string
    const enrichedQuiz = quizResults.map(q => {
      let answers = q.answers;
      if (typeof answers === 'string') {
        try { answers = JSON.parse(answers); } catch (e) { }
      }
      return { ...q, answers };
    });

    // 3. Construct Prompt
    const context = {
      recent_moods: enrichedMoods,
      recent_quiz_results: enrichedQuiz
    };

    const systemPrompt = `You are a wise storyteller and mentor. 
    Analyze the user's recent mood history AND their specific "Quiz Results" to generate a highly personalized motivational story.
    
    Data Context:
    - Moods are 1-5 (Very Sad to Very Happy).
    - Quiz Results contain scores and specific answers about:
      Q1: Sleep Quality (Low=Poor)
      Q2: Energy Level (Low=Drained)
      Q3: Social Interest (Low=Isolated)
      Q4: Optimism (Low=Pessimistic)
      Q5: Concentration (Low=Unfocused)

    Analysis Instructions:
    - Look at the TREND of moods.
    - Look at specific QUIZ answers. e.g. if Sleep (Q1) is low, tell a story about rest or patience. If Social (Q3) is low, tell a story about connection or self-reliance.
    
    Return ONLY a JSON object with this exact schema:
    {
      "id": "ai-generated-${Date.now()}",
      "title": "Story Title",
      "category": "one of: resilience, growth, success, kindness, perseverance",
      "duration": "approx reading time (e.g. '3 min')",
      "story": ["paragraph 1", "paragraph 2", "paragraph 3", "paragraph 4", "paragraph 5"],
      "lesson": "The core moral of the story",
      "affirmation": "A short, powerful 'I am' statement related to the story",
      "tags": ["Tag1", "Tag2", "Tag3"]
    }

    Guidelines:
    - Keep the story engaging, around 300-400 words total, split into 4-6 paragraphs.
    - Make it feel timeless, like a fable or a modern parable.
    - ALWAYS generate a UNIQUE story if possible, avoid repeating common fables if the user makes multiple requests.
    `;

    const userPrompt = `User Context: ${JSON.stringify(context)}. Generate a UNIQUE story now.`;

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

    // Ensure ID is uniqueish
    recommendation.id = `ai-${Date.now()}`;


    // 5. Save to Cache
    await db.execute(
      "INSERT INTO story_recommendations (user_id, recommendation) VALUES (?, ?)",
      [userId, JSON.stringify(recommendation)]
    );

    return res.json({ status: "success", data: recommendation, source: "ai" });

  } catch (err) {
    console.error("Error generating story recommendation:", err);
    return res.status(500).json({ error: "Failed to generate story recommendation" });
  }
});

router.post("/chat/greeting", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check for "recent" quiz result (e.g. last 10 minutes) to determine context
    const [recentQuiz] = await db.execute(
      "SELECT score, mood_label, answers, created_at FROM mood_quiz_results WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE) ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    let systemPrompt = "";
    let userPrompt = "";

    if (recentQuiz.length > 0) {
      // SCENARIO: Post-Quiz Context
      const quiz = recentQuiz[0];
      const moodLabel = quiz.mood_label || "Unknown";

      systemPrompt = `You are an empathetic, supportive AI friend and therapist.
      The user just finished a mood assessment.
      Result: ${moodLabel}.
      
      Your Goal: proactive and warm greeting acknowledging their recent check-in.
      Do NOT ask to take the quiz again. Ask how they are feeling about the result or how you can help.
      Keep it short (1-2 sentences).
      `;
      userPrompt = `Generate a greeting for a user who just scored as "${moodLabel}".`;

    } else {
      // SCENARIO: Direct Access
      systemPrompt = `You are a helpful, warm AI friend.
      The user has opened the chat directly (did not just take a quiz).
      
      Your Goal: Paraphrase this specific meaning into a warm, unique greeting:
      "Oh as I can see you directly come to me, let me know then what you want to discuss with me, I am here."
      
      Instructions:
      - Keep the CORE MEANING of acknowledging they came directly to you.
      - Be warm and inviting.
      - Keep it short (1-2 sentences).
      - vary the phrasing so it doesn't sound robotic.
      `;
      userPrompt = "Generate a warm direct-access greeting.";
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 100
    });

    const greeting = response.choices[0].message.content;

    // Return context info so frontend knows state
    return res.json({
      greeting,
      contextType: recentQuiz.length > 0 ? "post-quiz" : "direct"
    });

  } catch (err) {
    console.error("Error generating chat greeting:", err);
    // Fallback if AI fails
    return res.json({
      greeting: "I'm here to listen. What's on your mind?",
      contextType: "fallback"
    });
  }
});

router.post("/recommend/exercises", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch context (Mood Logs & Quiz)
    const [moodLogs] = await db.execute(
      "SELECT mood, note, created_at FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const [quizResults] = await db.execute(
      "SELECT score, mood_label, answers, created_at FROM mood_quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 3",
      [userId]
    );

    const MOOD_DEFINITIONS = { 1: "Very Sad", 2: "Sad", 3: "Neutral", 4: "Happy", 5: "Very Happy" };
    const enrichedMoods = moodLogs.map(log => ({ ...log, mood_text: MOOD_DEFINITIONS[log.mood] || "Unknown" }));

    const enrichedQuiz = quizResults.map(q => {
      let answers = q.answers;
      if (typeof answers === 'string') { try { answers = JSON.parse(answers); } catch (e) { } }
      return { ...q, answers };
    });

    const context = { recent_moods: enrichedMoods, recent_quiz_results: enrichedQuiz };

    const systemPrompt = `You are an expert fitness and wellness coach.
    Analyze the user's mood and quiz results to recommend a personalized exercise.
    
    Return ONLY a JSON object with this exact schema:
    {
      "id": "ai-ex-${Date.now()}",
      "name": "Exercise Name",
      "type": "physical" | "mental" | "breathing",
      "duration": "e.g. 10 min",
      "difficulty": "easy" | "medium" | "hard",
      "description": "Short description",
      "benefits": ["benefit 1", "benefit 2"],
      "instructions": ["step 1", "step 2", "step 3"],
      "reason": "Why this is good for their current mood"
    }
    
    Guidelines:
    - Low Energy/Sad -> Gentle movement, breathing, or uplifting physical activity.
    - High Stress/Anxiety -> Breathing or mental relaxation.
    - High Energy/Happy -> More challenging physical exercises or focus-based mental tasks.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Context: ${JSON.stringify(context)}. Recommend an exercise.` }
      ],
      response_format: { type: "json_object" }
    });

    const recommendation = JSON.parse(response.choices[0].message.content);
    await db.execute("INSERT INTO exercise_recommendations (user_id, recommendation) VALUES (?, ?)", [userId, JSON.stringify(recommendation)]);

    return res.json({ status: "success", data: recommendation });
  } catch (err) {
    console.error("Error generating exercise:", err);
    return res.status(500).json({ error: "Failed to generate exercise" });
  }
});

router.post("/recommend/nutrition", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [moodLogs] = await db.execute(
      "SELECT mood, note, created_at FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const [quizResults] = await db.execute(
      "SELECT score, mood_label, answers, created_at FROM mood_quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 3",
      [userId]
    );

    const MOOD_DEFINITIONS = { 1: "Very Sad", 2: "Sad", 3: "Neutral", 4: "Happy", 5: "Very Happy" };
    const enrichedMoods = moodLogs.map(log => ({ ...log, mood_text: MOOD_DEFINITIONS[log.mood] || "Unknown" }));

    const enrichedQuiz = quizResults.map(q => {
      let answers = q.answers;
      if (typeof answers === 'string') { try { answers = JSON.parse(answers); } catch (e) { } }
      return { ...q, answers };
    });

    const context = { recent_moods: enrichedMoods, recent_quiz_results: enrichedQuiz };

    const systemPrompt = `You are a nutrition expert specializing in mood-boosting foods (Nutritional Psychiatry).
    Analyze the user's mood and quiz results to provide a personalized nutrition recommendation.
    
    Return ONLY a JSON object with this exact schema:
    {
      "title": "Short Title (e.g. Focus Recovery)",
      "recommendation": "Main food/meal suggestion",
      "reason": "Why this helps their current state (max 2 sentences)",
      "mood_benefit": "Specific psychological benefit",
      "nutrients": ["nutrient 1", "nutrient 2"],
      "tips": ["tip 1", "tip 2"]
    }
    
    Guidelines:
    - Low Energy -> Complex carbs, iron-rich foods.
    - Anxiety/Stress -> Magnesium-rich foods, Omega-3s.
    - Low Mood -> Tryptophan-rich foods, Vitamin D.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Context: ${JSON.stringify(context)}. Provide nutrition advice.` }
      ],
      response_format: { type: "json_object" }
    });

    const recommendation = JSON.parse(response.choices[0].message.content);
    await db.execute("INSERT INTO nutrition_recommendations (user_id, recommendation) VALUES (?, ?)", [userId, JSON.stringify(recommendation)]);

    return res.json({ status: "success", data: recommendation });
  } catch (err) {
    console.error("Error generating nutrition:", err);
    return res.status(500).json({ error: "Failed to generate nutrition advice" });
  }
});

module.exports = router;






