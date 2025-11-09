export async function summonCard(capsuleTier = null) {
  if (capsuleTier) {
    // Use POST with capsuleTier
    const res = await fetch("http://localhost:4000/api/summon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ capsuleTier }),
    });
    return res.json();
  } else {
    // Use GET (backward compatible)
    const res = await fetch("http://localhost:4000/summon");
    return res.json();
  }
}

export async function runRace() {
  const res = await fetch("http://localhost:4000/api/race", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}  