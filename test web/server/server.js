import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Load environment variables ──────────────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Gemini AI Setup ─────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try multiple models in case of quota issues
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

// System prompt that shapes the AI's personality and knowledge
const SYSTEM_PROMPT = `You are a smart customer support assistant for FarmDirect — a farmer-to-consumer marketplace that connects local farmers directly with consumers.

Your role:
- Help users find fresh produce and products from local farmers.
- Answer pricing questions clearly.
- Explain the ordering process step by step.
- Suggest seasonal and fresh produce based on what's typically available.
- Guide users on delivery options and timelines.
- Be warm, friendly, and use simple language.
- Keep responses concise (2-4 sentences max unless the user asks for detail).
- Use emojis sparingly to keep the tone friendly 🌱

You know the platform offers:
- Fresh vegetables, fruits, dairy, grains, herbs, and organic products
- Direct farm-to-door delivery
- Subscription boxes for weekly fresh produce
- A rating system for farmers
- Secure online payment

If you don't know something specific, say so honestly and suggest the user contact the support team.`;

// ── Chat endpoint ───────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A valid 'message' string is required." });
    }

    // Combine system prompt with user message
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant:`;

    // Try each model until one works
    let lastError = null;
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log(`✅ Response generated using ${modelName}`);
        return res.json({ reply: text });
      } catch (err) {
        console.log(`⚠️  Model ${modelName} failed: ${err.message?.slice(0, 80)}`);
        lastError = err;
      }
    }

    // All models failed
    console.error("All models exhausted:", lastError?.message);
    return res.status(503).json({
      error: "AI service is temporarily unavailable. Please try again in a moment.",
    });
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
});

// ── Health check ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "FarmDirect AI Support Server is running 🌿" });
});

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 FarmDirect AI Server running at http://localhost:${PORT}\n`);
});
