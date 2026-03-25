/**
 * ProgressRing.js - A reusable SVG progress ring web component
 * 
 * This component draws a circular progress indicator using SVG.
 * It's used by the VisualTimer component to show time passing.
 * 
 * Usage:
 * <progress-ring progress="0.75" color="green"></progress-ring>
 */

class ProgressRing extends HTMLElement {
  /**
   * Observed attributes - these trigger attributeChangedCallback when modified
   */
  static get observedAttributes() {
    return ['progress', 'color', 'size', 'stroke-width'];
  }

  constructor() {
    super();
    
    // Create a shadow DOM for encapsulation
    this.attachShadow({ mode: 'open' });
    
    // Default values
    this._progress = 1.0;  // 1.0 = full, 0.0 = empty
    this._color = '#4caf50';
    this._size = 300;
    this._strokeWidth = 20;
    
    // Render the initial component
    this.render();
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    this.updateRing();
  }

  /**
   * Called when an observed attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'progress':
        this._progress = parseFloat(newValue) || 0;
        break;
      case 'color':
        this._color = newValue || '#4caf50';
        break;
      case 'size':
        this._size = parseInt(newValue) || 300;
        break;
      case 'stroke-width':
        this._strokeWidth = parseInt(newValue) || 20;
        break;
    }

    this.updateRing();
  }

  /**
   * Getters and setters for reactive properties
   */
  get progress() {
    return this._progress;
  }

  set progress(value) {
    this._progress = Math.max(0, Math.min(1, value));
    this.setAttribute('progress', this._progress);
    this.updateRing();
  }

  get color() {
    return this._color;
  }

  set color(value) {
    this._color = value;
    this.setAttribute('color', value);
    this.updateRing();
  }

  /**
   * Renders the component's HTML and CSS
   */
  render() {
    const radius = (this._size - this._strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${this._size}px;
          height: ${this._size}px;
        }

        .progress-ring {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .progress-ring-circle {
          fill: none;
          stroke-width: ${this._strokeWidth};
          stroke-linecap: round;
          transition: stroke-dashoffset 0.1s linear;
        }

        .progress-ring-bg {
          stroke: #e0e0e0;
        }

        .progress-ring-fill {
          stroke: ${this._color};
        }
      </style>

      <svg class="progress-ring" viewBox="0 0 ${this._size} ${this._size}"
           role="img" aria-label="Progress indicator">
        <circle class="progress-ring-circle progress-ring-bg"
                cx="${this._size / 2}"
                cy="${this._size / 2}"
                r="${radius}"></circle>
        <circle class="progress-ring-circle progress-ring-fill"
                cx="${this._size / 2}"
                cy="${this._size / 2}"
                r="${radius}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="0"></circle>
      </svg>
    `;

    this._circumference = circumference;
  }

  /**
   * Updates the ring's visual state based on current progress
   */
  updateRing() {
    const fillCircle = this.shadowRoot.querySelector('.progress-ring-fill');
    if (!fillCircle) return;

    // Calculate how much of the circle to show
    const offset = this._circumference * (1 - this._progress);
    
    fillCircle.style.strokeDashoffset = offset;
    fillCircle.style.stroke = this._color;
  }
}

// Register the custom element
customElements.define('progress-ring', ProgressRing);

export { ProgressRing };
