import { motion } from "framer-motion";
import { getRarityColor, getRarityEffect } from "../utils/rarityHelpers";
import ParticleBurst from "../ParticleBurst";

/**
 * Card Display component - Shows the revealed card with all details and effects
 */
export default function CardDisplay({ card, opening, raceResult, onReset }) {
  if (opening || !card) return null;

  const rarityEffect = getRarityEffect(card.rarity);
  const rarityColor = getRarityColor(card.rarity);

  return (
    <>
      {/* Rarity Effect Overlay */}
      {rarityEffect && (
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
            background: rarityEffect.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: rarityEffect.color,
            fontSize: "2rem",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {rarityEffect.text}
        </motion.div>
      )}

      {/* Background Glow Effect */}
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
          background: `radial-gradient(circle, ${rarityColor}33 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 998,
          filter: `blur(40px)`,
        }}
      />

      {/* Particle Burst for Epic+ rarities */}
      {["Legendary", "Mythic", "Epic"].includes(card.rarity) && (
        <ParticleBurst color={card.rarity === "Legendary" || card.rarity === "Mythic" ? "gold" : "#b388ff"} />
      )}

      {/* Main Card */}
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
          border: `3px solid ${rarityColor}`,
          boxShadow: `
            0 0 40px ${rarityColor}66,
            0 0 80px ${rarityColor}33,
            0 20px 60px rgba(0, 0, 0, 0.4)
          `,
          position: "relative",
          maxWidth: "500px",
          transformStyle: "preserve-3d",
          willChange: "transform",
          background: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)`,
        }}
      >
        {/* Animated Background Glow */}
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
            background: `radial-gradient(circle at center, ${rarityColor}22 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: -1,
            willChange: "transform, opacity",
          }}
        />

        {/* Mythic Special Effects */}
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

        {/* Card Name */}
        <h2 style={{ 
          fontSize: "42px", 
          fontFamily: "'Orbitron', sans-serif", 
          fontWeight: 700, 
          marginBottom: "15px",
          background: `linear-gradient(135deg, #ffffff 0%, ${rarityColor} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: `0 0 20px ${rarityColor}44`,
        }}>
          {card.emoji} {card.name}
        </h2>
        
        {/* Rarity Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: "20px",
            background: `linear-gradient(135deg, ${rarityColor}dd, ${rarityColor}aa)`,
            border: `2px solid ${rarityColor}`,
            boxShadow: `0 0 20px ${rarityColor}66`,
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
          color: rarityColor,
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

        {/* Stats Grid */}
        {card.stats && (
          <div style={{ 
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            padding: "16px",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "12px",
            border: `1px solid ${rarityColor}33`,
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
                  color: rarityColor,
                  fontFamily: "'Orbitron', sans-serif",
                }}>
                  {value}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Reset Button */}
      {raceResult && (
        <motion.button
          onClick={onReset}
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
  );
}

