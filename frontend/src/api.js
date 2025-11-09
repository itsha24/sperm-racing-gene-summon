/**
 * Summon a card from the backend API
 * @param {string|null} capsuleTier - The tier of capsule to summon (Common, Rare, Epic, Mythic)
 * @returns {Promise<Object>} Card data with name, emoji, trait, flavorText, rarity, and stats
 * @throws {Error} If capsuleTier is not provided or API call fails
 */
export async function summonCard(capsuleTier = null) {
  if (capsuleTier) {
    // Use POST with capsuleTier
    const res = await fetch("http://localhost:5000/api/summon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ capsuleTier }),
    });
    if (!res.ok) {
      throw new Error(`Summon failed: ${res.statusText}`);
    }
    const data = await res.json();
    
    // Transform backend format to frontend format
    return {
      name: data.name,
      emoji: "💧", // Default emoji since backend doesn't provide it
      trait: data.quote, // Map quote to trait
      flavorText: data.quote, // Map quote to flavorText
      rarity: data.rarity || capsuleTier,
      stats: data.stats || {},
    };
  } else {
    throw new Error("Capsule tier is required for summoning");
  }
}

/**
 * Run a race simulation to determine capsule tier
 * @returns {Promise<Object>} Race result with velocity, motility, linearity, and capsuleTier
 * @throws {Error} If API call fails
 */
export async function runRace() {
  const res = await fetch("http://localhost:5000/api/race", {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Race failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}  