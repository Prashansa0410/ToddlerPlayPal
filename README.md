# Toddler Play Pal – Vocal Bridge Integration

This repository contains a ready-to-adapt integration template for connecting the **Toddler Play Pal** voice agent over **LiveKit WebRTC**.

## What is included

- A backend token endpoint that calls Vocal Bridge securely using `VOCAL_BRIDGE_API_KEY`.
- A React hook for connecting to LiveKit and handling:
  - agent audio playback
  - `heartbeat` / optional `heartbeat_ack`
  - built-in `send_transcript` stream
  - custom client actions
- A simple React UI component to start/end voice chat, toggle mic, and show transcript.

## Agent configuration

- Agent name: `Toddler Play Pal`
- Mode: `openai_concierge`
- Greeting:
  - `Hi there! I'm Play Pal! Are you ready to play? Let's have some fun together!`

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure env vars

Copy `.env.example` to `.env` and set your key:

```bash
cp .env.example .env
```

### 3) Start backend

```bash
npm run dev:server
```

### 4) Use the React files

Integrate `src/useVoiceAgent.ts` and `src/VoiceAgentPanel.tsx` into your frontend app.

## Security notes

- Never expose `VOCAL_BRIDGE_API_KEY` in browser/mobile client code.
- Always issue LiveKit session tokens from a backend endpoint.
- Request fresh tokens as needed (tokens expire in ~1 hour).
