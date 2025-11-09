const express = require("express");
const cors = require("cors");
const spermCards = require("./data/spermCards.json");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Weighted rarity probabilities (more balanced distribution)
const rarityWeights = { Common: 50, Rare: 30, Epic: 15, Legendary: 5 };

// Helper to pick rarity
function pickRandomRarity() {
  const total = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;
  let acc = 0;
  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    acc += weight;
    if (rand < acc) return rarity;
  }
  return "Common";
}

// Random summon endpoint
app.get("/summon", (req, res) => {
  const rarity = pickRandomRarity();
  const options = spermCards.filter((c) => c.rarity === rarity);
  const card = options[Math.floor(Math.random() * options.length)];
  res.json(card);
});

// List all cards (for Spermdex)
app.get("/cards", (req, res) => {
  res.json(spermCards);
});

// Test endpoint to check rarity distribution
app.get("/test-rarity", (req, res) => {
  const testCount = 1000;
  const results = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 };
  
  for (let i = 0; i < testCount; i++) {
    const rarity = pickRandomRarity();
    results[rarity]++;
  }
  
  res.json({
    testCount,
    results,
    percentages: {
      Common: ((results.Common / testCount) * 100).toFixed(1) + "%",
      Rare: ((results.Rare / testCount) * 100).toFixed(1) + "%",
      Epic: ((results.Epic / testCount) * 100).toFixed(1) + "%",
      Legendary: ((results.Legendary / testCount) * 100).toFixed(1) + "%",
    },
    expected: {
      Common: "50%",
      Rare: "30%",
      Epic: "15%",
      Legendary: "5%",
    }
  });
});

app.get("/", (req, res) => {
  res.send("🧬 Gene Summon API is running! Try /summon or /cards");
});

app.listen(PORT, () =>
  console.log(`🧬 Gene Summon API running on http://localhost:${PORT}`)
);