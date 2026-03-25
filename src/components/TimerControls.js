/**
 * TimerControls.js - Control buttons for the timer
 * 
 * This component provides large, touch-friendly buttons for
 * controlling the timer. It uses icons instead of text/numbers
 * and includes preset duration buttons.
 * 
 * Usage:
 * <timer-controls></timer-controls>
 */

class TimerControls extends HTMLElement {
  /**
   * Observed attributes
   */
  static get observedAttributes() {
    return ['running', 'paused', 'large-buttons'];
  }

  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });
    
    this._running = false;
    this._paused = false;
    this._largeButtons = false;
    
    // Preset durations in milliseconds (no numbers shown to user)
    this._presets = [
      { duration: 300000, label: 'Short time' },    // 5 minutes
      { duration: 600000, label: 'Medium time' },   // 10 minutes
      { duration: 900000, label: 'Longer time' },   // 15 minutes
      { duration: 1200000, label: 'Long time' },    // 20 minutes
      { duration: 1800000, label: 'Very long time' } // 30 minutes
    ];
    
    this.render();
  }

  /**
   * Lifecycle: Element added to DOM
   */
  connectedCallback() {
    this.attachEventListeners();
  }

  /**
   * Lifecycle: Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'running':
        this._running = newValue !== null;
        this.updatePlayButton();
        break;
      case 'paused':
        this._paused = newValue !== null;
        this.updatePlayButton();
        break;
      case 'large-buttons':
        this._largeButtons = newValue !== null;
        this.updateButtonSizes();
        break;
    }
  }

  /**
   * Getters and setters
   */
  get running() {
    return this._running;
  }

  set running(value) {
    if (value) {
      this.setAttribute('running', '');
    } else {
      this.removeAttribute('running');
    }
  }

  get paused() {
    return this._paused;
  }

  set paused(value) {
    if (value) {
      this.setAttribute('paused', '');
    } else {
      this.removeAttribute('paused');
    }
  }

  /**
   * Attach event listeners to buttons
   */
  attachEventListeners() {
    const shadow = this.shadowRoot;

    // Play/Pause button
    const playBtn = shadow.getElementById('play-btn');
    playBtn.addEventListener('click', () => this.handlePlayClick());

    // Reset button
    const resetBtn = shadow.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => this.handleResetClick());

    // Preset duration buttons
    const presetBtns = shadow.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const preset = this._presets[index];
        if (preset) {
          this.dispatchEvent(new CustomEvent('duration-select', {
            bubbles: true,
            detail: { duration: preset.duration }
          }));
        }
      });
    });
  }

  /**
   * Handle play/pause button click
   */
  handlePlayClick() {
    if (this._running) {
      if (this._paused) {
        this.dispatchEvent(new CustomEvent('timer-resume', { bubbles: true }));
      } else {
        this.dispatchEvent(new CustomEvent('timer-pause', { bubbles: true }));
      }
    } else {
      this.dispatchEvent(new CustomEvent('timer-start', { bubbles: true }));
    }
  }

  /**
   * Handle reset button click
   */
  handleResetClick() {
    this.dispatchEvent(new CustomEvent('timer-reset', { bubbles: true }));
  }

  /**
   * Update the play button icon based on state
   */
  updatePlayButton() {
    const playBtn = this.shadowRoot.getElementById('play-btn');
    if (!playBtn) return;

    const icon = playBtn.querySelector('svg');
    
    if (this._running && !this._paused) {
      // Show pause icon
      icon.innerHTML = `
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
      `;
      playBtn.setAttribute('aria-label', 'Pause timer');
    } else {
      // Show play icon
      icon.innerHTML = `
        <polygon points="5 3 19 12 5 21" fill="currentColor"/>
      `;
      playBtn.setAttribute('aria-label', this._paused ? 'Resume timer' : 'Start timer');
    }
  }

  /**
   * Update button sizes based on large-buttons setting
   */
  updateButtonSizes() {
    const container = this.shadowRoot.querySelector('.controls-container');
    if (container) {
      if (this._largeButtons) {
        container.classList.add('large-buttons');
      } else {
        container.classList.remove('large-buttons');
      }
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
        }

        .controls-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .main-controls {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .preset-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        button {
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          touch-action: manipulation;
        }

        button:hover {
          transform: scale(1.05);
        }

        button:active {
          transform: scale(0.95);
        }

        button:focus-visible {
          outline: 3px solid #2196f3;
          outline-offset: 2px;
        }

        .control-btn {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .control-btn svg {
          width: 40px;
          height: 40px;
        }

        .preset-btn {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          box-shadow: 0 4px 10px rgba(240, 147, 251, 0.4);
        }

        .preset-btn svg {
          width: 30px;
          height: 30px;
        }

        /* Large button styles */
        .large-buttons .control-btn {
          width: 100px;
          height: 100px;
        }

        .large-buttons .control-btn svg {
          width: 50px;
          height: 50px;
        }

        .large-buttons .preset-btn {
          width: 80px;
          height: 80px;
        }

        .large-buttons .preset-btn svg {
          width: 40px;
          height: 40px;
        }

        @media (max-width: 480px) {
          .control-btn {
            width: 70px;
            height: 70px;
          }

          .control-btn svg {
            width: 35px;
            height: 35px;
          }

          .preset-btn {
            width: 50px;
            height: 50px;
          }

          .preset-btn svg {
            width: 25px;
            height: 25px;
          }
        }
      </style>

      <div class="controls-container">
        <div class="main-controls">
          <button id="play-btn" class="control-btn" aria-label="Start timer">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5 3 19 12 5 21" fill="currentColor"/>
            </svg>
          </button>
          
          <button id="reset-btn" class="control-btn" aria-label="Reset timer">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" 
                    fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="preset-controls">
          ${this._presets.map((preset, index) => `
            <button class="preset-btn" aria-label="${preset.label}">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${this.getPresetIcon(index)}
              </svg>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Get SVG icon for preset button based on index
   */
  getPresetIcon(index) {
    // Different simple shapes for each preset
    const icons = [
      // Short time - small circle
      '<circle cx="12" cy="12" r="6" fill="currentColor"/>',
      // Medium time - medium circle
      '<circle cx="12" cy="12" r="8" fill="currentColor"/>',
      // Longer time - large circle
      '<circle cx="12" cy="12" r="10" fill="currentColor"/>',
      // Long time - filled square
      '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
      // Very long time - star
      '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>'
    ];
    
    return icons[index] || icons[0];
  }
}

// Register the custom element
customElements.define('timer-controls', TimerControls);

export { TimerControls };
