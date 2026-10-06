const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const body = await res.json();
      msg = body.error || msg;
    } catch (e) {
      /* ignore parse errors */
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  base: API_BASE,

  upsertVillager(name, phone) {
    return fetch(`${API_BASE}/api/villagers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    }).then(handle);
  },

  myComplaints(phone) {
    return fetch(`${API_BASE}/api/complaints/mine?phone=${encodeURIComponent(phone)}`).then(handle);
  },

  pendingCount() {
    return fetch(`${API_BASE}/api/complaints/pending-count`).then(handle);
  },

  submitComplaint({ phone, villagerName, lat, lng, note, audioBlob }) {
    const form = new FormData();
    form.append("phone", phone);
    form.append("villagerName", villagerName);
    form.append("lat", lat);
    form.append("lng", lng);
    form.append("note", note || "");
    form.append("audio", audioBlob, "recording.webm");
    return fetch(`${API_BASE}/api/complaints`, { method: "POST", body: form }).then(handle);
  },

  adminLogin(password) {
    return fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then(handle);
  },

  allComplaints(token) {
    return fetch(`${API_BASE}/api/complaints`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handle);
  },

  newCount(token, since) {
    return fetch(`${API_BASE}/api/complaints/new-count?since=${since}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handle);
  },

  updateStatus(token, id, status) {
    return fetch(`${API_BASE}/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }).then(handle);
  },

  audioUrl(path) {
    return `${API_BASE}${path}`;
  },
};
