/**
 * storage.js - Local storage utilities for persisting user preferences
 * 
 * This module provides a simple interface for saving and loading
 * user settings like accessibility preferences.
 */

/**
 * Keys used for storing data in localStorage
 */
const STORAGE_KEYS = {
  HIGH_CONTRAST: 'timer:highContrast',
  REDUCED_MOTION: 'timer:reducedMotion',
  LARGE_BUTTONS: 'timer:largeButtons',
  LAST_DURATION: 'timer:lastDuration',
  START_SOUND: 'timer:startSound',
  COMPLETE_SOUND: 'timer:completeSound',
  TICK_SOUND: 'timer:tickSound'
};

/**
 * Default values for all settings
 */
const DEFAULT_SETTINGS = {
  highContrast: false,
  reducedMotion: false,
  largeButtons: false,
  lastDuration: 300000 // 5 minutes in milliseconds
};

/**
 * Saves a value to localStorage
 * 
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
function saveToStorage(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Loads a value from localStorage
 * 
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
function loadFromStorage(key, defaultValue) {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Saves accessibility settings
 * 
 * @param {Object} settings - Settings object
 * @param {boolean} settings.highContrast - High contrast mode enabled
 * @param {boolean} settings.reducedMotion - Reduced motion enabled
 * @param {boolean} settings.largeButtons - Large buttons enabled
 */
function saveAccessibilitySettings(settings) {
  saveToStorage(STORAGE_KEYS.HIGH_CONTRAST, settings.highContrast);
  saveToStorage(STORAGE_KEYS.REDUCED_MOTION, settings.reducedMotion);
  saveToStorage(STORAGE_KEYS.LARGE_BUTTONS, settings.largeButtons);
}

/**
 * Loads accessibility settings
 * 
 * @returns {Object} Current accessibility settings
 */
function loadAccessibilitySettings() {
  return {
    highContrast: loadFromStorage(STORAGE_KEYS.HIGH_CONTRAST, DEFAULT_SETTINGS.highContrast),
    reducedMotion: loadFromStorage(STORAGE_KEYS.REDUCED_MOTION, DEFAULT_SETTINGS.reducedMotion),
    largeButtons: loadFromStorage(STORAGE_KEYS.LARGE_BUTTONS, DEFAULT_SETTINGS.largeButtons)
  };
}

/**
 * Saves the last used timer duration
 * 
 * @param {number} duration - Duration in milliseconds
 */
function saveLastDuration(duration) {
  saveToStorage(STORAGE_KEYS.LAST_DURATION, duration);
}

/**
 * Loads the last used timer duration
 * 
 * @returns {number} Duration in milliseconds
 */
function loadLastDuration() {
  return loadFromStorage(STORAGE_KEYS.LAST_DURATION, DEFAULT_SETTINGS.lastDuration);
}

/**
 * Saves audio settings
 * 
 * @param {Object} settings - Audio settings object
 * @param {boolean} settings.startSound - Start sound enabled
 * @param {boolean} settings.completeSound - Complete sound enabled
 * @param {boolean} settings.tickSound - Tick sound enabled
 */
function saveAudioSettings(settings) {
  saveToStorage(STORAGE_KEYS.START_SOUND, settings.startSound);
  saveToStorage(STORAGE_KEYS.COMPLETE_SOUND, settings.completeSound);
  saveToStorage(STORAGE_KEYS.TICK_SOUND, settings.tickSound);
}

/**
 * Loads audio settings
 * 
 * @returns {Object} Current audio settings (all default to false)
 */
function loadAudioSettings() {
  return {
    startSound: loadFromStorage(STORAGE_KEYS.START_SOUND, false),
    completeSound: loadFromStorage(STORAGE_KEYS.COMPLETE_SOUND, false),
    tickSound: loadFromStorage(STORAGE_KEYS.TICK_SOUND, false)
  };
}

/**
 * Clears all timer-related data from localStorage
 */
function clearAllSettings() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  saveToStorage,
  loadFromStorage,
  saveAccessibilitySettings,
  loadAccessibilitySettings,
  saveAudioSettings,
  loadAudioSettings,
  saveLastDuration,
  loadLastDuration,
  clearAllSettings
};
