# 🧠 MindFull – A Holistic Mental Wellness Companion

## 📝 Problem Statement

In today's fast-paced world, mental health issues like anxiety, stress, and depression are increasingly common, especially among youth and working professionals. Limited access to professional help, societal stigma, and a lack of daily coping tools exacerbate the problem. The challenge is to create an accessible, tech-driven platform that supports users' mental well-being in real-time and over the long term.

---

## 💡 Solution Overview

*MindFull* is a multi-feature mental health support platform designed to enhance users' moods and improve emotional well-being using a blend of modern AI, neuroscience, and wellness content. Our core features include:

- 🎧 *Binaural Beats & Solfeggio Frequencies*: Scientifically backed audio therapy to reduce stress, anxiety, and enhance focus.
- 📈 *Mood Tracker*: Real-time mood logging to analyze emotional trends and triggers.
- 🤖 *AI Psychiatrist Bot*: A friendly, GPT-4o powered AI chatbot that provides empathetic support and actionable advice.
- 🎮 *Mood-Boosting Games*: Interactive content for instant mood uplift.
- 📚 *Motivational Stories*: AI-generated personalized stories based on user mood and quiz results.
- 📊 *Mood Insights*: **Real-time dynamic dashboard** visualizing weekly mood & energy trends, distribution, and AI-generated pattern insights (Implemented).

The frontend is built using *React* (Vite), and the backend uses *Node.js/Express* with *MySQL* for persistent data and *OpenAI* for generative features.

---

## 🔌 APIs & Features

- 🧠 *OpenAI GPT-4o Integration*: 
    - `/api/chat`: Empathetic chat responses.
    - `/api/recommend/stories`: Generates unique stories based on mood history.
    - `/api/recommend/beats`: Suggests binaural beats tailored to current state.
- 📊 *Mood Analytics Engine*:
    - `/api/mood/stats`: Aggregates daily mood/energy, calculates streaks, and generates rule-based insights (e.g., "Happier on weekends").
    - `/api/mood/log`: Tracks Mood (1-5), Energy (1-5), and notes.
- 🔐 *Authentication*: Secure JWT-based auth for user data privacy.

---

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (Stores Users, Mood Logs, Quiz Results, AI Caches).
- **AI**: OpenAI API (GPT-4o-mini).

---

## ⚙ Setup Instructions

### Prerequisites
- Node.js (v16 or above)
- MySQL Server
- OpenAI API Key

### 1. Database Setup
Create the database and seed initial data:
```sql
-- Run contents of server/seed.sql in your MySQL client
CREATE DATABASE mindful_u_db;
USE mindful_u_db;
-- (Import tables from seed.sql)
```

### 2. Backend Setup
1. Navigate to `/server`.
2. Install dependencies: `npm install`.
3. Create a `.env` file with:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=mindful_u_db
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=your_jwt_secret
   ```
4. Run server: `node index.js` (Runs on port 5000).

### 3. Frontend Setup
1. Navigate to root directory.
2. Install dependencies: `npm install`.
3. Run dev server: `npm run dev`.
4. Open `http://localhost:5173` in your browser.

---

## 🚀 Status
- ✅ **Dynamic Mood Insights**: Fully integrated with real-time database fetching.
- ✅ **Mood Tracking**: Supports Mood & Energy logging.
- ✅ **AI Chat & Recommendations**: Operational.

