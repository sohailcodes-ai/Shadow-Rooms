# Shadow Rooms

> A room-based social collaboration prototype built around controlled identity, private spaces, and expressive group interaction.

Shadow Rooms explores a simple idea: online conversations should feel alive without forcing every interaction into a public profile, follower system, or permanent social feed.

Users can create public or private hangouts, connect with friends, chat inside rooms, open direct messages, launch polls, and collaborate on a shared whiteboard. The current repository is an interactive frontend prototype focused on product design, UI systems, and social interaction mechanics.

---

## Core Idea

Shadow Rooms is designed around **structured privacy**:

- Identity exists where it is useful
- Conversations stay inside the product
- Private rooms are controlled through invite keys
- Public rooms remain discoverable for open participation
- Collaboration tools are part of the conversation, not separate utilities

This is not an anonymous chaos app and it is not a public-content platform.

---

## Current Prototype Features

### Identity and Access

- Sign-up and login interface
- Visible display names and usernames
- Friend discovery by username
- Friend-request workflow
- Lightweight presence tracking

### Public and Private Rooms

- Create public hangouts that anyone can discover
- Create private hangouts with generated invite keys
- Copy and share private-room access keys
- Track room presence and activity states

### Event Modes

Each room can be launched with a different interaction style:

| Mode | Purpose |
| --- | --- |
| Default | Balanced group conversation |
| Chill | Relaxed hangout with slower energy growth |
| Debate | Faster-paced discussion with higher activity gain |
| Confession | Anonymous-style message display inside the room |
| Chaos | Maximum-energy interaction mode |

### Social Physics

Rooms have a dynamic energy system:

- Messages increase room energy
- Different event modes change energy growth and decay
- Interactive actions can boost the room atmosphere
- The interface reacts visually as the room becomes more active

### Messaging and Interaction

- Room-based chat interface
- Typing-state UI
- Direct-message windows for friends
- Poll creation and voting
- Confetti interaction for lightweight social feedback

### Shared Whiteboard

- Canvas-based drawing interface
- Adjustable path rendering with neon-style effects
- Shared cursor state
- Clear-board action
- Near-real-time polling simulation for collaborative updates

### Admin View

- Activity logging
- User-presence visibility
- Room and interaction overview

---

## Architecture

The current version is a frontend prototype.

```text
React UI
   ↓
TypeScript application logic
   ↓
In-memory mock data layer
   ↓
Local browser state + polling-based simulation
```

The prototype intentionally focuses on product behavior and interface design before introducing a production backend.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Whiteboard | HTML Canvas API |
| Client State | React state, local browser storage, in-memory data layer |
| Collaboration Prototype | Polling-based near-real-time simulation |

---

## Prototype Status

Shadow Rooms is currently a **functional frontend prototype**, not a production-ready social platform.

The current authentication flow, room data, messages, presence states, and whiteboard data are handled through an in-memory mock data layer. Data is not persisted across server restarts or shared through a real backend yet.

That limitation is intentional at this stage: the repository demonstrates product direction, interaction design, and frontend architecture without pretending that the backend layer is complete.

---

## Planned Production Upgrades

- Persistent database for users, rooms, messages, and whiteboard state
- Secure authentication with session management
- WebSocket-based real-time synchronization
- Server-side validation for private-room keys
- Rate limiting and abuse prevention
- Persistent message history
- Production-ready deployment architecture
- Automated tests for critical interaction flows

---

## Run Locally

```bash
git clone https://github.com/sohailcodes-ai/Shadow-Rooms.git
cd Shadow-Rooms
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Design Direction

Shadow Rooms is built around a dark, neon-style interface with glassmorphism-inspired components. The visual system is intended to make rooms feel active and social without turning the UI into a noisy feed.

The long-term goal is a private-first communication product where chat, rooms, presence, polls, and collaborative tools work together as one coherent experience.

---

## Author

Built by **Sohail Ali**.

- GitHub: https://github.com/sohailcodes-ai
- Portfolio: https://samx-portfolio.vercel.app
