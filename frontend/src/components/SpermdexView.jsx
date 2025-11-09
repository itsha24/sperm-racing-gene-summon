import { motion } from "framer-motion";
import { getRarityColor, getRarityIcon, getRarityGradient } from "../utils/rarityHelpers";
import { allSperms } from "../constants/sperms";

/**
 * Spermdex View component - Displays the collection of collected sperms organized by rarity
 */
export default function SpermdexView({ collection, onSpermClick }) {
  // Helper to check if a sperm is collected
  const isSpermCollected = (rarity, name) => {
    return collection.some(c => c.rarity === rarity && c.name === name);
  };

  // Get collected count for a rarity
  const getCollectedCount = (rarity) => {
    const collected = collection.filter(c => c.rarity === rarity).length;
    const total = allSperms[rarity]?.length || 0;
    return { collected, total };
  };

  return (
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
        const rarityColor = getRarityColor(rarity);
        
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
            {/* Rarity Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              padding: "15px 20px",
              background: getRarityGradient(rarity),
              borderRadius: "12px",
              border: `2px solid ${rarityColor}44`,
              boxShadow: `0 4px 20px ${rarityColor}33`,
            }}>
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "1.8rem",
                background: `linear-gradient(135deg, #ffffff 0%, ${rarityColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: `0 0 10px ${rarityColor}66`,
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
                color: rarityColor,
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
                      boxShadow: `0 8px 30px ${rarityColor}66`,
                    } : {}}
                    onClick={() => isCollected && onSpermClick(collectedData)}
                    className="glass"
                    style={{
                      border: `2px solid ${isCollected ? rarityColor : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "16px",
                      padding: "20px",
                      textAlign: "center",
                      cursor: isCollected ? "pointer" : "default",
                      position: "relative",
                      opacity: isCollected ? 1 : 0.4,
                      filter: isCollected ? "none" : "grayscale(100%) blur(2px)",
                      boxShadow: isCollected 
                        ? `0 4px 20px ${rarityColor}44`
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
                      {isCollected ? (collectedData?.emoji || "💧") : "💧"}
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
                        color: rarityColor,
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
  );
}

