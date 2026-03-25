/**
 * main.js - Application entry point
 * 
 * This file initializes the timer app and coordinates all the components.
 * It's designed to be easy to read and understand.
 */

// Import web components
import './components/VisualTimer.js';
import './components/TimerControls.js';
import './components/AccessibilityPanel.js';

// Import utilities
import { loadLastDuration, saveLastDuration } from './utils/storage.js';
import { playStartSound, playCompleteSound, playTickSound, initAudio } from './utils/audio.js';

/**
 * TimerApp class - Main application controller
 * 
 * This class manages the overall app state and coordinates
 * communication between components.
 */
class TimerApp {
  constructor() {
    // Get references to DOM elements
    this.visualTimer = document.getElementById('visual-timer');
    this.timerControls = document.getElementById('timer-controls');
    this.accessibilityPanel = document.getElementById('accessibility-panel');
    this.statusDot = document.querySelector('.status-dot');
    this.completionCelebration = document.getElementById('completion-celebration');
    this.dismissButton = document.getElementById('dismiss-completion');
    
    // Current timer state
    this.currentDuration = loadLastDuration();
    
    // Tick timing - track last tick for 1-second intervals
    this.lastTickTime = 0;
    this.tickInterval = 1000; // 1 second
    
    // Initialize the app
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Set initial duration
    this.visualTimer.duration = this.currentDuration;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply accessibility settings from panel
    this.applyAccessibilitySettings();
    
    // Initialize audio context on first user interaction
    this.setupAudioInitialization();
    
    console.log('🎯 Timer App initialized successfully!');
    console.log('📱 This app is designed to be accessible and kid-friendly');
    console.log('🔧 All code is vanilla JavaScript - no frameworks needed!');
  }

  /**
   * Set up all event listeners for component communication
   */
  setupEventListeners() {
    // Timer controls events
    this.timerControls.addEventListener('timer-start', () => {
      this.visualTimer.start();
      this.updateStatus('running');
      this.timerControls.running = true;
      this.timerControls.paused = false;
      this.lastTickTime = Date.now(); // Reset tick timing on start
      this.keepScreenAwake(true); // Keep screen awake while timer runs
      playStartSound();
    });

    this.timerControls.addEventListener('timer-pause', () => {
      this.visualTimer.pause();
      this.updateStatus('paused');
      this.timerControls.paused = true;
    });

    this.timerControls.addEventListener('timer-resume', () => {
      this.visualTimer.resume();
      this.updateStatus('running');
      this.timerControls.paused = false;
    });

    this.timerControls.addEventListener('timer-reset', () => {
      this.visualTimer.reset();
      this.updateStatus('idle');
      this.timerControls.running = false;
      this.timerControls.paused = false;
      this.lastTickTime = 0; // Reset tick timing
      this.keepScreenAwake(false); // Release screen wake lock
      this.hideCompletion();
    });

    // Duration selection from preset buttons
    this.timerControls.addEventListener('duration-select', (event) => {
      const newDuration = event.detail.duration;
      this.currentDuration = newDuration;
      this.visualTimer.duration = newDuration;
      this.visualTimer.reset();
      saveLastDuration(newDuration);
      this.updateStatus('idle');
      this.timerControls.running = false;
      this.timerControls.paused = false;
    });

    // Visual timer events
    this.visualTimer.addEventListener('timer-complete', () => {
      this.updateStatus('completed');
      this.timerControls.running = false;
      this.timerControls.paused = false;
      this.keepScreenAwake(false); // Release screen wake lock
      this.showCompletion();
      playCompleteSound();
    });

    // Tick sound on timer updates - only play every 1 second
    this.visualTimer.addEventListener('timer-tick', () => {
      const now = Date.now();
      if (now - this.lastTickTime >= this.tickInterval) {
        playTickSound();
        this.lastTickTime = now;
      }
    });

    // Accessibility settings changes
    this.accessibilityPanel.addEventListener('settings-change', (event) => {
      this.applyAccessibilitySettings(event.detail);
    });

    // Completion dismissal
    this.dismissButton.addEventListener('click', () => {
      this.hideCompletion();
    });

    // Keyboard support for completion modal
    this.completionCelebration.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hideCompletion();
      }
    });
  }

  /**
   * Update the status indicator
   * @param {string} state - Current state: 'idle', 'running', 'paused', 'completed'
   */
  updateStatus(state) {
    // Remove all state classes
    this.statusDot.classList.remove('running', 'paused', 'completed');
    
    // Add appropriate class
    if (state !== 'idle') {
      this.statusDot.classList.add(state);
    }
  }

  /**
   * Apply accessibility settings to components
   * @param {Object} settings - Accessibility settings
   */
  applyAccessibilitySettings(settings) {
    if (!settings) {
      settings = this.accessibilityPanel.getSettings();
    }
    
    // Apply high contrast to timer
    this.visualTimer.setHighContrast(settings.highContrast);
    
    // Apply large buttons to controls
    this.timerControls.toggleAttribute('large-buttons', settings.largeButtons);
  }

  /**
   * Show the completion celebration modal
   */
  showCompletion() {
    this.completionCelebration.classList.add('show');
    this.dismissButton.focus();
    
    // Announce to screen readers
    this.announceToScreenReader('Timer complete! Great job!');
  }

  /**
   * Hide the completion celebration modal
   */
  hideCompletion() {
    this.completionCelebration.classList.remove('show');
  }

  /**
   * Announce a message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Set up audio context initialization on first user interaction
   * Browsers require user interaction before audio can play
   */
  setupAudioInitialization() {
    const initAudioOnInteraction = () => {
      initAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
      document.removeEventListener('keydown', initAudioOnInteraction);
    };

    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('touchstart', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
  }

  /**
   * Keep screen awake while timer is running
   * Uses the Screen Wake Lock API if available
   */
  async keepScreenAwake(enabled) {
    if (!('wakeLock' in navigator)) {
      console.log('[PWA] Wake Lock API not supported');
      return;
    }

    try {
      if (enabled) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('[PWA] Screen wake lock activated');
      } else if (this.wakeLock) {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('[PWA] Screen wake lock released');
      }
    } catch (error) {
      console.error('[PWA] Wake lock error:', error);
    }
  }
}

/**
 * Initialize the app when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.timerApp = new TimerApp();
  });
} else {
  window.timerApp = new TimerApp();
}
