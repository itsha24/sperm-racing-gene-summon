import { raritySoundMap, regularSound } from "./soundMap";

// Global audio context (lazy-initialized)
let audioContext = null;
let currentSource = null; // Track current playing sound to prevent overlaps (BufferSource or HTMLAudioElement)
let currentHTMLAudio = null; // Track HTML Audio separately for easier cleanup

// Mute state management
const MUTE_STORAGE_KEY = "soundMuted";

function getMuteState() {
  const stored = localStorage.getItem(MUTE_STORAGE_KEY);
  return stored === "true";
}

function setMuteState(muted) {
  localStorage.setItem(MUTE_STORAGE_KEY, muted ? "true" : "false");
}

// Initialize AudioContext (lazy)
function getAudioContext() {
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
      return null;
    }
  }
  // Resume if suspended (required for user interaction)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

// Stop any currently playing sound (both Web Audio and HTML Audio)
function stopCurrentSound() {
  // Stop Web Audio source
  if (currentSource && typeof currentSource.stop === "function") {
    try {
      currentSource.stop();
    } catch (e) {
      // Source may have already stopped
    }
    currentSource = null;
  }
  
  // Stop HTML Audio
  if (currentHTMLAudio) {
    try {
      currentHTMLAudio.pause();
      currentHTMLAudio.currentTime = 0;
    } catch (e) {
      // Audio may have already stopped
    }
    currentHTMLAudio = null;
  }
}

// Randomly select a sound from the rarity's array
function getRandomSound(rarity) {
  const sounds = raritySoundMap[rarity];
  if (!sounds || sounds.length === 0) {
    // Fallback to Common if rarity not found
    const commonSounds = raritySoundMap.Common;
    if (!commonSounds || commonSounds.length === 0) {
      return null; // No sounds available
    }
    return commonSounds[Math.floor(Math.random() * commonSounds.length)];
  }
  return sounds[Math.floor(Math.random() * sounds.length)];
}

