# Pole Watch — Rural Electricity Pole Complaint System (CSP Project)

A complete full-stack web application designed for the Community Service Project (CSP): villagers record a voice message and share their GPS location to report a missing or hazardous electricity pole. The Electricity Department reviews, verifies, tracks each complaint through to resolution, and exports reports for documentation.

```
csp/
├── backend/            Node.js + Express API (JSON storage, audio uploads)
│   ├── data/           complaints.json & villagers.json
│   ├── uploads/        Voice recordings (.wav / .webm)
│   └── server.js       REST API on port 4000
├── frontend/           React + Vite web app (Tailwind/CSS, Lucide icons)
│   └── src/            App.jsx, api.js, main.jsx
├── start-csp.bat       One-click Windows launcher (starts both servers & opens browser)
├── run-all.js          Unified Node runner (starts backend + frontend simultaneously)
├── package.json        Root scripts (`npm start`, `npm run build`)
└── README.md
```

---

## ⚡ Quick Start

### Option 1: One-Click Launcher (Recommended for Windows)
Double-click `start-csp.bat` in the project root.
- It automatically launches the Backend on `http://localhost:4000`
- Launches the Frontend on `http://localhost:5173`
- Opens your web browser automatically!

### Option 2: Command Line (From root)
```bash
npm start
```
Or to run individually:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 👥 Demo Logins & Test Data

The project is pre-populated with 6 realistic rural complaints across village locations:

### 1. Villager Portal
- **Login**: Enter any 10-digit mobile number, or pick a pre-populated villager:
  - **Ramesh Kumar** (`9848012345`) — *Pending complaint (Kankipadu)*
  - **Radha Devi** (`9440156789`) — *Verified complaint (Gosala PHC)*
  - **Srinivasa Rao** (`9866234567`) — *Pending agricultural gap (Punadipadu)*
- **Features**:
  - Live microphone voice note recorder with preview and delete
  - One-tap GPS location pin & OpenStreetMap preview
  - Real-time status tracker (Pending → Verified → Resolved)

### 2. Electricity Department (Admin Portal)
- **Login Password**: `gridadmin`
- **Features**:
  - **KPI Metrics Header**: Real-time summary of Total, Pending, Verified, and Resolved counts
  - **Instant Search**: Search complaints by villager name, mobile number, complaint ID, or village notes
  - **Audio Player**: Listen to authentic voice recordings from villagers
  - **Interactive Map**: Embedded OpenStreetMap preview + direct link to full satellite view
  - **Status Updates**: Update complaint status (`Mark verified`, `Pole installed`, `Not genuine`, `Reset`)
  - **CSV Report Export**: One-click download of the complete complaints report (`CSP_Pole_Watch_Report.csv`) for project documentation and college review

---

## 📡 API Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/villagers` | None | Create/find a villager profile by phone |
| POST | `/api/complaints` | None | Submit a complaint (multipart: `audio`, `phone`, `villagerName`, `lat`, `lng`, `note`) |
| GET | `/api/complaints/mine?phone=` | None | A villager's own complaints |
| GET | `/api/complaints/pending-count` | None | Count of pending complaints (for the home badge) |
| GET | `/api/complaints` | Bearer token | All complaints (Electricity Dept) |
| GET | `/api/complaints/new-count?since=` | Bearer token | Count of complaints created after a timestamp |
| PATCH | `/api/complaints/:id` | Bearer token | Update status: `Pending`, `Verified`, `Resolved`, `Rejected` |
| POST | `/api/admin/login` | None | Department authentication (`gridadmin`) |
| GET | `/api/health` | None | Health check endpoint |
