## Architecture

Shadow Rooms is built as a real-time client/server application rather than a purely frontend prototype.

```text
                         ┌─────────────────────┐
                         │      Web Client     │
                         │   React + TypeScript│
                         └──────────┬──────────┘
                                    │
                         HTTP / REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     API Server      │
                         │ Authentication      │
                         │ Rooms / Users       │
                         │ Messages / Polls    │
                         │ Validation          │
                         └──────────┬──────────┘
                                    │
                         WebSocket Connection
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Real-Time Server   │
                         │ Presence            │
                         │ Room Events         │
                         │ Chat                │
                         │ Typing States       │
                         │ Collaboration       │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
          │  Database   │    │    Redis    │    │   Storage   │
          │ Persistence │    │ State/Cache │    │ Room Assets │
          └─────────────┘    └─────────────┘    └─────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Docker Sandbox    │
                         │ Isolated workloads  │
                         │ / execution layer   │
                         └─────────────────────┘
```

The frontend communicates with the backend through standard HTTP APIs for request/response operations and WebSockets for persistent real-time communication.

This allows room state, presence, messages, typing indicators, collaborative interactions, and other events to propagate without relying on constant client polling.

---

## Technical Stack

### Frontend

* React
* TypeScript
* Vite
* HTML Canvas API
* Client-side state management
* WebSocket client

### Backend

* Node.js
* TypeScript
* HTTP / REST APIs
* WebSocket-based real-time communication
* Server-side validation
* Session / identity management

### Real-Time Systems

WebSockets are used for persistent room connections and event delivery.

The real-time layer handles concepts such as:

* Room joining/leaving
* Presence
* Messages
* Typing indicators
* Room activity
* Poll events
* Collaborative interactions
* Whiteboard events
* Room state synchronization

HTTP remains responsible for operations that don't require a persistent real-time connection.

---

## Data & Infrastructure

The backend is designed around persistent server-side state rather than purely local browser storage.

Depending on the subsystem, the application uses:

* Database-backed persistence
* Redis for transient state and fast-access data
* WebSocket connections for live state propagation
* HTTP APIs for standard application operations

This separation keeps persistent data, ephemeral state, and real-time events from being unnecessarily coupled.

---

## Docker & Sandboxing

Shadow Rooms also includes containerized infrastructure for isolated workloads.

Docker is used to provide controlled execution environments and keep potentially unsafe or resource-intensive operations isolated from the primary application process.

The sandbox architecture is intentionally separated from the main API and real-time services.

```text
Application
     │
     ▼
Sandbox Request
     │
     ▼
Docker Container
     │
     ├── Isolated filesystem
     ├── Resource limits
     ├── Restricted execution
     └── Disposable environment
```

The sandbox layer is designed around the principle that untrusted execution should never happen directly inside the main application process.

---

## Communication Model

Shadow Rooms uses two primary communication paths.

### HTTP

Used for operations such as:

* Authentication
* Account/session operations
* Room creation
* Room discovery
* Friend operations
* Poll management
* Historical data
* Administrative operations

### WebSockets

Used for operations where latency matters:

* Room presence
* Chat messages
* Typing states
* Room activity
* Live reactions
* Poll updates
* Whiteboard synchronization
* Real-time room events

This avoids treating every interaction as an HTTP request while still keeping conventional API operations simple and predictable.

---

## Current System

The project should be viewed as a **working full-stack prototype**, not a production-ready social network.

The product layer is substantially implemented, while production hardening remains a separate stage.

The main remaining engineering concerns are:

* Security hardening
* Authentication/session security
* Abuse prevention
* Rate limiting
* WebSocket connection management
* Horizontal scaling
* Persistent event handling
* Sandbox hardening
* Observability
* Automated testing
* Production deployment

---

## Technology Summary

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Client             | React + TypeScript                      |
| Build              | Vite                                    |
| API                | HTTP / REST                             |
| Real-Time          | WebSockets                              |
| Backend            | Node.js + TypeScript                    |
| Persistence        | Database                                |
| Fast State / Cache | Redis                                   |
| Graphics           | HTML Canvas                             |
| Isolation          | Docker                                  |
| Execution          | Sandboxed containers                    |
| Communication      | HTTP + WebSockets                       |
| Architecture       | Client / Server + Real-Time Event Layer |

```
```
