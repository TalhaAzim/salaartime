/**
 * colors.js - Color interpolation and management utilities
 * 
 * This file handles all color-related calculations for the timer.
 * It provides smooth color transitions as time progresses.
 */

/**
 * Color stops for the timer visualization
 * Each stop has a progress threshold (0-1) and associated color
 */
const COLOR_STOPS = [
  { progress: 1.0, color: { r: 76, g: 175, b: 80 } },   // Green - lots of time
  { progress: 0.6, color: { r: 255, g: 235, b: 59 } }, // Yellow - getting closer
  { progress: 0.3, color: { r: 255, g: 152, b: 0 } },  // Orange - almost there
  { progress: 0.0, color: { r: 244, g: 67, b: 54 } }   // Red - time's up
];

/**
 * Interpolates between two RGB color values
 * 
 * @param {Object} color1 - Starting color {r, g, b}
 * @param {Object} color2 - Ending color {r, g, b}
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {Object} Interpolated color {r, g, b}
 */
function interpolateColor(color1, color2, factor) {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor)
  };
}

/**
 * Converts RGB values to a CSS color string
 * 
 * @param {Object} color - Color object {r, g, b}
 * @returns {string} CSS rgb() string
 */
function rgbToString(color) {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * Gets the color for a specific progress value
 * Automatically interpolates between color stops
 * 
 * @param {number} progress - Progress value (0-1, where 1 is full)
 * @returns {string} CSS color string
 * 
 * @example
 * const color = getColorForProgress(0.5); // Returns color halfway through
 */
function getColorForProgress(progress) {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Find which color stops we're between
  let startStop = COLOR_STOPS[0];
  let endStop = COLOR_STOPS[COLOR_STOPS.length - 1];

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (clampedProgress <= COLOR_STOPS[i].progress && 
        clampedProgress >= COLOR_STOPS[i + 1].progress) {
      startStop = COLOR_STOPS[i];
      endStop = COLOR_STOPS[i + 1];
      break;
    }
  }

  // Calculate how far we are between these two stops
  const range = startStop.progress - endStop.progress;
  const factor = range === 0 ? 0 : (startStop.progress - clampedProgress) / range;

  // Interpolate the color
  const interpolatedColor = interpolateColor(startStop.color, endStop.color, factor);

  return rgbToString(interpolatedColor);
}

/**
 * Gets a color that works well for high contrast mode
 * 
 * @param {number} progress - Progress value (0-1)
 * @returns {string} High contrast CSS color
 */
function getHighContrastColor(progress) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  if (clampedProgress > 0.6) {
    return '#00aa00'; // Dark green
  } else if (clampedProgress > 0.3) {
    return '#cc9900'; // Dark yellow/gold
  } else if (clampedProgress > 0.1) {
    return '#cc6600'; // Dark orange
  } else {
    return '#cc0000'; // Dark red
  }
}

/**
 * Gets the background color for the timer ring
 * Changes subtly based on remaining time
 * 
 * @param {number} progress - Progress value (0-1)
 * @returns {string} CSS color string for background
 */
function getBackgroundColor(progress) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  // Background gets slightly darker as time runs out
  const lightness = 95 - (1 - clampedProgress) * 10;
  return `hsl(0, 0%, ${lightness}%)`;
}

export {
  COLOR_STOPS,
  interpolateColor,
  rgbToString,
  getColorForProgress,
  getHighContrastColor,
  getBackgroundColor
};
