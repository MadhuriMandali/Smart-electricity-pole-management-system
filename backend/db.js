const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const COMPLAINTS_FILE = path.join(DATA_DIR, "complaints.json");
const VILLAGERS_FILE = path.join(DATA_DIR, "villagers.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(COMPLAINTS_FILE)) fs.writeFileSync(COMPLAINTS_FILE, "[]");
if (!fs.existsSync(VILLAGERS_FILE)) fs.writeFileSync(VILLAGERS_FILE, "[]");

// Very small write queue per file so concurrent requests don't clobber each other.
// This is a JSON-file store meant for a prototype / small deployment.
// Swap this module out for a real database (Postgres, MongoDB, etc.) for production use.
const queues = {};

function withQueue(file, fn) {
  const prev = queues[file] || Promise.resolve();
  const next = prev.then(fn, fn);
  queues[file] = next.catch(() => {});
  return next;
}

function readJSON(file) {
  const raw = fs.readFileSync(file, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const db = {
  // Complaints
  getComplaints() {
    return readJSON(COMPLAINTS_FILE);
  },
  addComplaint(complaint) {
    return withQueue(COMPLAINTS_FILE, () => {
      const all = readJSON(COMPLAINTS_FILE);
      all.push(complaint);
      writeJSON(COMPLAINTS_FILE, all);
      return complaint;
    });
  },
  updateComplaintStatus(id, status) {
    return withQueue(COMPLAINTS_FILE, () => {
      const all = readJSON(COMPLAINTS_FILE);
      const idx = all.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      all[idx].status = status;
      all[idx].updatedAt = Date.now();
      writeJSON(COMPLAINTS_FILE, all);
      return all[idx];
    });
  },

  // Villagers
  getVillagers() {
    return readJSON(VILLAGERS_FILE);
  },
  upsertVillager(villager) {
    return withQueue(VILLAGERS_FILE, () => {
      const all = readJSON(VILLAGERS_FILE);
      const idx = all.findIndex((v) => v.phone === villager.phone);
      if (idx === -1) all.push(villager);
      else all[idx] = { ...all[idx], ...villager };
      writeJSON(VILLAGERS_FILE, all);
      return villager;
    });
  },
};

module.exports = db;
