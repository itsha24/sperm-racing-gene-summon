import { motion } from "framer-motion";
import SpermIcon from "../SpermIcon";

/**
 * Summon Animation component - Sperm animation during card opening
 */
export default function SummonAnimation({ glowColor }) {
  return (
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
      {/* Sperm Icon */}
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
          position: "relative",
          filter: `drop-shadow(0 0 30px ${glowColor})`,
          willChange: "transform, filter",
        }}
      >
        <SpermIcon color={glowColor} size={120} />
      </motion.div>
      
      {/* Background Glow */}
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
  );
}

