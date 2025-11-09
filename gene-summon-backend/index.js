const express = require("express");
const cors = require("cors");
const spermCards = require("./data/spermCards.json");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Base weighted rarity probabilities (used when no capsuleTier)
const baseRarityWeights = { Common: 50, Rare: 30, Epic: 15, Legendary: 5 };

// Capsule tier-based rarity odds
const rarityOdds = {
  Common: { Common: 0.7, Rare: 0.2, Epic: 0.08, Legendary: 0.02 },
  Rare: { Common: 0.5, Rare: 0.3, Epic: 0.15, Legendary: 0.05 },
  Epic: { Common: 0.3, Rare: 0.4, Epic: 0.2, Legendary: 0.1 },
  Mythic: { Common: 0.1, Rare: 0.2, Epic: 0.3, Legendary: 0.4 },
};

// Helper to pick rarity with optional capsuleTier bias
function pickRandomRarity(capsuleTier = null) {
  if (capsuleTier && rarityOdds[capsuleTier]) {
    // Use capsule tier odds
    const odds = rarityOdds[capsuleTier];
    const rand = Math.random();
    let acc = 0;
    for (const [rarity, probability] of Object.entries(odds)) {
      acc += probability;
      if (rand < acc) return rarity;
    }
    return "Common";
  } else {
    // Use base weights (backward compatibility)
    const total = Object.values(baseRarityWeights).reduce((a, b) => a + b, 0);
    const rand = Math.random() * total;
    let acc = 0;
    for (const [rarity, weight] of Object.entries(baseRarityWeights)) {
      acc += weight;
      if (rand < acc) return rarity;
    }
    return "Common";
  }
}

// Race simulation endpoint
app.post("/api/race", (req, res) => {
  const velocity = Math.floor(Math.random() * 71) + 30; // 30-100
  const motility = Math.floor(Math.random() * 51) + 50; // 50-100
  const linearity = parseFloat((Math.random() * 1).toFixed(2)); // 0.00-1.00

  let capsuleTier = "Common";
  if (motility > 85) capsuleTier = "Mythic";
  else if (motility > 75) capsuleTier = "Epic";
  else if (motility > 65) capsuleTier = "Rare";

  res.json({ velocity, motility, linearity, capsuleTier });
});

// Random summon endpoint (GET - backward compatible)
app.get("/summon", (req, res) => {
  const rarity = pickRandomRarity();
  const options = spermCards.filter((c) => c.rarity === rarity);
  const card = options[Math.floor(Math.random() * options.length)];
  res.json(card);
});

// Summon endpoint (POST - accepts capsuleTier)
app.post("/api/summon", (req, res) => {
  const { capsuleTier } = req.body || {};
  const rarity = pickRandomRarity(capsuleTier);
  const options = spermCards.filter((c) => c.rarity === rarity);
  const card = options[Math.floor(Math.random() * options.length)];
  res.json(card);
});

// List all cards (for Spermdex)
app.get("/cards", (req, res) => {
  res.json(spermCards);
});

app.get("/", (req, res) => {
  res.send("🧬 Gene Summon API is running! Try /summon or /cards");
});

app.listen(PORT, () =>
  console.log(`🧬 Gene Summon API running on http://localhost:${PORT}`)
);