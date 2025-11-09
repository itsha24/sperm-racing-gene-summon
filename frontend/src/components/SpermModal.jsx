import { motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { getRarityColor, getRarityIcon } from "../utils/rarityHelpers";

/**
 * Sperm Modal component - Displays detailed information about a selected sperm
 */
export default function SpermModal({ selectedSperm, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedSperm) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedSperm]);

  if (!selectedSperm) return null;

  const rarityColor = getRarityColor(selectedSperm.rarity);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
        margin: 0,
        overflow: "auto",
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
          border: `3px solid ${rarityColor}`,
          boxShadow: `0 0 60px ${rarityColor}66`,
          margin: "auto",
          position: "relative",
          maxHeight: "85vh",
          overflowY: "auto",
          alignSelf: "center",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "64px", marginBottom: "15px" }}>
            {selectedSperm.emoji || "💧"}
          </div>
          <h2 style={{
            fontSize: "32px",
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 700,
            marginBottom: "10px",
            background: `linear-gradient(135deg, #ffffff 0%, ${rarityColor} 100%)`,
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
              background: `linear-gradient(135deg, ${rarityColor}dd, ${rarityColor}aa)`,
              border: `2px solid ${rarityColor}`,
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

        {/* Quote */}
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

        {/* Stats */}
        {selectedSperm.stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "15px",
            padding: "20px",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "12px",
            border: `1px solid ${rarityColor}33`,
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
                  color: rarityColor,
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
  );

  // Render modal using portal to ensure it's at document root level
  return createPortal(modalContent, document.body);
}

