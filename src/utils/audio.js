/**
 * audio.js - Web Audio API synthesizer for timer sounds
 * 
 * This module creates gentle, sensory-friendly sounds using the Web Audio API.
 * Uses a 4-voice ring buffer architecture with hard clipping.
 * All sounds are synthesized in real-time - no external audio files needed.
 * 
 * Design principles:
 * - Gentle attack/decay to avoid startling
 * - Human-friendly frequency range (200Hz - 2000Hz)
 * - No deep bass or sibilant frequencies
 * - All sounds default to OFF for sensory safety
 * - Ring buffer voice management with hard clipping
 */

/**
 * Audio context for synthesis
 * Created lazily on first use to respect browser autoplay policies
 */
let audioContext = null;

/**
 * Master gain node for overall volume control
 */
let masterGain = null;

/**
 * Voice pool - ring buffer of 4 voices
 */
const VOICE_COUNT = 4;
const voices = [];
let currentVoiceIndex = 0;

/**
 * Audio settings - all default to false (OFF) for sensory safety
 */
let audioSettings = {
  startSound: false,
  completeSound: false,
  tickSound: false
};

/**
 * Initialize the audio context and voice pool
 * Must be called after user interaction (click/tap)
 */
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.3; // Master volume at 30%
    masterGain.connect(audioContext.destination);
    
    // Initialize voice pool
    initVoicePool();
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

/**
 * Initialize the voice pool with 4 voices
 */
function initVoicePool() {
  for (let i = 0; i < VOICE_COUNT; i++) {
    voices.push({
      oscillator: null,
      gainNode: null,
      isActive: false,
      stopTimeout: null
    });
  }
}

/**
 * Get the next voice from the ring buffer
 * Hard clips (stops) the voice if it's currently active
 * @returns {Object} Voice object with oscillator and gainNode
 */
function getNextVoice() {
  const voiceIndex = currentVoiceIndex;
  const voice = voices[voiceIndex];
  
  // Hard clip if active
  if (voice.isActive) {
    hardStopVoice(voice);
  }
  
  // Create new oscillator and gain node for this voice
  voice.oscillator = audioContext.createOscillator();
  voice.gainNode = audioContext.createGain();
  voice.oscillator.connect(voice.gainNode);
  voice.gainNode.connect(masterGain);
  
  // Advance to next voice in ring buffer
  currentVoiceIndex = (currentVoiceIndex + 1) % VOICE_COUNT;
  
  return voice;
}

/**
 * Hard stop a voice - immediately stop and cleanup
 * @param {Object} voice - Voice object to stop
 */
function hardStopVoice(voice) {
  if (voice.stopTimeout) {
    clearTimeout(voice.stopTimeout);
    voice.stopTimeout = null;
  }
  
  if (voice.oscillator) {
    try {
      voice.oscillator.stop();
    } catch (e) {
      // Oscillator might already be stopped
    }
    voice.oscillator.disconnect();
    voice.oscillator = null;
  }
  
  if (voice.gainNode) {
    voice.gainNode.disconnect();
    voice.gainNode = null;
  }
  
  voice.isActive = false;
}

/**
 * Schedule voice cleanup after sound completes
 * @param {Object} voice - Voice to cleanup
 * @param {number} delay - Delay in milliseconds before cleanup
 */
function scheduleVoiceCleanup(voice, delay) {
  voice.stopTimeout = setTimeout(() => {
    if (voice.oscillator) {
      voice.oscillator.disconnect();
      voice.oscillator = null;
    }
    if (voice.gainNode) {
      voice.gainNode.disconnect();
      voice.gainNode = null;
    }
    voice.isActive = false;
    voice.stopTimeout = null;
  }, delay);
}

/**
 * Play the gentle start sound
 * A soft sine wave at 523Hz (C5) with gentle envelope
 */
function playStartSound() {
  if (!audioSettings.startSound) return;
  
  initAudio();
  
  const voice = getNextVoice();
  voice.isActive = true;
  
  // Gentle sine wave at C5 (523Hz)
  voice.oscillator.type = 'sine';
  voice.oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
  
  // Apply gentle envelope (200ms attack, 100ms decay, 600ms total)
  const now = audioContext.currentTime;
  voice.gainNode.gain.setValueAtTime(0, now);
  voice.gainNode.gain.linearRampToValueAtTime(1, now + 0.2);
  voice.gainNode.gain.linearRampToValueAtTime(0.5, now + 0.3);
  voice.gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
  
  // Start and schedule stop
  voice.oscillator.start(now);
  voice.oscillator.stop(now + 0.8);
  
  // Schedule cleanup
  scheduleVoiceCleanup(voice, 900);
}

