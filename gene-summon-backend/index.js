import express from "express";
import cors from "cors";
import { capsuleRates, sperms } from "./sperms.js";
import { weightedRandomSelect } from "./utils/random.js";

const app = express();
app.use(express.json());

// CORS configuration - allow both production (Vercel) and local development
const allowedOrigins = [
  "https://sperm-racing-gene-summon.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174", // Vite sometimes uses 5174 if 5173 is taken
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Helper to determine capsule tier from race performance
function determineCapsuleTier(velocity, motility, linearity) {
  const average = (velocity + motility + linearity) / 3;

  if (average > 90) return "Mythic";
  if (average > 70) return "Epic";
  if (average > 50) return "Rare";
  return "Common";
}

// ✅ Race endpoint - simulates sperm performance
app.get("/api/race", (req, res) => {
  const velocity = Math.floor(Math.random() * 100);
  const motility = Math.floor(Math.random() * 100);
  const linearity = Math.floor(Math.random() * 100);

  const capsuleTier = determineCapsuleTier(velocity, motility, linearity);

  res.json({ velocity, motility, linearity, capsuleTier });
});

// ✅ Summon endpoint - picks sperm based on capsule tier
app.post("/api/summon", (req, res) => {
  try {
    const { capsuleTier } = req.body;

    const pool = sperms[capsuleTier];
    if (!pool) return res.status(400).json({ error: "Invalid capsule tier" });

    const sperm = weightedRandomSelect(pool);

    const stats = {
      speed: Math.floor(Math.random() * 100),
      focus: Math.floor(Math.random() * 100),
      endurance: Math.floor(Math.random() * 100),
      chaos: Math.floor(Math.random() * 100)
    };

    res.json({ ...sperm, rarity: capsuleTier, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summon failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));