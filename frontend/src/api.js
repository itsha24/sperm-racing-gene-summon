export async function summonCard() {
    const res = await fetch("http://localhost:4000/summon");
    return res.json();
  }  