import { useState, useEffect, useRef } from "react";
import { summonCard, runRace } from "./api";
import "./App.css";
import { playRaritySound, playRegularSound, isMuted, toggleMute, stopAllSounds } from "./soundPlayer";
import { glowColorMap } from "./utils/rarityHelpers";
import {
  ANIMATION_DELAYS,
  RACE_CONFIG,
  BACKGROUND_GRADIENT,
  DEFAULT_EMOJI,
  STORAGE_KEYS,
  VIEW_MODES,
} from "./constants/config";

// Components
import Navigation from "./components/Navigation";
import RaceSection from "./components/RaceSection";
import SummonAnimation from "./components/SummonAnimation";
import CardDisplay from "./components/CardDisplay";
import SpermdexView from "./components/SpermdexView";
import SpermModal from "./components/SpermModal";

/**
 * Main App component - Manages state and coordinates all features
 */
function App() {
  // Card and summon state
  const [card, setCard] = useState(null);
  const [opening, setOpening] = useState(false);
  const [glowColor, setGlowColor] = useState("#b0bec5");
  const timeoutRefs = useRef([]);
  
  // Collection state
  const [collection, setCollection] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SPERMDEX) || "[]")
  );
  
  // Race simulation state
  const [raceResult, setRaceResult] = useState(null);
  const [runningRace, setRunningRace] = useState(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState(VIEW_MODES.SUMMON);
  const [selectedSperm, setSelectedSperm] = useState(null);
  
  // Audio mute state
  const [muted, setMuted] = useState(isMuted());

  // Handle race execution
  async function handleRunRace() {
    stopAllSounds();
    setCard(null);
    setRaceResult(null);
    setRunningRace(true);
    
    const startTime = Date.now();
    
    try {
      const result = await runRace();
      if (result?.capsuleTier) {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, RACE_CONFIG.MIN_DISPLAY_TIME - elapsed);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setRaceResult(result);
        playRegularSound();
      } else {
        throw new Error("Invalid race result: missing capsuleTier");
      }
    } catch (error) {
      alert(`Failed to run race. Please check if the backend is running on port ${RACE_CONFIG.BACKEND_PORT}.\n\nError: ${error.message}`);
    } finally {
      setRunningRace(false);
    }
  }

  // Handle card summoning
  async function handleSummon(capsuleTier = null) {
    stopAllSounds();
    
    // Clear any pending timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
    
    // Set background
    document.body.style.background = BACKGROUND_GRADIENT;
    document.body.style.transition = "none";
    
    setOpening(true);
    setGlowColor("#9ca3af");
    
    const data = await summonCard(capsuleTier);
    const { REVEAL_DELAY, GLOW_TRANSITION_PERCENT, GLOW_RESET_DELAY } = ANIMATION_DELAYS;

    // Step 1: Gradually transition glow to rarity color
    const timeout1 = setTimeout(() => {
      const rarityGlow = glowColorMap[data.rarity] || "#ffffff";
      setGlowColor(rarityGlow);
    }, REVEAL_DELAY * GLOW_TRANSITION_PERCENT);
    timeoutRefs.current.push(timeout1);
  
    // Step 2: Reveal card with smooth cinematic easing
    const timeout2 = setTimeout(() => {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      
      setCard(data);
      setOpening(false);
      playRaritySound(data.rarity);
      
      // Set glow color (already set in timeout1, but ensure it's correct)
      const rarityGlow = glowColorMap[data.rarity] || glowColorMap.Common;
      setGlowColor(rarityGlow);
  
      // Save to collection
      const spermData = {
        name: data.name,
        emoji: data.emoji || DEFAULT_EMOJI,
        trait: data.trait || data.quote || "",
        flavorText: data.flavorText || data.quote || "",
        rarity: data.rarity,
        stats: data.stats || {},
        quote: data.quote || data.flavorText || "",
      };
      
      setCollection((prev) => {
        const updated = [...prev, spermData];
        localStorage.setItem(STORAGE_KEYS.SPERMDEX, JSON.stringify(updated));
        return updated;
      });

      // Step 3: Reset glow color after delay
      const timeout3 = setTimeout(() => {
        setGlowColor("#9ca3af");
      }, GLOW_RESET_DELAY);
      timeoutRefs.current.push(timeout3);
    }, REVEAL_DELAY);
    timeoutRefs.current.push(timeout2);
  }

  // Sync mute state on mount
  useEffect(() => {
    setMuted(isMuted());
  }, []);

  // Ensure background stays neutral
  useEffect(() => {
    document.body.style.background = BACKGROUND_GRADIENT;
    document.body.style.transition = "none";
    
    if (!card && !opening) {
      setGlowColor("#9ca3af");
    }
  }, [card, opening]);

  // Update glow color when card changes
  useEffect(() => {
    if (card && !opening) {
      setGlowColor(glowColorMap[card.rarity] || glowColorMap.Common);
    }
  }, [card, opening]);

  // Handle mute toggle
  const handleToggleMute = () => {
    const newMutedState = toggleMute();
    setMuted(newMutedState);
  };

  // Handle reset
  const handleReset = () => {
    stopAllSounds();
    setRaceResult(null);
    setCard(null);
  };

  // Stop sounds when view mode changes
  useEffect(() => {
    stopAllSounds();
  }, [viewMode]);

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
      {/* Title */}
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
      }}>
        💧 Gene Summon Mode
      </h1>

      {/* Navigation */}
      <Navigation
        viewMode={viewMode}
        setViewMode={setViewMode}
        collection={collection}
        muted={muted}
        onToggleMute={handleToggleMute}
      />

      {/* Summon View */}
      {viewMode === VIEW_MODES.SUMMON && (
        <>
          {/* Race Section */}
          <RaceSection
            runningRace={runningRace}
            raceResult={raceResult}
            opening={opening}
            card={card}
            onRunRace={handleRunRace}
            onSummon={handleSummon}
            onReset={handleReset}
          />

          {/* Summon Animation */}
          {opening && <SummonAnimation glowColor={glowColor} />}

          {/* Card Display */}
          <CardDisplay
            card={card}
            opening={opening}
            raceResult={raceResult}
            onReset={handleReset}
          />
        </>
      )}

      {/* Spermdex View */}
      {viewMode === VIEW_MODES.SPERMDEX && (
        <SpermdexView
          collection={collection}
          onSpermClick={setSelectedSperm}
        />
      )}

      {/* Sperm Details Modal */}
      {selectedSperm && (
        <SpermModal
          selectedSperm={selectedSperm}
          onClose={() => setSelectedSperm(null)}
        />
      )}
    </div>
  );
}

export default App;
