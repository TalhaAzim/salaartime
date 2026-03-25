/**
 * VisualTimer.js - Main timer web component
 * 
 * This is the primary timer component that displays the visual countdown.
 * It combines the ProgressRing with the Timer logic to create an
 * accessible, visual timer without any numbers.
 * 
 * Usage:
 * <visual-timer duration="300000"></visual-timer>
 */

import { Timer, TIMER_EVENTS } from '../utils/Timer.js';
import { getColorForProgress, getHighContrastColor } from '../utils/colors.js';
import './ProgressRing.js';

class VisualTimer extends HTMLElement {
  /**
   * Observed attributes that trigger updates
   */
  static get observedAttributes() {
    return ['duration'];
  }

  constructor() {
    super();
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Default duration: 5 minutes (300000ms)
    this._duration = 300000;
    this._timer = null;
    this._highContrast = false;
    
    // Bind methods to preserve 'this' context
    this.handleTimerTick = this.handleTimerTick.bind(this);
    this.handleTimerComplete = this.handleTimerComplete.bind(this);
    
    this.render();
  }

  /**
   * Lifecycle: Element added to DOM
   */
  connectedCallback() {
    // Initialize timer with current duration
    this._timer = new Timer(this._duration);
    
    // Set up event listeners
    this._timer.on(TIMER_EVENTS.TICK, this.handleTimerTick);
    this._timer.on(TIMER_EVENTS.COMPLETE, this.handleTimerComplete);
    
    // Update initial state
    this.updateDisplay(1.0);
  }

  /**
   * Lifecycle: Element removed from DOM
   */
  disconnectedCallback() {
    // Clean up timer to prevent memory leaks
    if (this._timer) {
      this._timer.stop();
      this._timer.off(TIMER_EVENTS.TICK, this.handleTimerTick);
      this._timer.off(TIMER_EVENTS.COMPLETE, this.handleTimerComplete);
    }
  }

  /**
   * Lifecycle: Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'duration' && oldValue !== newValue) {
      this._duration = parseInt(newValue) || 300000;
      if (this._timer) {
        this._timer.setDuration(this._duration);
      }
    }
  }

  /**
   * Getters and setters
   */
  get duration() {
    return this._duration;
  }

  set duration(value) {
    this._duration = value;
    this.setAttribute('duration', value);
  }

  get isRunning() {
    return this._timer?.isRunning || false;
  }

  get isPaused() {
    return this._timer?.isPaused || false;
  }

  /**
   * Timer control methods
   */
  start() {
    if (this._timer) {
      this._timer.start();
      this.setAttribute('running', '');
      this.dispatchEvent(new CustomEvent('timer-start', { 
        bubbles: true,
        detail: { duration: this._duration }
      }));
    }
  }

  pause() {
    if (this._timer) {
      this._timer.pause();
      this.removeAttribute('running');
      this.setAttribute('paused', '');
      this.dispatchEvent(new CustomEvent('timer-pause', { bubbles: true }));
    }
  }

  resume() {
    if (this._timer) {
      this._timer.resume();
      this.setAttribute('running', '');
      this.removeAttribute('paused');
      this.dispatchEvent(new CustomEvent('timer-resume', { bubbles: true }));
    }
  }

  stop() {
    if (this._timer) {
      this._timer.stop();
      this.removeAttribute('running');
      this.removeAttribute('paused');
      this.dispatchEvent(new CustomEvent('timer-stop', { bubbles: true }));
    }
  }

  reset() {
    if (this._timer) {
      this._timer.reset();
      this.removeAttribute('running');
      this.removeAttribute('paused');
      this.updateDisplay(1.0);
      this.dispatchEvent(new CustomEvent('timer-reset', { bubbles: true }));
    }
  }

  /**
   * Set high contrast mode
   */
  setHighContrast(enabled) {
    this._highContrast = enabled;
    this.updateDisplay(this._timer?.getProgress() || 1.0);
  }

  /**
   * Event handler: Timer tick
   */
  handleTimerTick(data) {
    this.updateDisplay(data.progress);
    
    this.dispatchEvent(new CustomEvent('timer-tick', {
      bubbles: true,
      detail: { progress: data.progress }
    }));
  }

  /**
   * Event handler: Timer complete
   */
  handleTimerComplete() {
    this.removeAttribute('running');
    this.removeAttribute('paused');
    this.updateDisplay(0);
    
    this.dispatchEvent(new CustomEvent('timer-complete', { bubbles: true }));
  }

  /**
   * Update the visual display based on progress
   */
  updateDisplay(progress) {
    const ring = this.shadowRoot.querySelector('progress-ring');
    if (ring) {
      ring.progress = progress;
      ring.color = this._highContrast 
        ? getHighContrastColor(progress)
        : getColorForProgress(progress);
    }
  }

  /**
   * Render the component
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .timer-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        progress-ring {
          width: 300px;
          height: 300px;
        }

        @media (max-width: 480px) {
          progress-ring {
            width: 250px;
            height: 250px;
          }
        }
      </style>

      <div class="timer-container">
        <progress-ring progress="1" color="#4caf50"
                      size="300" stroke-width="20"></progress-ring>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('visual-timer', VisualTimer);

export { VisualTimer };