/**
 * Play the cheerful completion sound
 * Major arpeggio: C5-E5-G5-C6 with gentle transitions
 * Uses multiple voices from the ring buffer
 */
function playCompleteSound() {
  if (!audioSettings.completeSound) return;
  
  initAudio();
  
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const noteDuration = 0.25; // 250ms per note
  const overlap = 0.1; // 100ms overlap for smoothness
  
  notes.forEach((frequency, index) => {
    const voice = getNextVoice();
    voice.isActive = true;
    
    // Use sine wave for soft, pleasant tone
    voice.oscillator.type = 'sine';
    voice.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Calculate timing for this note
    const startTime = audioContext.currentTime + (index * (noteDuration - overlap));
    const endTime = startTime + noteDuration + 0.2;
    
    // Apply gentle envelope
    voice.gainNode.gain.setValueAtTime(0, startTime);
    voice.gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.1);
    voice.gainNode.gain.linearRampToValueAtTime(0.6, startTime + noteDuration - 0.1);
    voice.gainNode.gain.linearRampToValueAtTime(0, endTime);
    
    // Start and stop
    voice.oscillator.start(startTime);
    voice.oscillator.stop(endTime);
    
    // Schedule cleanup
    scheduleVoiceCleanup(voice, (endTime - audioContext.currentTime) * 1000 + 100);
  });
}

/**
 * Play a tick sound - soft blip every second
 * Medium envelope: 10ms attack, 40ms decay, 50ms release
 * Triangle wave at 800Hz for soft woodblock quality
 */
function playTickSound() {
  if (!audioSettings.tickSound) return;
  
  initAudio();
  
  const voice = getNextVoice();
  voice.isActive = true;
  
  // Triangle wave for soft woodblock-like quality
  voice.oscillator.type = 'triangle';
  voice.oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  
  // Medium envelope - soft blip (10ms attack, 40ms decay, 50ms release)
  const now = audioContext.currentTime;
  voice.gainNode.gain.setValueAtTime(0, now);
  voice.gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // 10ms attack
  voice.gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // 40ms decay to sustain
  voice.gainNode.gain.linearRampToValueAtTime(0, now + 0.1); // 50ms release
  
  // Start and schedule stop (100ms total)
  voice.oscillator.start(now);
  voice.oscillator.stop(now + 0.1);
  
  // Schedule cleanup
  scheduleVoiceCleanup(voice, 200);
}

/**
 * Enable or disable a specific sound type
 * @param {string} soundType - 'startSound', 'completeSound', or 'tickSound'
 * @param {boolean} enabled - Whether to enable the sound
 */
function setAudioEnabled(soundType, enabled) {
  if (audioSettings.hasOwnProperty(soundType)) {
    audioSettings[soundType] = enabled;
  }
}

/**
 * Check if a specific sound type is enabled
 * @param {string} soundType - 'startSound', 'completeSound', or 'tickSound'
 * @returns {boolean} Whether the sound is enabled
 */
function isAudioEnabled(soundType) {
  return audioSettings[soundType] || false;
}

/**
 * Get all current audio settings
 * @returns {Object} Current audio settings
 */
function getAudioSettings() {
  return { ...audioSettings };
}

/**
 * Set all audio settings at once
 * @param {Object} settings - Audio settings object
 */
function setAllAudioSettings(settings) {
  if (settings.hasOwnProperty('startSound')) {
    audioSettings.startSound = settings.startSound;
  }
  if (settings.hasOwnProperty('completeSound')) {
    audioSettings.completeSound = settings.completeSound;
  }
  if (settings.hasOwnProperty('tickSound')) {
    audioSettings.tickSound = settings.tickSound;
  }
}

/**
 * Test a sound (for settings panel)
 * @param {string} soundType - Type of sound to test
 */
function testSound(soundType) {
  initAudio();
  
  switch (soundType) {
    case 'startSound':
      playStartSound();
      break;
    case 'completeSound':
      playCompleteSound();
      break;
    case 'tickSound':
      playTickSound();
      break;
  }
}

export {
  playStartSound,
  playCompleteSound,
  playTickSound,
  setAudioEnabled,
  isAudioEnabled,
  getAudioSettings,
  setAllAudioSettings,
  testSound,
  initAudio
};
