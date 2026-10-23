// api.js

// ============================================================
// API BASE URL
// ============================================================
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

// ============================================================
// REQUEST HELPERS
// ============================================================
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`
    );
  }
  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================================
// VILLAGER
// ============================================================
export async function upsertVillager(name, phone) {
  return await apiRequest("/api/villagers", {
    method: "POST",
    body: JSON.stringify({ name, phone }),
  });
}

export async function myComplaints(phone) {
  const result = await apiRequest(
    `/api/complaints/mine?phone=${encodeURIComponent(phone)}`
  );
  return Array.isArray(result) ? result : result?.complaints || [];
}

export async function pendingCount() {
  try {
    const result = await apiRequest("/api/complaints/pending-count");
    if (typeof result === "number") return { count: result };
    return { count: Number(result?.count ?? result?.pendingCount ?? 0) };
  } catch {
    return { count: 0 };
  }
}

// Sends the voice recording as a file, so it must use FormData (not JSON)
export async function submitComplaint({ phone, villagerName, lat, lng, note, audioBlob }) {
  const form = new FormData();
  form.append("phone", phone);
  form.append("villagerName", villagerName);
  form.append("lat", lat);
  form.append("lng", lng);
  form.append("note", note || "");
  form.append("audio", audioBlob, "voice.webm");

  const response = await fetch(`${API_BASE}/api/complaints`, {
    method: "POST",
    body: form, // do NOT set Content-Type; the browser adds it
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`
    );
  }
  return data;
}

// ============================================================
// ADMIN
// ============================================================
export async function adminLogin(password) {
  return await apiRequest("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function allComplaints(token) {
  const result = await apiRequest("/api/complaints", {
    headers: authHeaders(token),
  });
  return Array.isArray(result) ? result : result?.complaints || [];
}

export async function updateStatus(token, id, status) {
  return await apiRequest(`/api/complaints/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
}

// ============================================================
// AUDIO URL
// ============================================================
export function audioUrl(path) {
  if (!path) return "";
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ============================================================
// EXPORTS
// ============================================================
export { API_BASE };

export const api = {
  upsertVillager,
  myComplaints,
  pendingCount,
  submitComplaint,
  adminLogin,
  allComplaints,
  updateStatus,
  audioUrl,
  base: API_BASE,
};