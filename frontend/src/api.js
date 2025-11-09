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
    console.log("Summon result:", data);
    
    // Transform backend format to frontend format
    return {
      name: data.name,
      emoji: "🧬", // Default emoji since backend doesn't provide it
      trait: data.quote, // Map quote to trait
      flavorText: data.quote, // Map quote to flavorText
      rarity: data.rarity || capsuleTier,
      stats: data.stats || {},
    };
  } else {
    // Fallback: try old endpoint or return error
    console.warn("No capsuleTier provided, summon may fail");
    throw new Error("Capsule tier is required for summoning");
  }
}

export async function runRace() {
  const res = await fetch("http://localhost:5000/api/race", {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Race failed: ${res.statusText}`);
  }
  const data = await res.json();
  console.log("Race result:", data);
  return data;
}  