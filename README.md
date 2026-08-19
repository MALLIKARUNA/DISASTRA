# DISASTRA — Adaptive Multi-Hazard Disaster Response Platform

> **"When the ground truth changes, our response plan changes with it."**

DISASTRA is an adaptive disaster intelligence and response platform built for Smart India Hackathon.
It continuously combines official information, environmental data, citizen ground truth, and responder
reports — then updates response recommendations in real time, keeping humans in control of every
life-critical decision.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ (running locally on port 27017)

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on: http://localhost:5000  
Health check: http://localhost:5000/api/health

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## 📁 Project Structure

```
disastra/
│
├── frontend/                   # React + Vite + Tailwind CSS
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page components by role
│       ├── layouts/            # Role-based layout wrappers
│       ├── services/           # Axios API service
│       ├── hooks/              # Custom React hooks
│       ├── context/            # Auth context
│       ├── utils/              # Helper utilities
│       └── routes/             # App routing
│
├── backend/                    # Node.js + Express + MongoDB
│   ├── controllers/            # Route handler logic
│   ├── routes/                 # Express route definitions
│   ├── models/                 # Mongoose schemas
│   ├── middleware/             # Auth, error, rate limiting
│   ├── services/               # Business logic services
│   ├── utils/                  # Helper utilities
│   ├── config/                 # DB + environment config
│   ├── seed/                   # Demo seed data
│   └── server.js               # Express entry point
│
└── README.md
```

---

## 🏗️ Build Phases

| Phase | Feature                          | Status  |
|-------|----------------------------------|---------|
| 1     | Project Setup                    | ✅ Done |
| 2     | Authentication + Roles           | ⏳ Next |
| 3     | Citizen SOS / Report             | ⏳      |
| 4     | Incident Management              | ⏳      |
| 5     | Live GIS Map                     | ⏳      |
| 6     | Alerts                           | ⏳      |
| 7     | Evidence + Confidence + Conflict | ⏳      |
| 8     | Exposure + Vulnerability         | ⏳      |
| 9     | Intelligent Priority             | ⏳      |
| 10    | Resource / Capability Matching   | ⏳      |
| 11    | Global Rescue Optimization       | ⏳      |
| 12    | Risk-Aware Route + Shelter/Hosp. | ⏳      |
| 13    | Command Center + Human Approval  | ⏳      |
| 14    | Responder Dashboard              | ⏳      |
| 15    | New Ground Truth                 | ⏳      |
| 16    | Adaptive Re-Optimization         | ⏳      |
| 17    | Decision Audit Timeline          | ⏳      |
| 18    | What-If Simulator                | ⏳      |
| 19    | Offline / PWA / Multilingual     | ⏳      |
| 20    | Seed Data + Demo Scenario        | ⏳      |
| 21    | Testing + Bug Fixing             | ⏳      |
| 22    | UI Polish + SIH Prep             | ⏳      |

---

## ⚙️ Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS v4               |
| Routing  | React Router v6                               |
| State    | TanStack Query v5                             |
| Maps     | React Leaflet / OpenStreetMap                 |
| Backend  | Node.js, Express 4                            |
| Database | MongoDB + Mongoose                            |
| Auth     | JWT + bcryptjs                                |
| HTTP     | Axios (with proxy via Vite dev server)        |

---

## ⚠️ Disclaimer

This is a prototype demonstration platform for Smart India Hackathon.
All data is simulated. This system is NOT certified for real emergency operations.
Always follow official government emergency instructions.
