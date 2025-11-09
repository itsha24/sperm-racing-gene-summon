import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { summonCard, runRace } from "./api";
import "./App.css";
import ParticleBurst from "./ParticleBurst";
import SpermIcon from "./SpermIcon";

function App() {
  const [card, setCard] = useState(null);
  const [opening, setOpening] = useState(false);
  const [collection, setCollection] = useState(
    JSON.parse(localStorage.getItem("spermdex") || "[]")
  );
  const [glowColor, setGlowColor] = useState("#b0bec5"); // default Common (silver) glow - creates anticipation
  const [showCollection, setShowCollection] = useState(false);
  const timeoutRefs = useRef([]);
  
  // Race simulation state
  const [raceResult, setRaceResult] = useState(null);
  const [runningRace, setRunningRace] = useState(false);

  async function handleRunRace() {
    // Clear previous card and race result when starting a new race
    setCard(null);
    setRaceResult(null);
    setRunningRace(true);
    try {
      const result = await runRace();
      if (result && result.capsuleTier) {
        setRaceResult(result);
      } else {
        console.error("Invalid race result:", result);
        alert("Failed to run race. Please check if the backend is running.");
      }
    } catch (error) {
      console.error("Race simulation failed:", error);
      alert("Failed to connect to race endpoint. Please check if the backend is running on port 4000.");
    } finally {
      setRunningRace(false);
    }
  }

  async function handleSummon(capsuleTier = null) {
    // Clear any pending timeouts from previous summons
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
    
    // Background stays neutral - never changes
    const neutralBg = "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)";
    // Ensure background is set to neutral (in case it was changed)
    document.body.style.background = neutralBg;
    document.body.style.transition = "none"; // No transitions on background
    
    setOpening(true);
    setGlowColor("#b0bec5"); // Start with Common (silver) glow - creates anticipation
    const data = await summonCard(capsuleTier);
  
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
        setGlowColor("#b0bec5"); // Reset to Common (silver) - default anticipation color
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
      setGlowColor("#b0bec5"); // Reset to Common (silver) - default anticipation color
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
      setGlowColor(glowColorMap[card.rarity] || "#b0bec5");
    }
  }, [card, opening]);
  

  function getRarityColor(rarity) {
    const glowColorMap = {
      Legendary: "#ffd700", // Gold - brightest
      Mythic: "#ffd700", // Mythic uses same as Legendary
      Epic: "#b388ff", // Purple - bright
      Rare: "#64b5f6", // Blue - medium
      Common: "#b0bec5", // Silver - dim
    };
    return glowColorMap[rarity] || "#b0bec5"; // Default to Common (silver) if rarity not found
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
        contain: "layout style",
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

      {/* Race Simulation Section */}
      {!opening && (
        <div style={{ marginBottom: "40px", width: "100%", maxWidth: "600px" }}>
          <motion.button
            onClick={handleRunRace}
            disabled={runningRace || opening}
            className="gradient-button"
            whileHover={!runningRace ? { scale: 1.05, y: -2 } : {}}
            whileTap={!runningRace ? { scale: 0.98 } : {}}
            style={{
              padding: "14px 28px",
              fontSize: "1.1rem",
              borderRadius: "12px",
              marginBottom: "20px",
              opacity: runningRace ? 0.6 : 1,
              cursor: runningRace ? "not-allowed" : "pointer",
            }}
          >
            {runningRace ? "Analyzing..." : "🏃 Run Race"}
          </motion.button>

          {/* Animated loader during race simulation */}
          {runningRace && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card"
              style={{
                padding: "30px",
                borderRadius: "16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                }}
              >
                🧬
              </motion.div>
              <p style={{ 
                fontFamily: "'Orbitron', sans-serif", 
                fontSize: "1rem",
                opacity: 0.8,
                letterSpacing: "2px"
              }}>
                Analyzing Sperm Data...
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{
                  height: "3px",
                  background: "linear-gradient(90deg, #9333ea, #64b5f6)",
                  borderRadius: "2px",
                  marginTop: "15px",
                }}
              />
            </motion.div>
          )}

          {raceResult && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                type: "spring",
                stiffness: 100
              }}
              className="glass-card"
              style={{
                padding: "25px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h3 style={{ fontFamily: "'Orbitron', sans-serif", marginBottom: "15px", fontSize: "1.3rem" }}>
                Race Results
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "5px" }}>Velocity</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{raceResult.velocity}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "5px" }}>Motility</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{raceResult.motility}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "5px" }}>Linearity</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{raceResult.linearity}</p>
                </div>
              </div>
              {/* Glowing Capsule Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${
                    raceResult.capsuleTier === "Mythic" ? "rgba(255, 215, 0, 0.2)" :
                    raceResult.capsuleTier === "Epic" ? "rgba(179, 136, 255, 0.2)" :
                    raceResult.capsuleTier === "Rare" ? "rgba(100, 181, 246, 0.2)" :
                    "rgba(176, 190, 197, 0.2)"
                  }, transparent)`,
                  border: `2px solid ${
                    raceResult.capsuleTier === "Mythic" ? "#ffd700" :
                    raceResult.capsuleTier === "Epic" ? "#b388ff" :
                    raceResult.capsuleTier === "Rare" ? "#64b5f6" :
                    "#b0bec5"
                  }`,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: `0 0 30px ${
                    raceResult.capsuleTier === "Mythic" ? "rgba(255, 215, 0, 0.4)" :
                    raceResult.capsuleTier === "Epic" ? "rgba(179, 136, 255, 0.4)" :
                    raceResult.capsuleTier === "Rare" ? "rgba(100, 181, 246, 0.4)" :
                    "rgba(176, 190, 197, 0.4)"
                  }`,
                }}
              >
                <motion.div
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: `radial-gradient(circle, ${
                      raceResult.capsuleTier === "Mythic" ? "rgba(255, 215, 0, 0.25)" :
                      raceResult.capsuleTier === "Epic" ? "rgba(179, 136, 255, 0.25)" :
                      raceResult.capsuleTier === "Rare" ? "rgba(100, 181, 246, 0.25)" :
                      "rgba(176, 190, 197, 0.25)"
                    }, transparent)`,
                    pointerEvents: "none",
                    willChange: "transform, opacity",
                  }}
                />
                <p style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "8px", letterSpacing: "1px" }}>
                  CAPSULE TIER
                </p>
                <p style={{ 
                  fontSize: "2rem", 
                  fontWeight: 700,
                  fontFamily: "'Orbitron', sans-serif",
                  color: getRarityColor(raceResult.capsuleTier === "Mythic" ? "Legendary" : raceResult.capsuleTier),
                  textShadow: `0 0 15px ${getRarityColor(raceResult.capsuleTier === "Mythic" ? "Legendary" : raceResult.capsuleTier)}`,
                  position: "relative",
                  zIndex: 1,
                }}>
                  {raceResult.capsuleTier}
                </p>
              </motion.div>
            </motion.div>
          )}

          {raceResult && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
              <motion.button
                onClick={() => handleSummon(raceResult.capsuleTier)}
                disabled={opening}
                className="gradient-button"
                whileHover={!opening ? { scale: 1.05, y: -2 } : {}}
                whileTap={!opening ? { scale: 0.98 } : {}}
                style={{
                  padding: "14px 28px",
                  fontSize: "1.2rem",
                  borderRadius: "12px",
                  opacity: opening ? 0.6 : 1,
                  cursor: opening ? "not-allowed" : "pointer",
                }}
              >
                {opening ? "Sequencing..." : "🧬 Sequence Capsule"}
              </motion.button>
              <motion.button
                onClick={() => {
                  setRaceResult(null);
                  setCard(null);
                }}
                disabled={opening}
                className="gradient-button"
                whileHover={!opening ? { scale: 1.05, y: -2 } : {}}
                whileTap={!opening ? { scale: 0.98 } : {}}
                style={{
                  padding: "14px 20px",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  opacity: opening ? 0.6 : 1,
                  cursor: opening ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #666 0%, #444 100%)",
                }}
              >
                Reset
              </motion.button>
            </div>
          )}
        </div>
      )}
  
      {/* 🧬 DNA Capsule Animation - Premium buildup */}
      {opening && (
        <motion.div
          style={{
            marginBottom: "40px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* DNA Capsule Icon - Optimized */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{
              fontSize: "120px",
              position: "relative",
              filter: `drop-shadow(0 0 30px ${glowColor})`,
              textShadow: `0 0 40px ${glowColor}`,
              willChange: "transform, filter",
            }}
          >
            🧬
          </motion.div>
          
          {/* Single Background Glow - Optimized */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "350px",
              height: "350px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
              pointerEvents: "none",
              zIndex: -1,
              willChange: "transform, opacity",
            }}
          />
        </motion.div>
      )}
      
      {/* Legacy 💧 Animation (hidden but kept for compatibility) */}
      {false && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.15, 1.05, 1.2, 1.1],
            rotate: [0, 5, -5, 3, 0],
            opacity: [0, 1, 1, 1, 1],
          }}
          transition={{
            duration: 3,
            ease: [0.25, 0.1, 0.25, 1],
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

      {/* Show button when no card is shown and no race result (backward compatibility) */}
      {!card && !opening && !raceResult && (
        <motion.button
          onClick={() => handleSummon()}
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
          initial={{ opacity: 0, scale: 0.7, y: 50, rotateX: -15 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1],
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2 
          }}
          whileHover={{
            scale: 1.02,
            rotateY: 5,
            rotateX: 2,
            transition: { duration: 0.3 }
          }}
          className="glass-card"
          style={{
            marginTop: "50px",
            display: "inline-block",
            borderRadius: "24px",
            padding: "40px 50px",
            border: `3px solid ${getRarityColor(card.rarity)}`,
            boxShadow: `
              0 0 40px ${getRarityColor(card.rarity)}66,
              0 20px 60px rgba(0, 0, 0, 0.4)
            `,
            position: "relative",
            maxWidth: "500px",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Rarity glow bloom effect - Optimized */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
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
              willChange: "transform, opacity",
            }}
          />
          {/* Card Name - Big and Stylized */}
          <h2 style={{ 
            fontSize: "42px", 
            fontFamily: "'Orbitron', sans-serif", 
            fontWeight: 700, 
            marginBottom: "15px",
            background: `linear-gradient(135deg, #ffffff 0%, ${getRarityColor(card.rarity)} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: `0 0 20px ${getRarityColor(card.rarity)}44`,
          }}>
            {card.emoji} {card.name}
          </h2>
          
          {/* Rarity Badge - Colored Pill */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            style={{
              display: "inline-block",
              padding: "8px 20px",
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${getRarityColor(card.rarity)}dd, ${getRarityColor(card.rarity)}aa)`,
              border: `2px solid ${getRarityColor(card.rarity)}`,
              boxShadow: `0 0 20px ${getRarityColor(card.rarity)}66`,
              marginBottom: "15px",
            }}
          >
            <p style={{ 
              fontSize: "0.95rem", 
              fontWeight: 700, 
              color: "#ffffff",
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: "1px",
              margin: 0,
              textShadow: `0 0 10px rgba(0, 0, 0, 0.5)`,
            }}>
              {card.rarity.toUpperCase()}
            </p>
          </motion.div>
          
          {/* Trait */}
          <p style={{ 
            fontSize: "1rem", 
            fontStyle: "italic", 
            opacity: 0.85, 
            marginTop: "12px",
            fontFamily: "'Poppins', sans-serif",
            color: getRarityColor(card.rarity),
          }}>
            {card.trait}
          </p>
          
          {/* Flavor Text */}
          <p style={{ 
            marginTop: "16px", 
            opacity: 0.75, 
            lineHeight: 1.7,
            fontSize: "0.95rem",
            fontFamily: "'Poppins', sans-serif",
            fontStyle: "italic",
          }}>
            "{card.flavorText}"
          </p>

          {/* Stats Grid - Clean Layout */}
          {card.stats && (
            <div style={{ 
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              padding: "16px",
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "12px",
              border: `1px solid ${getRarityColor(card.rarity)}33`,
            }}>
              {Object.entries(card.stats).map(([key, value], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  style={{
                    textAlign: "left",
                  }}
                >
                  <p style={{ 
                    fontSize: "0.75rem", 
                    opacity: 0.7, 
                    marginBottom: "4px",
                    fontFamily: "'Poppins', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    {key}
                  </p>
                  <p style={{ 
                    fontSize: "1.2rem", 
                    fontWeight: 600,
                    color: getRarityColor(card.rarity),
                    fontFamily: "'Orbitron', sans-serif",
                  }}>
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 🎮 Button - placed under the card (consistent gradient) */}
      {!opening && card && !raceResult && (
        <motion.button
          onClick={() => handleSummon()}
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card" 
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                padding: "24px",
                borderRadius: "20px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "18px",
                }}
              >
                {collection.map((c, i) => {
                  const isMythic = c.rarity === "Legendary" || c.rarity === "Mythic";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.08, y: -5, z: 10 }}
                      className="glass"
                      style={{
                        border: `2px solid ${getRarityColor(c.rarity)}`,
                        borderRadius: "16px",
                        padding: "16px",
                        textAlign: "center",
                        position: "relative",
                        cursor: "pointer",
                        boxShadow: `0 4px 20px ${getRarityColor(c.rarity)}44`,
                        overflow: "visible",
                      }}
                      onMouseEnter={(e) => {
                        const tooltip = e.currentTarget.querySelector('.card-tooltip');
                        if (tooltip) {
                          tooltip.style.opacity = '1';
                          tooltip.style.transform = 'translateX(-50%) translateY(0) scale(1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector('.card-tooltip');
                        if (tooltip) {
                          tooltip.style.opacity = '0';
                          tooltip.style.transform = 'translateX(-50%) translateY(10px) scale(0.8)';
                        }
                      }}
                    >
                      {/* Shimmer effect for Mythic cards - Optimized */}
                      {isMythic && (
                        <motion.div
                          animate={{
                            x: ["-100%", "200%"],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 2,
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "50%",
                            height: "100%",
                            background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)`,
                            pointerEvents: "none",
                            borderRadius: "16px",
                            willChange: "transform",
                          }}
                        />
                      )}
                      
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>{c.emoji}</div>
                      <p style={{ 
                        margin: "6px 0", 
                        fontWeight: 600, 
                        fontSize: "0.95rem", 
                        fontFamily: "'Poppins', sans-serif",
                        color: "#ffffff",
                      }}>
                        {c.name}
                      </p>
                      <p style={{ 
                        fontSize: "0.75rem", 
                        opacity: 0.9, 
                        color: getRarityColor(c.rarity),
                        fontFamily: "'Orbitron', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                      }}>
                        {c.rarity}
                      </p>
                      
                      {/* Hover Tooltip */}
                      <div
                        className="card-tooltip"
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 10px)",
                          left: "50%",
                          transform: "translateX(-50%) translateY(10px)",
                          background: "rgba(0, 0, 0, 0.95)",
                          backdropFilter: "blur(10px)",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: `2px solid ${getRarityColor(c.rarity)}`,
                          minWidth: "200px",
                          maxWidth: "250px",
                          pointerEvents: "none",
                          zIndex: 1000,
                          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${getRarityColor(c.rarity)}44`,
                          opacity: 0,
                          transform: "translateX(-50%) translateY(10px) scale(0.8)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <p style={{ 
                          fontSize: "0.85rem", 
                          opacity: 0.8, 
                          marginBottom: "8px",
                          fontStyle: "italic",
                          whiteSpace: "normal",
                        }}>
                          {c.flavorText}
                        </p>
                        {c.stats && (
                          <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(2, 1fr)", 
                            gap: "8px",
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: `1px solid ${getRarityColor(c.rarity)}33`,
                          }}>
                            {Object.entries(c.stats).map(([key, value]) => (
                              <div key={key}>
                                <p style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: "2px" }}>{key}</p>
                                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: getRarityColor(c.rarity) }}>
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;