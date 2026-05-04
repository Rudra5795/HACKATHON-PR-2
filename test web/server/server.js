import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// ── Load environment variables ───────────────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Gemini AI Setup ──────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

// ── FarmDirect Real Data ─────────────────────────────────────────
const PRODUCTS = [
  { name: "Organic Tomatoes",  category: "Vegetables", price: 40,  market: 60,  unit: "kg",     farmer: "Ramesh Patel",  badge: "Organic",      rating: 4.7, stock: 50,  emoji: "🍅", freshHours: 3  },
  { name: "Fresh Spinach",     category: "Vegetables", price: 30,  market: 45,  unit: "bunch",  farmer: "Ramesh Patel",  badge: "Fresh",        rating: 4.8, stock: 30,  emoji: "🥬", freshHours: 2  },
  { name: "Alphonso Mangoes",  category: "Fruits",     price: 350, market: 500, unit: "dozen",  farmer: "Sunita Devi",   badge: "Premium",      rating: 4.9, stock: 20,  emoji: "🥭", freshHours: 8  },
  { name: "Basmati Rice",      category: "Grains",     price: 120, market: 180, unit: "kg",     farmer: "Arjun Singh",   badge: "Staple",       rating: 4.6, stock: 100, emoji: "🍚", freshHours: 48 },
  { name: "Farm Milk",         category: "Dairy",      price: 60,  market: 80,  unit: "litre",  farmer: "Lakshmi Bai",   badge: "Fresh",        rating: 4.9, stock: 40,  emoji: "🥛", freshHours: 1  },
  { name: "Organic Carrots",   category: "Vegetables", price: 45,  market: 65,  unit: "kg",     farmer: "Ramesh Patel",  badge: "Organic",      rating: 4.5, stock: 35,  emoji: "🥕", freshHours: 5  },
  { name: "Wheat Flour",       category: "Grains",     price: 55,  market: 75,  unit: "kg",     farmer: "Arjun Singh",   badge: "Fresh Ground", rating: 4.7, stock: 80,  emoji: "🌾", freshHours: 24 },
  { name: "Paneer",            category: "Dairy",      price: 280, market: 360, unit: "kg",     farmer: "Lakshmi Bai",   badge: "Homemade",     rating: 4.8, stock: 15,  emoji: "🧀", freshHours: 4  },
  { name: "Red Onions",        category: "Vegetables", price: 35,  market: 50,  unit: "kg",     farmer: "Meena Kumari",  badge: "Farm Fresh",   rating: 4.4, stock: 60,  emoji: "🧅", freshHours: 6  },
  { name: "Green Chillies",    category: "Spices",     price: 20,  market: 35,  unit: "250g",   farmer: "Meena Kumari",  badge: "Spicy",        rating: 4.6, stock: 45,  emoji: "🌶️", freshHours: 2  },
  { name: "Fresh Coriander",   category: "Herbs",      price: 15,  market: 25,  unit: "bunch",  farmer: "Meena Kumari",  badge: "Aromatic",     rating: 4.7, stock: 50,  emoji: "🌿", freshHours: 1  },
  { name: "Shimla Apples",     category: "Fruits",     price: 180, market: 250, unit: "kg",     farmer: "Sunita Devi",   badge: "Himalayan",    rating: 4.8, stock: 25,  emoji: "🍎", freshHours: 12 },
];

const FARMERS = [
  { name: "Ramesh Patel",  location: "Nashik, Maharashtra",  specialty: "Organic Vegetables", rating: 4.8, reviews: 234, verified: true,  since: 2019 },
  { name: "Sunita Devi",   location: "Shimla, Himachal",     specialty: "Apples & Fruits",    rating: 4.9, reviews: 189, verified: true,  since: 2020 },
  { name: "Arjun Singh",   location: "Amritsar, Punjab",     specialty: "Wheat & Grains",     rating: 4.7, reviews: 312, verified: true,  since: 2018 },
  { name: "Lakshmi Bai",   location: "Anand, Gujarat",       specialty: "Fresh Dairy",        rating: 4.9, reviews: 156, verified: true,  since: 2021 },
  { name: "Kiran Kumar",   location: "Raichur, Karnataka",   specialty: "Rice & Millets",     rating: 4.6, reviews: 98,  verified: false, since: 2022 },
  { name: "Meena Kumari",  location: "Jaipur, Rajasthan",    specialty: "Spices & Herbs",     rating: 4.8, reviews: 201, verified: true,  since: 2020 },
];

