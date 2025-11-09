import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { summonCard } from "./api";
import "./App.css";
import ParticleBurst from "./ParticleBurst";
import SpermIcon from "./SpermIcon";

function App() {
  const [card, setCard] = useState(null);
  const [opening, setOpening] = useState(false);
  const [collection, setCollection] = useState(
    JSON.parse(localStorage.getItem("spermdex") || "[]")
  );
  const [glowColor, setGlowColor] = useState("#ffffff"); // default white glow
  const [showCollection, setShowCollection] = useState(false);
  const timeoutRefs = useRef([]);

  async function handleSummon() {
    // Clear any pending timeouts from previous summons
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
    
    // Background stays neutral - never changes
    const neutralBg = "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)";
    // Ensure background is set to neutral (in case it was changed)
    document.body.style.background = neutralBg;
    document.body.style.transition = "none"; // No transitions on background
    
    setOpening(true);
    setGlowColor("#ffffff"); // Start with white glow
    const data = await summonCard();
  
    const revealDelay = 3000; // Longer, more cinematic timing
  
    // Rarity glow colors (brightness scales with rarity)
    const glowColorMap = {
      Legendary: "#ffd700", // Gold - brightest
      Epic: "#b388ff", // Purple - bright
      Rare: "#64b5f6", // Blue - medium
      Common: "#b0bec5", // Silver - dim
    };

    // Glow intensity multipliers (for brightness scaling)
    const glowIntensityMap = {
      Legendary: 1.5, // Brightest
      Epic: 1.2,
      Rare: 1.0,
      Common: 0.7, // Dimmest
    };
  
    // Step 1: Gradually transition glow to rarity color (smooth, cinematic)
    const timeout1 = setTimeout(() => {
      const rarityGlow = glowColorMap[data.rarity] || "#ffffff";
      setGlowColor(rarityGlow);
    }, revealDelay * 0.4); // 40% into animation
    timeoutRefs.current.push(timeout1);
  
    // Step 2: Reveal card with smooth cinematic easing
    const timeout2 = setTimeout(() => {
      navigator.vibrate && navigator.vibrate([50, 30, 50]); // Subtle vibration pattern
      setCard(data);
      setOpening(false);
      
      // Set final glow color
      const rarityGlow = glowColorMap[data.rarity] || "#ffffff";
      setGlowColor(rarityGlow);
  
      setCollection((prev) => {
        const updated = [...prev, data];
        localStorage.setItem("spermdex", JSON.stringify(updated));
        return updated;
      });

      // Reset glow after 4 seconds (longer for cinematic feel)
      const timeout3 = setTimeout(() => {
        setGlowColor("#ffffff");
      }, 4000);
      timeoutRefs.current.push(timeout3);
    }, revealDelay);
    timeoutRefs.current.push(timeout2);
  }

  // Ensure background stays neutral
  useEffect(() => {
    const neutralBg = "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)";
    document.body.style.background = neutralBg;
    document.body.style.transition = "none";
    
    if (!card && !opening) {
      setGlowColor("#ffffff");
    }
  }, [card, opening]);

  // Set glow color based on card rarity when displayed
  useEffect(() => {
    if (card && !opening) {
      const glowColorMap = {
        Legendary: "#ffd700",
        Epic: "#b388ff",
        Rare: "#64b5f6",
        Common: "#b0bec5",
      };
      setGlowColor(glowColorMap[card.rarity] || "#ffffff");
    }
  }, [card, opening]);
  

  function getRarityColor(rarity) {
    const glowColorMap = {
      Legendary: "#ffd700", // Gold - brightest
      Epic: "#b388ff", // Purple - bright
      Rare: "#64b5f6", // Blue - medium
      Common: "#b0bec5", // Silver - dim
    };
    return glowColorMap[rarity] || "#ffffff"; // Default to white if rarity not found
  }

  function getRarityEffect(rarity) {
    switch (rarity) {
      case "Legendary":
        return {
          background: "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)",
          color: "gold",
          text: "🌟 LEGENDARY DROP! 🌟",
        };
      case "Epic":
        return {
          background: "radial-gradient(circle, rgba(183,136,255,0.3), transparent 70%)",
          color: "#b388ff",
          text: "💜 Epic Find!",
        };
      case "Rare":
        return {
          background: "radial-gradient(circle, rgba(100,181,246,0.25), transparent 70%)",
          color: "#64b5f6",
          text: "💠 Rare Discovery!",
        };
      default:
        return null;
    }
  }  

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        width: "100%",
      }}
    >
      
      <h1 style={{ 
        marginBottom: "2rem",
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: "3.5rem",
        letterSpacing: "3px",
        textShadow: "0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)",
        background: "linear-gradient(135deg, #ffffff 0%, #a855f7 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>🧬 Gene Summon Mode</h1>
  
      {/* 💧 Capsule Animation - Cinematic bloom effect */}
      {opening && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.15, 1.05, 1.2, 1.1],
            rotate: [0, 5, -5, 3, 0],
            opacity: [0, 1, 1, 1, 1],
          }}
          transition={{
            duration: 3,
            ease: [0.25, 0.1, 0.25, 1], // Smooth cinematic easing
            repeat: Infinity,
          }}
          style={{
            fontSize: "100px",
            marginBottom: "40px",
            position: "relative",
            filter: `drop-shadow(0 0 30px ${glowColor}) drop-shadow(0 0 60px ${glowColor}88) drop-shadow(0 0 100px ${glowColor}44)`,
            textShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}88`,
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.3, 1.1, 1.4, 1.2],
              opacity: [0.3, 0.6, 0.4, 0.7, 0.5],
            }}
            transition={{
              duration: 3,
              ease: [0.25, 0.1, 0.25, 1],
              repeat: Infinity,
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glowColor}44 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          💧
        </motion.div>
      )}

      {/* Show button when no card is shown (not opening) */}
      {!card && !opening && (
        <motion.button
          onClick={handleSummon}
          disabled={opening}
          className="gradient-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: "14px 28px",
            fontSize: "1.2rem",
            borderRadius: "12px",
            marginTop: "20px",
          }}
        >
          Open Gene Capsule 💧
        </motion.button>
      )}
  

      {/* 💫 Rarity Reveal Overlay */}
    {!opening && card && getRarityEffect(card.rarity) && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: getRarityEffect(card.rarity).background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: getRarityEffect(card.rarity).color,
          fontSize: "2rem",
          fontWeight: "bold",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        {getRarityEffect(card.rarity).text}
      </motion.div>
    )}

    {!opening && card && ["Legendary", "Epic"].includes(card.rarity) && (
      <ParticleBurst color={card.rarity === "Legendary" ? "gold" : "#b388ff"} />
    )}


      {!opening && card && (
          <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1], // Smooth, cinematic easing
            delay: 0.2 
          }}      
          className="glass-card"
          style={{
            marginTop: "50px",
            display: "inline-block",
            borderRadius: "24px",
            padding: "35px 55px",
            border: `2px solid ${getRarityColor(card.rarity)}`,
            boxShadow: `
              0 0 60px ${getRarityColor(card.rarity)}66,
              0 0 120px ${getRarityColor(card.rarity)}33,
              inset 0 0 40px ${getRarityColor(card.rarity)}11
            `,
            position: "relative",
          }}
        >
          {/* Rarity glow bloom effect */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.4, 0.7, 0.5],
              scale: [1, 1.1, 1.05, 1.15, 1.1],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              right: "-20px",
              bottom: "-20px",
              borderRadius: "24px",
              background: `radial-gradient(circle at center, ${getRarityColor(card.rarity)}22 0%, transparent 70%)`,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
          <h2 style={{ fontSize: "40px", fontFamily: "'Orbitron', sans-serif", fontWeight: 700, marginBottom: "10px" }}>
            {card.emoji} {card.name}
          </h2>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: getRarityColor(card.rarity), textShadow: `0 0 10px ${getRarityColor(card.rarity)}` }}>
            <b>{card.rarity}</b>
          </p>
          <p style={{ fontSize: "1rem", fontStyle: "italic", opacity: 0.9, marginTop: "8px" }}>
            <i>{card.trait}</i>
          </p>
          <p style={{ marginTop: "12px", opacity: 0.85, lineHeight: 1.6 }}>{card.flavorText}</p>

          <div style={{ marginTop: "20px", fontSize: "14px" }}>
            <pre>{JSON.stringify(card.stats, null, 2)}</pre>
          </div>
        </motion.div>
      )}

      {/* 🎮 Button - placed under the card (consistent gradient) */}
      {!opening && card && (
        <motion.button
          onClick={handleSummon}
          disabled={opening}
          className="gradient-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: "40px",
            padding: "14px 28px",
            fontSize: "1.2rem",
            borderRadius: "12px",
          }}
        >
          Open Gene Capsule 💧
        </motion.button>
      )}

      {/* 🎮 Button - during opening animation (consistent, disabled) */}
      {opening && (
        <motion.button
          onClick={handleSummon}
          disabled={opening}
          className="gradient-button"
          style={{
            marginTop: "40px",
            padding: "14px 28px",
            fontSize: "1.2rem",
            borderRadius: "12px",
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          Summoning...
        </motion.button>
      )}

      {collection.length > 0 && (
        <div style={{ marginTop: "60px", width: "100%", maxWidth: "1200px" }}>
          <button
            onClick={() => setShowCollection(!showCollection)}
            className="glass"
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              cursor: "pointer",
              marginBottom: "20px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.12)";
              e.target.style.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.05)";
              e.target.style.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(168, 85, 247, 0.1)";
            }}
          >
            {showCollection ? "▼" : "▶"} 📘 Spermdex Collection ({collection.length})
          </button>
          
          {showCollection && (
            <div className="glass-card" style={{
              maxHeight: "400px",
              overflowY: "auto",
              padding: "20px",
              borderRadius: "16px",
            }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "15px",
                }}
              >
                {collection.map((c, i) => (
                  <div
                    key={i}
                    className="glass"
                    style={{
                      border: `2px solid ${
                        c.rarity === "Legendary"
                          ? "#ffd700"
                          : c.rarity === "Epic"
                          ? "#b388ff"
                          : c.rarity === "Rare"
                          ? "#64b5f6"
                          : "#b0bec5"
                      }`,
                      borderRadius: "12px",
                      padding: "12px",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      boxShadow: `0 4px 15px ${
                        c.rarity === "Legendary"
                          ? "rgba(255, 215, 0, 0.3)"
                          : c.rarity === "Epic"
                          ? "rgba(179, 136, 255, 0.3)"
                          : c.rarity === "Rare"
                          ? "rgba(100, 181, 246, 0.3)"
                          : "rgba(176, 190, 197, 0.2)"
                      }`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 8px 25px ${
                        c.rarity === "Legendary"
                          ? "rgba(255, 215, 0, 0.5)"
                          : c.rarity === "Epic"
                          ? "rgba(179, 136, 255, 0.5)"
                          : c.rarity === "Rare"
                          ? "rgba(100, 181, 246, 0.5)"
                          : "rgba(176, 190, 197, 0.3)"
                      }`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1) translateY(0)";
                      e.currentTarget.style.boxShadow = `0 4px 15px ${
                        c.rarity === "Legendary"
                          ? "rgba(255, 215, 0, 0.3)"
                          : c.rarity === "Epic"
                          ? "rgba(179, 136, 255, 0.3)"
                          : c.rarity === "Rare"
                          ? "rgba(100, 181, 246, 0.3)"
                          : "rgba(176, 190, 197, 0.2)"
                      }`;
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{c.emoji}</div>
                    <p style={{ margin: "4px 0", fontWeight: 600, fontSize: "0.9rem", fontFamily: "'Poppins', sans-serif" }}>{c.name}</p>
                    <p style={{ fontSize: "10px", opacity: 0.8, color: getRarityColor(c.rarity) }}>{c.rarity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;