const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { nanoid } = require("nanoid");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Prototype-only admin password. Change this and move it to a real secret
// manager / env var before using this anywhere near production.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gridadmin";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gridadmin-session-token";

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = file.originalname && file.originalname.includes(".")
      ? file.originalname.split(".").pop()
      : "webm";
    cb(null, `${Date.now()}-${nanoid(6)}.${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap per voice note
});

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ------------------------------------------------------------------ */
/* Villagers                                                            */
/* ------------------------------------------------------------------ */

// Create or find a villager profile by phone number (simulated login, no password)
app.post("/api/villagers", (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone || String(phone).trim().length < 6) {
    return res.status(400).json({ error: "Name and a valid phone number are required." });
  }
  const villager = { name: String(name).trim(), phone: String(phone).trim() };
  db.upsertVillager(villager);
  res.json(villager);
});

/* ------------------------------------------------------------------ */
/* Complaints                                                           */
/* ------------------------------------------------------------------ */

// Villager: submit a new complaint with a voice note (multipart/form-data)
app.post("/api/complaints", upload.single("audio"), (req, res) => {
  const { phone, villagerName, lat, lng, note } = req.body;
  if (!phone || !villagerName || !lat || !lng) {
    return res.status(400).json({ error: "phone, villagerName, lat and lng are required." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "A voice message recording is required." });
  }
  const complaint = {
    id: "PW-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100),
    phone: String(phone).trim(),
    villagerName: String(villagerName).trim(),
    audioUrl: `/uploads/${req.file.filename}`,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    note: note ? String(note).trim() : "",
    status: "Pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.addComplaint(complaint);
  res.status(201).json(complaint);
});

// Villager: view their own complaints
app.get("/api/complaints/mine", (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "phone query param is required." });
  const mine = db.getComplaints()
    .filter((c) => c.phone === phone)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(mine);
});

// Public: count of currently pending complaints (used for the home-screen badge,
// no admin auth needed since it exposes only a number, not complaint details).
app.get("/api/complaints/pending-count", (req, res) => {
  const count = db.getComplaints().filter((c) => c.status === "Pending").length;
  res.json({ count });
});

// Admin: view all complaints
app.get("/api/complaints", requireAdmin, (req, res) => {
  const all = db.getComplaints().sort((a, b) => b.createdAt - a.createdAt);
  res.json(all);
});

// Admin: count of complaints created after a given timestamp (for the "new since last visit" banner)
app.get("/api/complaints/new-count", requireAdmin, (req, res) => {
  const since = parseInt(req.query.since || "0", 10);
  const count = db.getComplaints().filter((c) => c.createdAt > since).length;
  res.json({ count });
});

// Admin: update a complaint's status
app.patch("/api/complaints/:id", requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowed = ["Pending", "Verified", "Resolved", "Rejected"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${allowed.join(", ")}` });
  }
  const updated = db.updateComplaintStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Complaint not found" });
  res.json(updated);
});

/* ------------------------------------------------------------------ */
/* Admin auth                                                            */
/* ------------------------------------------------------------------ */

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password." });
  }
  res.json({ token: ADMIN_TOKEN });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Pole Watch backend running at http://localhost:${PORT}`);
});
