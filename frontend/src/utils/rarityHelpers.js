// Rarity-related helper functions and constants

/**
 * Get the color associated with a rarity tier
 * @param {string} rarity - Rarity tier (Common, Rare, Epic, Mythic)
 * @returns {string} Hex color code
 */
export function getRarityColor(rarity) {
  const colorMap = {
    Common: "#9ca3af",   // Gray
    Rare: "#3b82f6",     // Blue
    Epic: "#8b5cf6",     // Purple
    Mythic: "#facc15",   // Gold
  };
  return colorMap[rarity] || colorMap.Common;
}

/**
 * Get the icon emoji associated with a rarity tier
 * @param {string} rarity - Rarity tier (Common, Rare, Epic, Mythic)
 * @returns {string} Icon emoji
 */
export function getRarityIcon(rarity) {
  const iconMap = {
    Common: "⚪",
    Rare: "🔵",
    Epic: "🟣",
    Mythic: "🟡",
  };
  return iconMap[rarity] || iconMap.Common;
}

/**
 * Get the gradient background associated with a rarity tier
 * @param {string} rarity - Rarity tier (Common, Rare, Epic, Mythic)
 * @returns {string} CSS gradient string
 */
export function getRarityGradient(rarity) {
  const gradientMap = {
    Common: "linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, transparent 100%)",
    Rare: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, transparent 100%)",
    Epic: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, transparent 100%)",
    Mythic: "linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, transparent 100%)",
  };
  return gradientMap[rarity] || gradientMap.Common;
}

/**
 * Get special effect configuration for rare+ rarities (for overlay animations)
 * @param {string} rarity - Rarity tier (Common, Rare, Epic, Mythic)
 * @returns {Object|null} Effect config with background, color, and text, or null for Common
 */
export function getRarityEffect(rarity) {
  switch (rarity) {
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

// Glow color mapping for animations
export const glowColorMap = {
  Common: "#9ca3af",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Mythic: "#facc15",
};

