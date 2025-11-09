# 💦 Sperm Racing: Gene Summon  

## 🧠 Overview  
Sperm Racing: Gene Summon is a hilarious gacha style collectible feature built for the Sperm Racing app. Players race sperm samples, earn DNA Capsules, and summon sperm heroes with unique personalities, stats, and rarities.  

The feature turns biology into a fun, shareable experience that feels like Pokémon meets Genshin Impact meets a late night science lab.  

## 🎮 How It Works  
1. Win sperm races in the Sperm Racing app to earn DNA Capsules.  
2. Open a capsule to summon a sperm hero through a dramatic animation.  
3. Watch the reveal to see your swimmer’s rarity, stats, and lore.  
4. Save your collection in the local Spermdex and show off your rarest swimmers.  

Capsule quality is influenced by performance and motility. Higher tier capsules contain rarer and more legendary sperm heroes, each with their own funny names and backstories.  

## ✨ Features  

**🎞 Animated Summon Experience**  
Smooth rarity based animations powered by Framer Motion that build suspense and excitement before the reveal.  

**🧬 Hilarious Collectible Characters**  
From Turbo Tail Tom to The Chosen One, each sperm has custom lore, rarity, and personality. Even within rarities, some swimmers are harder to obtain, creating a rarity within rarity effect.  

**🔊 Sound Enhanced Pulls**  
Each rarity tier includes unique sound effects, ranging from goofy to dramatic, adding humor and impact to every summon.  

**📖 Spermdex Collection**  
Players can view all collected swimmers locally, stored via browser storage for quick access and bragging rights.  

**⚙️ Full Stack Deployment**  
A live backend powers all rarity and summon logic, with the frontend connected seamlessly for real time pulls and reveals.  

## 🧩 Tech Stack  

Frontend: React, Vite, Framer Motion  
Backend: Node.js, Express  
Hosting: Render for backend and Vercel for frontend  

## 🧱 Architecture  

The project uses a simple two tier structure.  

**Frontend on Vercel**  
Handles animations, user interaction, and UI. Communicates with the backend through REST APIs to retrieve summon data and update the Spermdex.  

**Backend on Render**  
Generates random sperm heroes, applies rarity weighting, and returns sperm data to the frontend for animated display.  

## 🌐 Live Demo  

https://sperm-racing-gene-summon.vercel.app  

## 🧩 Challenges  

Most of the challenges came from planning and polishing the visual experience. Getting the timing of animations, transitions between rarity colors, and the summon flow to feel smooth and satisfying took several iterations.  

Syncing state changes with reveal animations without breaking the flow was tricky. Small changes in timing sometimes caused janky transitions, so dialing that in took careful tweaking.  

## 🏆 Accomplishments  

We are proud of how polished the final experience feels, from the clean animation flow and rarity based sound effects to the smooth UI and collection system.  

We also love that the project leans fully into the Sperm Racing theme while still feeling like a real, cohesive feature rather than just a joke. It is funny, playful, and still genuinely satisfying to interact with.  

## 📚 What We Learned  

We learned how to ship a full stack project under hackathon pressure, how to integrate animation libraries like Framer Motion effectively, and how to manage more complex state transitions in React.  

We also learned how powerful humor can be for turning a scientific concept into something approachable and memorable.  

## 🚀 What’s Next  

Connect Gene Summon directly to real sperm motility data from the Sperm Racing kit so better samples produce higher tier capsules and rarer swimmers.  

Add more sperm heroes, event based capsules, and playful themes such as Winter Wigglers or other seasonal sets.  

Explore leaderboards or sharing features so people can compare their rarest pulls.  

## 🧪 Run Locally  

### Clone the repository  
```bash
git clone https://github.com/yourusername/sperm-racing-gene-summon.git
```

### Backend setup  
```bash
cd gene-summon-backend
npm install
npm start
```
Backend runs on  
http://localhost:5000  

### Frontend setup  
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on  
http://localhost:5173  
