import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { summonCard, runRace } from "./api";
import "./App.css";
import ParticleBurst from "./ParticleBurst";
import SpermIcon from "./SpermIcon";
import { playRaritySound, playRegularSound, isMuted, toggleMute } from "./soundPlayer";

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
  
  // Spermdex view mode state
  const [viewMode, setViewMode] = useState("summon"); // "summon" or "spermdex"
  const [selectedSperm, setSelectedSperm] = useState(null); // For modal details
  
  // Audio mute state
  const [muted, setMuted] = useState(isMuted());
  
  // Update mute state when it changes
  const handleToggleMute = () => {
    const newMutedState = toggleMute();
    setMuted(newMutedState);
  };

  async function handleRunRace() {
    // Clear previous card and race result when starting a new race
    setCard(null);
    setRaceResult(null);
    setRunningRace(true);
    
    // Minimum display time for loader (ensures it's visible)
    const minDisplayTime = 1500; // 1.5 seconds
    const startTime = Date.now();
    
    try {
      const result = await runRace();
      if (result && result.capsuleTier) {
        console.log("Race result:", result);
        
        // Ensure loader shows for minimum time
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setRaceResult(result);
        
        // Play regular sound when results show up
        playRegularSound();
      } else {
        console.error("Invalid race result:", result);
        alert("Failed to run race. Please check if the backend is running.");
      }
    } catch (error) {
      console.error("Race simulation failed:", error);
      alert(`Failed to connect to race endpoint. Please check if the backend is running on port 5000.\n\nError: ${error.message}`);
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
    setGlowColor("#9ca3af");
    const data = await summonCard(capsuleTier);
  
    const revealDelay = 3000;
    const glowColorMap = {
      Common: "#9ca3af",
      Rare: "#3b82f6",
      Epic: "#8b5cf6",
      Mythic: "#facc15",
      Legendary: "#facc15",
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
      
      // Play rarity-based sound with dynamic effects
      playRaritySound(data.rarity);
      
      // Set final glow color
      const rarityGlow = glowColorMap[data.rarity] || "#ffffff";
      setGlowColor(rarityGlow);
  
      // Save to collection with proper format
      const spermData = {
        name: data.name,
        emoji: data.emoji || "🧬",
        trait: data.trait || data.quote || "",
        flavorText: data.flavorText || data.quote || "",
        rarity: data.rarity,
        stats: data.stats || {},
        quote: data.quote || data.flavorText || "", // Keep quote for compatibility
      };
      
      setCollection((prev) => {
        const updated = [...prev, spermData];
        localStorage.setItem("spermdex", JSON.stringify(updated));
        console.log("Saved to spermdex:", spermData);
        return updated;
      });

      const timeout3 = setTimeout(() => {
        setGlowColor("#9ca3af");
      }, 4000);
      timeoutRefs.current.push(timeout3);
    }, revealDelay);
    timeoutRefs.current.push(timeout2);
  }

  // Sync mute state on mount
  useEffect(() => {
    setMuted(isMuted());
  }, []);

  // Ensure background stays neutral
  useEffect(() => {
    const neutralBg = "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)";
    document.body.style.background = neutralBg;
    document.body.style.transition = "none";
    
    if (!card && !opening) {
      setGlowColor("#9ca3af");
    }
  }, [card, opening]);

  useEffect(() => {
    if (card && !opening) {
      const glowColorMap = {
        Common: "#9ca3af",
        Rare: "#3b82f6",
        Epic: "#8b5cf6",
        Mythic: "#facc15",
        Legendary: "#facc15",
      };
      setGlowColor(glowColorMap[card.rarity] || glowColorMap.Common);
    }
  }, [card, opening]);
  

  function getRarityColor(rarity) {
    const colorMap = {
      Common: "#9ca3af",   // Gray
      Rare: "#3b82f6",     // Blue
      Epic: "#8b5cf6",     // Purple
      Mythic: "#facc15",   // Gold
      Legendary: "#facc15", // Legendary uses same as Mythic
    };
    const normalizedRarity = rarity === "Legendary" ? "Mythic" : rarity;
    return colorMap[normalizedRarity] || colorMap[rarity] || colorMap.Common;
  }

  function getRarityIcon(rarity) {
    const iconMap = {
      Common: "⚪",
      Rare: "🔵",
      Epic: "🟣",
      Mythic: "🟡",
      Legendary: "🟡",
    };
    const normalizedRarity = rarity === "Legendary" ? "Mythic" : rarity;
    return iconMap[normalizedRarity] || iconMap[rarity] || iconMap.Common;
  }

  function getRarityGradient(rarity) {
    const gradientMap = {
      Common: "linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, transparent 100%)",
      Rare: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%)",
      Epic: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%)",
      Mythic: "linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, transparent 100%)",
      Legendary: "linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, transparent 100%)",
    };
    const normalizedRarity = rarity === "Legendary" ? "Mythic" : rarity;
    return gradientMap[normalizedRarity] || gradientMap[rarity] || gradientMap.Common;
  }

  // Full sperm list from backend (reference data)
  const allSperms = {
    Common: [
      { name: "Lazy Larry", quote: "Still deciding which way the egg is." },
      { name: "Drifty Dave", quote: "Just vibin' in the vas deferens." },
      { name: "Timid Timmy", quote: "Refuses to swim without floaties." },
      { name: "No-Tail Neil", quote: "Technically still participating." },
      { name: "Bubble Boy", quote: "Too much caffeine, not enough direction." }
    ],
    Rare: [
      { name: "Turbo Tom", quote: "Born to spin." },
      { name: "Captain Wiggle", quote: "Motility is my middle name." },
      { name: "Benny Biflagella", quote: "Two tails. Double trouble." },
      { name: "Zoomin' Zane", quote: "Has never touched a wall — yet." },
      { name: "Backstroke Barry", quote: "Invented the freestyle for sperm." }
    ],
    Epic: [
      { name: "Professor Wiggle", quote: "Theoretical physicist of the testes." },
      { name: "Slick Rick", quote: "No egg too far, no rival too fast." },
      { name: "Don Juan de Swim", quote: "Flirts with every ovum in sight." },
      { name: "Hydro Harold", quote: "Powered by electrolytes and ambition." },
      { name: "Mitochondrius Maximus", quote: "All power. No mercy." }
    ],
    Mythic: [
      { name: "The Chosen One (Swimothy)", quote: "Prophecy foretold: one shall reach the egg." },
      { name: "Genezilla", quote: "Mutated beyond mortal means." },
      { name: "Wiggly Stardust", quote: "A swimmer from beyond the stars." },
      { name: "Aqua Saiyan", quote: "Has achieved Ultra Instinct Motility." },
      { name: "Professor Fertilis", quote: "Has seen the egg… and returned." }
    ]
  };

  // Helper to check if a sperm is collected
  function isSpermCollected(rarity, name) {
    return collection.some(c => c.rarity === rarity && c.name === name);
  }

  // Get collected count for a rarity
  function getCollectedCount(rarity) {
    const collected = collection.filter(c => c.rarity === rarity).length;
    const total = allSperms[rarity]?.length || 0;
    return { collected, total };
  }

  function getRarityEffect(rarity) {
    switch (rarity) {
      case "Legendary":
      case "Mythic":
        return {
          background: "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)",
          color: "gold",
          text: "🌟 MYTHIC DROP! 🌟",
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

      {/* View Toggle Buttons and Audio Toggle */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "30px",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <motion.button
          onClick={() => setViewMode("summon")}
          className="gradient-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            borderRadius: "12px",
            background: viewMode === "summon" 
              ? "linear-gradient(135deg, #9333ea 0%, #64b5f6 100%)"
              : "linear-gradient(135deg, #666 0%, #444 100%)",
            opacity: viewMode === "summon" ? 1 : 0.7,
          }}
        >
          Summon
        </motion.button>
        <motion.button
          onClick={() => setViewMode("spermdex")}
          className="gradient-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            borderRadius: "12px",
            background: viewMode === "spermdex"
              ? "linear-gradient(135deg, #9333ea 0%, #64b5f6 100%)"
              : "linear-gradient(135deg, #666 0%, #444 100%)",
            opacity: viewMode === "spermdex" ? 1 : 0.7,
          }}
        >
          Spermdex ({collection.length})
        </motion.button>
        <motion.button
          onClick={handleToggleMute}
          className="gradient-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: "12px 20px",
            fontSize: "1rem",
            borderRadius: "12px",
            background: muted
              ? "linear-gradient(135deg, #666 0%, #444 100%)"
              : "linear-gradient(135deg, #9333ea 0%, #64b5f6 100%)",
            opacity: muted ? 0.7 : 1,
            minWidth: "60px",
          }}
          title={muted ? "Unmute audio" : "Mute audio"}
        >
          {muted ? "🔇" : "🔊"}
        </motion.button>
      </div>

      {/* Summon View */}
      {viewMode === "summon" && (
        <>
      {/* Race Simulation Section */}
      <div style={{ marginBottom: "40px", width: "100%", maxWidth: "600px" }}>
        {/* Animated loader during race simulation - Show even during opening */}
        {runningRace && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card"
            style={{
              padding: "30px",
              borderRadius: "16px",
              marginBottom: "20px",
              textAlign: "center",
              position: "relative",
              zIndex: 10,
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

        {/* Run Race Button - Only show when no race result and no card and not running */}
        {!opening && !raceResult && !card && !runningRace && (
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
            Get Race Results
          </motion.button>
        )}

        {!opening && raceResult && (
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

          {/* Sequence Capsule Button - Only show when race result exists but no card yet */}
          {raceResult && !card && (
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
                {opening ? "Sequencing..." : "Sequence Capsule"}
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

      {!opening && card && (
        <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${getRarityColor(card.rarity)}33 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 998,
            filter: `blur(40px)`,
          }}
        />
      )}

    {!opening && card && ["Legendary", "Mythic", "Epic"].includes(card.rarity) && (
      <ParticleBurst color={card.rarity === "Legendary" || card.rarity === "Mythic" ? "gold" : "#b388ff"} />
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
              0 0 80px ${getRarityColor(card.rarity)}33,
              0 20px 60px rgba(0, 0, 0, 0.4)
            `,
            position: "relative",
            maxWidth: "500px",
            transformStyle: "preserve-3d",
            willChange: "transform",
            background: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)`,
          }}
        >
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
          {card.rarity === "Mythic" && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: `${20 + i * 15}%`,
                    left: `${20 + i * 20}%`,
                    width: "8px",
                    height: "8px",
                    background: getRarityColor("Mythic"),
                    borderRadius: "50%",
                    boxShadow: `0 0 10px ${getRarityColor("Mythic")}`,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              ))}
            </>
          )}
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

      {/* Reset button after card is revealed (allows starting new flow) */}
      {!opening && card && raceResult && (
        <motion.button
          onClick={() => {
            setCard(null);
            setRaceResult(null);
          }}
          className="gradient-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: "40px",
            padding: "14px 28px",
            fontSize: "1.1rem",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #666 0%, #444 100%)",
          }}
        >
          Start New Summon
        </motion.button>
      )}

        </>
      )}

      {/* Spermdex Collection View */}
      {viewMode === "spermdex" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%",
            maxWidth: "1400px",
            padding: "20px",
          }}
        >
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "2.5rem",
            marginBottom: "30px",
            textAlign: "center",
            background: "linear-gradient(135deg, #ffffff 0%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Spermdex Collection
          </h2>

          {/* Rarity Sections */}
          {["Mythic", "Epic", "Rare", "Common"].map((rarity) => {
            const { collected, total } = getCollectedCount(rarity);
            const raritySperms = allSperms[rarity] || [];
            
            return (
              <motion.div
                key={rarity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ["Mythic", "Epic", "Rare", "Common"].indexOf(rarity) * 0.1 }}
                style={{
                  marginBottom: "40px",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  padding: "15px 20px",
                  background: getRarityGradient(rarity),
                  borderRadius: "12px",
                  border: `2px solid ${getRarityColor(rarity)}44`,
                  boxShadow: `0 4px 20px ${getRarityColor(rarity)}33`,
                }}>
                  <h3 style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "1.8rem",
                    background: `linear-gradient(135deg, #ffffff 0%, ${getRarityColor(rarity)} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: `0 0 10px ${getRarityColor(rarity)}66`,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    {getRarityIcon(rarity)} {rarity} Sperms {rarity === "Mythic" && "✨"}
                  </h3>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1rem",
                    opacity: 0.8,
                    margin: 0,
                    color: getRarityColor(rarity),
                  }}>
                    Collected: {collected}/{total}
                  </p>
                </div>

                {/* Sperm Cards Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "20px",
                }}>
                  {raritySperms.map((sperm, idx) => {
                    const isCollected = isSpermCollected(rarity, sperm.name);
                    const collectedData = collection.find(c => c.rarity === rarity && c.name === sperm.name);
                    
                    return (
                      <motion.div
                        key={sperm.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={isCollected ? { 
                          scale: 1.05, 
                          y: -5,
                          boxShadow: `0 8px 30px ${getRarityColor(rarity)}66`,
                        } : {}}
                        onClick={() => isCollected && setSelectedSperm(collectedData)}
                        className="glass"
                        style={{
                          border: `2px solid ${isCollected ? getRarityColor(rarity) : "rgba(255,255,255,0.1)"}`,
                          borderRadius: "16px",
                          padding: "20px",
                          textAlign: "center",
                          cursor: isCollected ? "pointer" : "default",
                          position: "relative",
                          opacity: isCollected ? 1 : 0.4,
                          filter: isCollected ? "none" : "grayscale(100%) blur(2px)",
                          boxShadow: isCollected 
                            ? `0 4px 20px ${getRarityColor(rarity)}44`
                            : "0 4px 20px rgba(0,0,0,0.2)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* Locked Overlay */}
                        {!isCollected && (
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.7)",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1,
                          }}>
                            <p style={{
                              fontSize: "2rem",
                              opacity: 0.5,
                              fontFamily: "'Orbitron', sans-serif",
                            }}>
                              ???
                            </p>
                          </div>
                        )}

                        {/* Shimmer for Mythic collected cards */}
                        {isCollected && rarity === "Mythic" && (
                          <>
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "50%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
                                pointerEvents: "none",
                                borderRadius: "16px",
                                willChange: "transform",
                              }}
                            />
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [0, 1, 0],
                                  rotate: [0, 180, 360],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.6,
                                  ease: "easeInOut",
                                }}
                                style={{
                                  position: "absolute",
                                  top: `${20 + i * 30}%`,
                                  left: `${20 + i * 20}%`,
                                  width: "8px",
                                  height: "8px",
                                  background: getRarityColor("Mythic"),
                                  borderRadius: "50%",
                                  boxShadow: `0 0 10px ${getRarityColor("Mythic")}`,
                                  pointerEvents: "none",
                                }}
                              />
                            ))}
                          </>
                        )}

                        <div style={{ 
                          fontSize: "48px", 
                          marginBottom: "12px",
                          filter: isCollected ? "none" : "blur(3px)",
                        }}>
                          {isCollected ? (collectedData?.emoji || "🧬") : "🧬"}
                        </div>
                        <p style={{
                          margin: "8px 0",
                          fontWeight: 600,
                          fontSize: "1rem",
                          fontFamily: "'Poppins', sans-serif",
                          color: isCollected ? "#ffffff" : "rgba(255,255,255,0.3)",
                          filter: isCollected ? "none" : "blur(2px)",
                        }}>
                          {isCollected ? sperm.name : "???"}
                        </p>
                        {isCollected && (
                          <p style={{
                            fontSize: "0.75rem",
                            opacity: 0.9,
                            color: getRarityColor(rarity),
                            fontFamily: "'Orbitron', sans-serif",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            marginTop: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}>
                            {getRarityIcon(rarity)} {rarity}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Sperm Details Modal */}
      {selectedSperm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSperm(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "40px",
              borderRadius: "24px",
              border: `3px solid ${getRarityColor(selectedSperm.rarity)}`,
              boxShadow: `0 0 60px ${getRarityColor(selectedSperm.rarity)}66`,
            }}
          >
            <button
              onClick={() => setSelectedSperm(null)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                color: "white",
                cursor: "pointer",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "64px", marginBottom: "15px" }}>
                {selectedSperm.emoji || "🧬"}
              </div>
              <h2 style={{
                fontSize: "32px",
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                marginBottom: "10px",
                background: `linear-gradient(135deg, #ffffff 0%, ${getRarityColor(selectedSperm.rarity)} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {selectedSperm.name}
              </h2>
              <motion.div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: `linear-gradient(135deg, ${getRarityColor(selectedSperm.rarity)}dd, ${getRarityColor(selectedSperm.rarity)}aa)`,
                  border: `2px solid ${getRarityColor(selectedSperm.rarity)}`,
                  marginBottom: "15px",
                }}
              >
                <p style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: "1px",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}>
                    {getRarityIcon(selectedSperm.rarity)} {selectedSperm.rarity.toUpperCase()}
                  </p>
              </motion.div>
            </div>

            <p style={{
              fontSize: "1.1rem",
              fontStyle: "italic",
              opacity: 0.85,
              textAlign: "center",
              marginBottom: "25px",
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1.6,
            }}>
              "{selectedSperm.quote || selectedSperm.flavorText || selectedSperm.trait || "No quote available"}"
            </p>

            {selectedSperm.stats && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "15px",
                padding: "20px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "12px",
                border: `1px solid ${getRarityColor(selectedSperm.rarity)}33`,
              }}>
                {Object.entries(selectedSperm.stats).map(([key, value]) => (
                  <div key={key} style={{ textAlign: "center" }}>
                    <p style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      marginBottom: "5px",
                      fontFamily: "'Poppins', sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {key}
                    </p>
                    <p style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: getRarityColor(selectedSperm.rarity),
                      fontFamily: "'Orbitron', sans-serif",
                    }}>
                      {value}
                    </p>
                  </div>
                ))}
          </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default App;