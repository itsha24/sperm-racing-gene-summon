import { motion } from "framer-motion";
import { getRarityColor } from "../utils/rarityHelpers";
import SpermIcon from "../SpermIcon";

/**
 * Race Section component - Handles race simulation, loader, and results display
 */
export default function RaceSection({ 
  runningRace, 
  raceResult, 
  opening, 
  card,
  onRunRace, 
  onSummon, 
  onReset 
}) {
  return (
    <div style={{ marginBottom: "40px", width: "100%", maxWidth: "600px" }}>
      {/* Animated loader during race simulation */}
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
              marginBottom: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SpermIcon color="#9333ea" size={40} />
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

      {/* Run Race Button */}
      {!opening && !raceResult && !card && !runningRace && (
        <motion.button
          onClick={onRunRace}
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

      {/* Race Results Display */}
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
              color: getRarityColor(raceResult.capsuleTier),
              textShadow: `0 0 15px ${getRarityColor(raceResult.capsuleTier)}`,
              position: "relative",
              zIndex: 1,
            }}>
              {raceResult.capsuleTier}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Sequence Capsule Button */}
      {raceResult && !card && (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
          <motion.button
            onClick={() => onSummon(raceResult.capsuleTier)}
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
            onClick={onReset}
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
  );
}

