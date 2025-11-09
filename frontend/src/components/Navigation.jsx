import { motion } from "framer-motion";

/**
 * Navigation component - View toggle buttons and audio mute toggle
 */
export default function Navigation({ viewMode, setViewMode, collection, muted, onToggleMute }) {
  return (
    <div style={{ 
      display: "flex", 
      gap: "15px", 
      marginBottom: "30px",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    }}>
      <motion.button
        onClick={() => setViewMode("summon")} // Keep string literal for simplicity
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
        onClick={onToggleMute}
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
  );
}

