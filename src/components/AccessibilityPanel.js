/**
 * AccessibilityPanel.js - Accessibility settings panel
 * 
 * This component provides a settings panel for accessibility features
 * like high contrast mode, reduced motion, and large buttons.
 * It's designed to be simple and kid-friendly.
 * 
 * Usage:
 * <accessibility-panel></accessibility-panel>
 */

import { loadAccessibilitySettings, saveAccessibilitySettings, loadAudioSettings, saveAudioSettings } from '../utils/storage.js';
import { setAllAudioSettings, testSound } from '../utils/audio.js';

class AccessibilityPanel extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });
    
    // Load saved settings or use defaults
    this._settings = loadAccessibilitySettings();
    this._audioSettings = loadAudioSettings();
    this._isOpen = false;
    
    this.render();
  }

  /**
   * Lifecycle: Element added to DOM
   */
  connectedCallback() {
    this.attachEventListeners();
    this.applySettings();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const shadow = this.shadowRoot;

    // Toggle panel button
    const toggleBtn = shadow.getElementById('toggle-btn');
    toggleBtn.addEventListener('click', () => this.togglePanel());

    // High contrast toggle
    const highContrastToggle = shadow.getElementById('high-contrast');
    highContrastToggle.addEventListener('change', (e) => {
      this._settings.highContrast = e.target.checked;
      this.saveAndApply();
    });

    // Reduced motion toggle
    const reducedMotionToggle = shadow.getElementById('reduced-motion');
    reducedMotionToggle.addEventListener('change', (e) => {
      this._settings.reducedMotion = e.target.checked;
      this.saveAndApply();
    });

    // Large buttons toggle
    const largeButtonsToggle = shadow.getElementById('large-buttons');
    largeButtonsToggle.addEventListener('change', (e) => {
      this._settings.largeButtons = e.target.checked;
      this.saveAndApply();
    });

    // Audio toggles
    const startSoundToggle = shadow.getElementById('start-sound');
    startSoundToggle.addEventListener('change', (e) => {
      this._audioSettings.startSound = e.target.checked;
      this.saveAudioAndApply();
      if (e.target.checked) {
        testSound('startSound');
      }
    });

    const completeSoundToggle = shadow.getElementById('complete-sound');
    completeSoundToggle.addEventListener('change', (e) => {
      this._audioSettings.completeSound = e.target.checked;
      this.saveAudioAndApply();
      if (e.target.checked) {
        testSound('completeSound');
      }
    });

    const tickSoundToggle = shadow.getElementById('tick-sound');
    tickSoundToggle.addEventListener('change', (e) => {
      this._audioSettings.tickSound = e.target.checked;
      this.saveAudioAndApply();
      if (e.target.checked) {
        testSound('tickSound');
      }
    });
  }

  /**
   * Toggle the panel open/closed
   */
  togglePanel() {
    this._isOpen = !this._isOpen;
    const panel = this.shadowRoot.getElementById('panel');
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    
    if (this._isOpen) {
      panel.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      panel.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Save settings and apply them
   */
  saveAndApply() {
    saveAccessibilitySettings(this._settings);
    this.applySettings();
    
    // Dispatch event so parent components can react
    this.dispatchEvent(new CustomEvent('settings-change', {
      bubbles: true,
      detail: { 
        ...this._settings,
        ...this._audioSettings
      }
    }));
  }

  /**
   * Save audio settings and apply them
   */
  saveAudioAndApply() {
    saveAudioSettings(this._audioSettings);
    setAllAudioSettings(this._audioSettings);
    
    // Dispatch event so parent components can react
    this.dispatchEvent(new CustomEvent('settings-change', {
      bubbles: true,
      detail: { 
        ...this._settings,
        ...this._audioSettings
      }
    }));
  }

  /**
   * Apply current settings to the UI
   */
  applySettings() {
    const shadow = this.shadowRoot;
    
    // Update toggle states
    shadow.getElementById('high-contrast').checked = this._settings.highContrast;
    shadow.getElementById('reduced-motion').checked = this._settings.reducedMotion;
    shadow.getElementById('large-buttons').checked = this._settings.largeButtons;

    // Update audio toggle states
    shadow.getElementById('start-sound').checked = this._audioSettings.startSound;
    shadow.getElementById('complete-sound').checked = this._audioSettings.completeSound;
    shadow.getElementById('tick-sound').checked = this._audioSettings.tickSound;

    // Apply to document body for global CSS hooks
    document.body.classList.toggle('high-contrast', this._settings.highContrast);
    document.body.classList.toggle('reduced-motion', this._settings.reducedMotion);
    document.body.classList.toggle('large-buttons', this._settings.largeButtons);

    // Apply audio settings
    setAllAudioSettings(this._audioSettings);
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this._settings };
  }

  /**
   * Render the component
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .accessibility-container {
          position: relative;
        }

        #toggle-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s;
        }

        #toggle-btn:hover {
          transform: scale(1.1);
        }

        #toggle-btn:focus-visible {
          outline: 3px solid #2196f3;
          outline-offset: 2px;
        }

        #toggle-btn svg {
          width: 28px;
          height: 28px;
        }

        #panel {
          position: absolute;
          top: 60px;
          right: 0;
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          min-width: 250px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
        }

        #panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .panel-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #333;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .setting-item:last-child {
          margin-bottom: 0;
        }

        .setting-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .setting-label {
          font-size: 16px;
          color: #555;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .setting-label svg {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        /* Toggle switch */
        .toggle {
          position: relative;
          width: 50px;
          height: 28px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 28px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        input:focus-visible + .toggle-slider {
          outline: 3px solid #2196f3;
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          :host {
            top: 10px;
            right: 10px;
          }

          #toggle-btn {
            width: 44px;
            height: 44px;
          }

          #toggle-btn svg {
            width: 24px;
            height: 24px;
          }

          #panel {
            right: -10px;
            min-width: 220px;
            padding: 16px;
          }
        }
      </style>

      <div class="accessibility-container">
        <button id="toggle-btn" aria-label="Accessibility settings" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="currentColor"/>
          </svg>
        </button>

        <div id="panel" role="dialog" aria-label="Accessibility settings">
          <h2 class="panel-title">Settings</h2>
          
          <div class="setting-item">
            <label class="setting-label" for="high-contrast">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000 1.41.996.996 0 001.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06z" 
                      fill="currentColor"/>
              </svg>
              High contrast
            </label>
            <label class="toggle">
              <input type="checkbox" id="high-contrast">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <label class="setting-label" for="reduced-motion">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" 
                      fill="currentColor"/>
              </svg>
              Reduced motion
            </label>
            <label class="toggle">
              <input type="checkbox" id="reduced-motion">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <label class="setting-label" for="large-buttons">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 18H6v-5h2v5zm4 0h-2v-8h2v8zm4 0h-2v-3h2v3zm0-5h-2v-2h2v2zm0-4h-2V6h2v3z" 
                      fill="currentColor"/>
              </svg>
              Large buttons
            </label>
            <label class="toggle">
              <input type="checkbox" id="large-buttons">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-section">
            <h3 class="section-title">Sounds</h3>
            
            <div class="setting-item">
              <label class="setting-label" for="start-sound">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" 
                        fill="currentColor"/>
                </svg>
                Start sound
              </label>
              <label class="toggle">
                <input type="checkbox" id="start-sound">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label" for="complete-sound">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                        fill="currentColor"/>
                </svg>
                Complete sound
              </label>
              <label class="toggle">
                <input type="checkbox" id="complete-sound">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label" for="tick-sound">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.87 15.25l-3.37-2V8.72c0-.35-.28-.64-.64-.64h-.85c-.35 0-.64.28-.64.64v5.04l3.75 2.21c.31.18.7.08.88-.23l.42-.72c.19-.31.08-.71-.23-.89zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
                        fill="currentColor"/>
                </svg>
                Tick sounds
              </label>
              <label class="toggle">
                <input type="checkbox" id="tick-sound">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('accessibility-panel', AccessibilityPanel);

export { AccessibilityPanel };
