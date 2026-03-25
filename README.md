# Salaar Time

A gentle, accessible visual timer designed for kids on the spectrum who are fascinated by numbers.

## About This Project

**Important Note:** This project was built collaboratively with [Kimi](https://kimi.moonshot.cn/), an AI assistant. I have no intention of claiming I hand-wrote any of this code until I actually do. This is a learning project for me, and I wanted to be completely transparent about its origins.

## Why This Exists

Kids on the spectrum often get hyper-focused on numbers, which can make traditional timers counterproductive. This timer shows time passing through colors and visual progress instead of digits.

## Design Decisions

### No Numbers, Just Colors
- **Why:** Prevents number fixation and distraction
- **Implementation:** Circular progress ring that fills with color (green → yellow → orange → red)

### Web Components Architecture
- **Why:** Self-contained, reusable components that are easy to understand and modify
- **Implementation:** Native custom elements with shadow DOM

### Ring Buffer Audio System
- **Why:** Prevents sound overlap while keeping code simple
- **Implementation:** 4-voice ring buffer with hard clipping

### All Sounds Default to OFF
- **Why:** Sensory safety - users must opt-in
- **Implementation:** Three independent toggles (start, complete, tick)

### PWA with Offline Support
- **Why:** Works anywhere, feels like a native app
- **Implementation:** Service worker, manifest, installable

### Screen Wake Lock
- **Why:** Phone shouldn't sleep while timer is running
- **Implementation:** Wake Lock API with graceful fallback

## Tech Stack

- **Framework:** None (vanilla JS)
- **Build Tool:** Vite
- **Components:** Native Web Components
- **Audio:** Web Audio API
- **Storage:** localStorage
- **Hosting:** Cloudflare Pages

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## License

MIT License - See [LICENSE](LICENSE) file

## Contributing

Since this is a learning project, I'm open to suggestions and improvements. Feel free to open issues or PRs.