// Generate a simple reverb impulse response
function createReverbImpulse(duration = 2, decay = 2, sampleRate = 44100) {
  const length = duration * sampleRate;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  const leftChannel = impulse.getChannelData(0);
  const rightChannel = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = length - i;
    leftChannel[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    rightChannel[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
  }

  return impulse;
}

// Rarity-based audio effect parameters
// Volume levels reduced for user comfort (max 0.35 to prevent ear damage)
const rarityEffects = {
  Common: {
    volume: 0.15,
    playbackRate: 1.0,
    reverb: false,
    lowpass: false,
    bassBoost: false,
  },
  Rare: {
    volume: 0.2,
    playbackRate: 1.05,
    reverb: true,
    reverbDuration: 1.5,
    reverbDecay: 1.5,
    lowpass: false,
    bassBoost: false,
  },
  Epic: {
    volume: 0.25,
    playbackRate: 1.1,
    reverb: true,
    reverbDuration: 2.0,
    reverbDecay: 2.0,
    lowpass: false,
    bassBoost: false,
  },
  Mythic: {
    volume: 0.35,
    playbackRate: 1.15,
    reverb: true,
    reverbDuration: 2.5,
    reverbDecay: 2.5,
    lowpass: true,
    lowpassFreq: 8000, // Slight high-end rolloff
    bassBoost: false,
  },
};

// Play sound with Web Audio API effects
async function playWithWebAudio(rarity) {
  const ctx = getAudioContext();
  if (!ctx) {
    return false; // Fallback to HTML Audio
  }

  const soundPath = getRandomSound(rarity);
  if (!soundPath) {
    console.warn("No sound available for rarity:", rarity);
    return false;
  }
  const effects = rarityEffects[rarity] || rarityEffects.Common;

  try {
    // Stop any currently playing sound
    stopCurrentSound();

    // Fetch and decode audio file
    const response = await fetch(soundPath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // Create source node
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = effects.playbackRate;

    // Create gain node for volume
    const gainNode = ctx.createGain();
    gainNode.gain.value = effects.volume;

    // Build audio graph
    let lastNode = source;

    // Connect source to gain
    source.connect(gainNode);
    lastNode = gainNode;

    // Add bass boost if needed
    if (effects.bassBoost) {
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = "lowshelf";
      bassBoost.frequency.value = effects.bassBoostFreq || 200;
      bassBoost.gain.value = effects.bassBoostGain || 8;
      lastNode.connect(bassBoost);
      lastNode = bassBoost;
    }

    // Add lowpass filter if needed
    if (effects.lowpass) {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = effects.lowpassFreq || 8000;
      lastNode.connect(lowpass);
      lastNode = lowpass;
    }

    // Add reverb if needed
    if (effects.reverb) {
      const convolver = ctx.createConvolver();
      const impulse = createReverbImpulse(
        effects.reverbDuration || 2.0,
        effects.reverbDecay || 2.0,
        ctx.sampleRate
      );
      convolver.buffer = impulse;

      // Create a wet/dry mix for reverb
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      // Adjust wet/dry mix based on rarity (more reverb for higher rarities)
      const reverbIntensity = effects.reverbDuration > 2.5 ? 0.5 : 0.35; // More wet for epic rarities
      dryGain.gain.value = 1 - reverbIntensity;
      wetGain.gain.value = reverbIntensity;

      // Split signal: dry path and wet (reverb) path
      lastNode.connect(dryGain);
      lastNode.connect(convolver);
      convolver.connect(wetGain);

      // Merge dry and wet signals back together using a simple gain node
      const outputGain = ctx.createGain();
      dryGain.connect(outputGain);
      wetGain.connect(outputGain);
      lastNode = outputGain;
    }

    // Connect to destination
    lastNode.connect(ctx.destination);

    // Track current source
    currentSource = source;

    // Play sound
    source.start(0);

    // Clean up when finished
    source.onended = () => {
      currentSource = null;
    };

    return true;
  } catch (error) {
    console.warn("Web Audio playback failed, falling back to HTML Audio:", error);
    return false;
  }
}

// Fallback: Play sound with HTML Audio
function playWithHTMLAudio(rarity) {
  const soundPath = getRandomSound(rarity);
  if (!soundPath) {
    console.warn("No sound available for rarity:", rarity);
    return;
  }
  const effects = rarityEffects[rarity] || rarityEffects.Common;

  try {
    // Stop any currently playing sound
    stopCurrentSound();

    const audio = new Audio(soundPath);
    audio.volume = effects.volume;
    audio.playbackRate = effects.playbackRate;

    currentHTMLAudio = audio;
    currentSource = audio; // Also track in currentSource for consistency

    audio.play().catch((error) => {
      console.warn("HTML Audio playback failed:", error);
      currentSource = null;
      currentHTMLAudio = null;
    });

    audio.onended = () => {
      currentSource = null;
      currentHTMLAudio = null;
    };
  } catch (error) {
    console.error("Failed to play sound:", error);
    currentSource = null;
    currentHTMLAudio = null;
  }
}

// Main function: Play rarity-based sound with dynamic effects
export function playRaritySound(rarity) {
  // Check mute state
  if (getMuteState()) {
    return;
  }

  // Try Web Audio API first, fallback to HTML Audio
  playWithWebAudio(rarity).then((success) => {
    if (!success) {
      playWithHTMLAudio(rarity);
    }
  });
}

// Export mute state functions for UI controls (if needed)
export function isMuted() {
  return getMuteState();
}

export function setMuted(muted) {
  setMuteState(muted);
}

export function toggleMute() {
  const newState = !getMuteState();
  setMuteState(newState);
  return newState;
}

// Play regular sound (for race start, etc.) - simple playback without effects
export function playRegularSound() {
  // Check mute state
  if (getMuteState()) {
    return;
  }

  const volume = 0.2; // Moderate volume for regular sounds

  // Try Web Audio API first
  const ctx = getAudioContext();
  if (ctx) {
    fetch(regularSound)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        source.start(0);
        
        source.onended = () => {
          // Clean up
        };
      })
      .catch(() => {
        // Fallback to HTML Audio
        playRegularSoundHTML(volume);
      });
  } else {
    // Fallback to HTML Audio
    playRegularSoundHTML(volume);
  }
}

// Fallback HTML Audio for regular sound
function playRegularSoundHTML(volume) {
  try {
    const audio = new Audio(regularSound);
    audio.volume = volume;
    audio.play().catch((error) => {
      console.warn("HTML Audio playback failed for regular sound:", error);
    });
  } catch (error) {
    console.error("Failed to play regular sound:", error);
  }
}

