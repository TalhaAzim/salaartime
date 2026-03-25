/**
 * Timer.js - Pure timer logic without any DOM manipulation
 * 
 * This class handles all the timing calculations and state management.
 * It emits events that other parts of the app can listen to.
 */

/**
 * Event names for timer state changes
 */
const TIMER_EVENTS = {
  START: 'timer:start',
  PAUSE: 'timer:pause',
  RESUME: 'timer:resume',
  STOP: 'timer:stop',
  TICK: 'timer:tick',
  COMPLETE: 'timer:complete'
};

/**
 * Timer class - Manages countdown timing logic
 * 
 * @example
 * const timer = new Timer(300000); // 5 minutes in milliseconds
 * timer.on('tick', (remaining) => console.log(remaining));
 * timer.start();
 */
class Timer {
  /**
   * Creates a new Timer instance
   * @param {number} duration - Total duration in milliseconds
   */
  constructor(duration) {
    this.duration = duration;
    this.remaining = duration;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pauseTime = null;
    this.animationFrameId = null;
    this.eventListeners = new Map();
  }

  /**
   * Register an event listener
   * @param {string} event - Event name from TIMER_EVENTS
   * @param {Function} callback - Function to call when event fires
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Function to remove
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Start the timer from the beginning
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.remaining = this.duration;

    this.emit(TIMER_EVENTS.START, {
      duration: this.duration,
      remaining: this.remaining
    });

    this.tick();
  }

  /**
   * Pause the timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.pauseTime = Date.now();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emit(TIMER_EVENTS.PAUSE, {
      duration: this.duration,
      remaining: this.remaining
    });
  }

  /**
   * Resume the timer from where it was paused
   */
  resume() {
    if (!this.isRunning || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    // Adjust start time to account for the pause duration
    const pauseDuration = Date.now() - this.pauseTime;
    this.startTime += pauseDuration;
    this.pauseTime = null;

    this.emit(TIMER_EVENTS.RESUME, {
      duration: this.duration,
      remaining: this.remaining
    });

    this.tick();
  }

  /**
   * Stop the timer completely
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emit(TIMER_EVENTS.STOP, {
      duration: this.duration,
      remaining: this.remaining
    });
  }

  /**
   * Reset the timer to its initial state
   */
  reset() {
    this.stop();
    this.remaining = this.duration;
    this.startTime = null;
    this.pauseTime = null;
  }

  /**
   * The main tick loop - updates remaining time and checks for completion
   * Uses requestAnimationFrame for smooth updates
   */
  tick() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    const now = Date.now();
    const elapsed = now - this.startTime;
    this.remaining = Math.max(0, this.duration - elapsed);

    // Calculate progress as a value between 0 and 1
    const progress = this.remaining / this.duration;

    this.emit(TIMER_EVENTS.TICK, {
      duration: this.duration,
      remaining: this.remaining,
      elapsed: elapsed,
      progress: progress
    });

    // Check if timer is complete
    if (this.remaining <= 0) {
      this.complete();
      return;
    }

    // Schedule next tick
    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  /**
   * Handle timer completion
   */
  complete() {
    this.isRunning = false;
    this.remaining = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emit(TIMER_EVENTS.COMPLETE, {
      duration: this.duration,
      remaining: 0
    });
  }

  /**
   * Get the current progress as a percentage (0-100)
   * @returns {number} Progress percentage
   */
  getProgressPercentage() {
    return (this.remaining / this.duration) * 100;
  }

  /**
   * Get the current progress as a decimal (0-1)
   * @returns {number} Progress decimal
   */
  getProgress() {
    return this.remaining / this.duration;
  }

  /**
   * Change the timer duration
   * @param {number} newDuration - New duration in milliseconds
   */
  setDuration(newDuration) {
    this.duration = newDuration;
    if (!this.isRunning) {
      this.remaining = newDuration;
    }
  }
}

export { Timer, TIMER_EVENTS };