// ── Local Intent Engine (no API calls for common questions) ──────
const INTENTS = [
  {
    match: /^(hi+|hey+|hello+|hii+|helo|namaste|howdy|yo|sup|good\s*(morning|evening|afternoon))[\s!.]*$/i,
    reply: () => "Hey there! 👋 Welcome to FarmDirect! I can help you find fresh produce, check prices, or answer questions about delivery. What are you looking for today? 🌿",
  },
  {
    match: /best deal|cheapest|save money|discount|offer|cheap|value/i,
    reply: () =>
      "Here are our best deals right now 🔥\n\n" +
      PRODUCTS.slice().sort((a, b) => (b.market - b.price) - (a.market - a.price)).slice(0, 5)
        .map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit} (save ₹${p.market - p.price} vs market!)`).join("\n") +
      "\n\nAll products are 20–40% cheaper than market because we connect you directly to farmers! 🌾",
  },
  {
    match: /what.*fresh|fresh.*today|available.*today|today.*available|harvested/i,
    reply: () => {
      const fresh = PRODUCTS.filter(p => p.freshHours <= 6).sort((a, b) => a.freshHours - b.freshHours);
      return "Here's what's freshly harvested today 🌅\n\n" +
        fresh.map(p => `${p.emoji} ${p.name} — ${p.freshHours === 1 ? "just 1 hour" : p.freshHours + " hours"} ago!`).join("\n") +
        "\n\nAll delivered farm-to-door same day if ordered before 10 AM! 🚚";
    },
  },
  {
    match: /organic|pesticide.?free|natural|chemical.?free/i,
    reply: () => {
      const organic = PRODUCTS.filter(p => p.badge === "Organic");
      return "Our certified organic products 🌱\n\n" +
        organic.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit} (by ${p.farmer})`).join("\n") +
        "\n\nGrown without chemicals or pesticides by our verified farmers!";
    },
  },
  {
    match: /deliver|shipping|how.*get|when.*arriv|same.?day|next.?day|dispatch/i,
    reply: () => "Here's how delivery works at FarmDirect 🚚\n\n✅ Same-day delivery for orders before 10 AM\n✅ Next-day delivery for later orders\n✅ Direct from farm — no middlemen!\n✅ Currently serving Gurugram, Haryana\n✅ Expanding to more cities soon\n\nFresh produce reaches you within hours of harvest! 🌾",
  },
  {
    match: /pay|payment|upi|card|how.*pay|cash|gpay|phonepe|paytm|net.?banking/i,
    reply: () => "We accept all major payment methods 💳\n\n✅ UPI (GPay, PhonePe, Paytm)\n✅ Credit & Debit Cards\n✅ Net Banking\n✅ Cash on Delivery (select areas)\n\nAll payments are 100% secure and encrypted! 🔒",
  },
  {
    match: /farmer|who.*grow|who.*sell|grower|producer/i,
    reply: () => "Our amazing verified farmers 👨‍🌾\n\n" +
      FARMERS.map(f => `${f.verified ? "✅" : "🔸"} ${f.name} — ${f.location} | ${f.specialty} | ⭐${f.rating} (${f.reviews} reviews)`).join("\n") +
      "\n\nAll top farmers are 4.5+ rated and quality verified!",
  },
  {
    match: /vegetable|veggie|sabzi|sabji|greens/i,
    reply: () => {
      const veggies = PRODUCTS.filter(p => p.category === "Vegetables");
      return "Our fresh vegetables 🥬\n\n" +
        veggies.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit}`).join("\n") +
        "\n\nAll harvested within hours and delivered same day!";
    },
  },
  {
    match: /fruit|mango|apple|aam|seb/i,
    reply: () => {
      const fruits = PRODUCTS.filter(p => p.category === "Fruits");
      return "Our fresh fruits 🍎\n\n" +
        fruits.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit} (⭐${p.rating})`).join("\n") +
        "\n\nSeasonal picks directly from the orchards!";
    },
  },
  {
    match: /dairy|milk|paneer|doodh|cheese|curd|dahi/i,
    reply: () => {
      const dairy = PRODUCTS.filter(p => p.category === "Dairy");
      return "Our fresh dairy products 🥛\n\n" +
        dairy.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit} | ${p.badge}`).join("\n") +
        "\n\nFrom Lakshmi Bai's farm in Anand, Gujarat — rated ⭐4.9!";
    },
  },
  {
    match: /grain|rice|wheat|flour|atta|chawal|basmati/i,
    reply: () => {
      const grains = PRODUCTS.filter(p => p.category === "Grains");
      return "Our grains & staples 🌾\n\n" +
        grains.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit}`).join("\n") +
        "\n\nSourced from Arjun Singh's farm in Amritsar, Punjab — rated ⭐4.7!";
    },
  },
  {
    match: /spice|herb|masala|mirch|chilli|coriander|dhania|dhaniya/i,
    reply: () => {
      const items = PRODUCTS.filter(p => p.category === "Spices" || p.category === "Herbs");
      return "Our fresh spices & herbs 🌿\n\n" +
        items.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit}`).join("\n") +
        "\n\nAll from Meena Kumari's farm in Jaipur — rated ⭐4.8!";
    },
  },
  {
    match: /subscri|weekly|box|monthly|regular/i,
    reply: () => "We offer weekly subscription boxes 📦\n\nGet a curated box of fresh seasonal produce delivered every week directly from our farmers. You save more and never run out of fresh veggies!\n\nVisit our Shop page or contact support to set up your subscription 🌱",
  },
  {
    match: /price|cost|rate|how.?much|kitna|list|all product/i,
    reply: () => "Complete price guide 💰\n\n" +
      PRODUCTS.map(p => `${p.emoji} ${p.name} — ₹${p.price}/${p.unit}`).join("\n") +
      "\n\nAll prices are 20–40% below market rate! 🌾",
  },
  {
    match: /thank|thanks|shukriya|dhanyawad|great|awesome|nice|good bot/i,
    reply: () => "You're welcome! 😊 Happy shopping at FarmDirect — fresh from the farm to your door! 🌿 Let me know if you need anything else.",
  },
  {
    match: /help|support|contact|what can you|what do you|menu|options/i,
    reply: () => "I'm here to help! 🙋 You can ask me about:\n\n• 🛒 Products & Prices\n• 🚚 Delivery & Shipping\n• 👨‍🌾 Our Farmers\n• 💳 Payment Options\n• 🌱 Organic Products\n• 📦 Weekly Subscriptions\n• 🔥 Best Deals\n• 🌅 What's Fresh Today\n\nJust ask away! 🌿",
  },
];

const matchIntent = (msg) => {
  const text = msg.trim();
  for (const intent of INTENTS) {
    if (intent.match.test(text)) return intent.reply();
  }
  return null;
};

// ── System Prompt (for Gemini — complex questions only) ──────────
const buildCatalog = () => PRODUCTS.map(p =>
  `${p.emoji} ${p.name} (${p.category}) — ₹${p.price}/${p.unit} [Market: ₹${p.market}] | ⭐${p.rating} | Farmer: ${p.farmer} | Stock: ${p.stock}`
).join("\n");

const buildFarmers = () => FARMERS.map(f =>
  `👨‍🌾 ${f.name} — ${f.location} | ${f.specialty} | ⭐${f.rating} (${f.reviews} reviews) | Since ${f.since} | ${f.verified ? "✅ Verified" : "Unverified"}`
).join("\n");

const SYSTEM_PROMPT = `You are a helpful AI assistant for FarmDirect — a farm-to-consumer marketplace in India.
Be warm, concise (2-3 sentences), and use emojis. Always use real data below.

PRODUCTS:
${buildCatalog()}

FARMERS:
${buildFarmers()}

PLATFORM: Delivery same-day (orders before 10AM), Gurugram HR. Payment: UPI/cards/net-banking. 20-40% cheaper than market.
RULE: Only use prices from the catalog above. Never make up information.`;

// ── Chat Endpoint ────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A valid 'message' string is required." });
    }

    // 1️⃣ Local intent match — instant, zero quota used
    const local = matchIntent(message);
    if (local) {
      console.log(`✅ [LOCAL] "${message.slice(0, 40)}"`);
      return res.json({ reply: local });
    }

    // 2️⃣ Gemini API for complex/unknown questions
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant:`;
    let lastError = null;
    let hitQuota = false;

    for (const modelName of MODELS) {
      try {
        const response = await genAI.models.generateContent({ model: modelName, contents: prompt });
        console.log(`✅ [GEMINI:${modelName}] "${message.slice(0, 40)}"`);
        return res.json({ reply: response.text });
      } catch (err) {
        const msg = err.message || "";
        console.warn(`⚠️  ${modelName}: ${msg.slice(0, 80)}`);
        if (msg.includes("429") || msg.includes("quota")) hitQuota = true;
        lastError = err;
      }
    }

    // 3️⃣ Quota fallback — still give a useful answer
    console.error("All models exhausted:", lastError?.message?.slice(0, 100));
    if (hitQuota) {
      return res.json({
        reply: "I'm at capacity right now 🌿 But here's what I know: FarmDirect offers 12 fresh products — vegetables, fruits, dairy, grains & herbs — all 20–40% cheaper than market price. Try asking about a specific product, deals, or delivery and I'll answer instantly! 🚜",
      });
    }
    return res.status(503).json({ error: "AI service is temporarily unavailable. Please try again." });

  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── Health check ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "FarmDirect AI Server running 🌿" });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 FarmDirect AI Server running at http://localhost:${PORT}\n`);
});
