// api.js
// ============================================================
// API BASE URL
// ============================================================

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================

const VILLAGERS_KEY = "power_pole_villagers";
const COMPLAINTS_KEY = "power_pole_complaints";

// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_VILLAGERS = [
  {
    id: "V001",
    name: "Ravi Kumar",
    phone: "9876543210",
    village: "Rasapudipalem",
  },
  {
    id: "V002",
    name: "Suresh",
    phone: "9876543211",
    village: "Rasapudipalem",
  },
];

const DEFAULT_COMPLAINTS = [];

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

function getVillagers() {
  try {
    const data = localStorage.getItem(VILLAGERS_KEY);

    if (!data) {
      localStorage.setItem(
        VILLAGERS_KEY,
        JSON.stringify(DEFAULT_VILLAGERS)
      );

      return DEFAULT_VILLAGERS;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading villagers:", error);
    return DEFAULT_VILLAGERS;
  }
}

function saveVillagers(villagers) {
  try {
    localStorage.setItem(
      VILLAGERS_KEY,
      JSON.stringify(villagers)
    );
  } catch (error) {
    console.error("Error saving villagers:", error);
  }
}

function getComplaints() {
  try {
    const data = localStorage.getItem(COMPLAINTS_KEY);

    if (!data) {
      localStorage.setItem(
        COMPLAINTS_KEY,
        JSON.stringify(DEFAULT_COMPLAINTS)
      );

      return DEFAULT_COMPLAINTS;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading complaints:", error);
    return DEFAULT_COMPLAINTS;
  }
}

function saveComplaints(complaints) {
  try {
    localStorage.setItem(
      COMPLAINTS_KEY,
      JSON.stringify(complaints)
    );
  } catch (error) {
    console.error("Error saving complaints:", error);
  }
}

// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
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
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

// ============================================================
// VILLAGER API
// ============================================================

export async function upsertVillager(villager) {
  try {
    return await apiRequest("/api/villagers", {
      method: "POST",
      body: JSON.stringify(villager),
    });
  } catch (error) {
    console.warn(
      "API unavailable. Saving villager locally.",
      error
    );

    const villagers = getVillagers();

    const existingIndex = villagers.findIndex(
      (item) =>
        item.phone === villager.phone ||
        item.id === villager.id
    );

    if (existingIndex >= 0) {
      villagers[existingIndex] = {
        ...villagers[existingIndex],
        ...villager,
      };
    } else {
      villagers.push({
        ...villager,
        id:
          villager.id ||
          `V${Date.now()}`,
      });
    }

    saveVillagers(villagers);

    return villager;
  }
}

// ============================================================
// MY COMPLAINTS
// ============================================================

export async function myComplaints(phone) {
  try {
    const result = await apiRequest(
      `/api/complaints/mine?phone=${encodeURIComponent(phone)}`
    );

    return Array.isArray(result)
      ? result
      : result?.complaints || [];
  } catch (error) {
    console.warn(
      "API unavailable. Reading complaints locally.",
      error
    );

    return getComplaints().filter(
      (complaint) =>
        complaint.phone === phone
    );
  }
}

// ============================================================
// PENDING COUNT
// ============================================================

export async function pendingCount() {
  try {
    const result = await apiRequest(
      "/api/complaints/pending-count"
    );

    if (typeof result === "number") {
      return result;
    }

    return Number(
      result?.count ||
      result?.pendingCount ||
      0
    );
  } catch (error) {
    console.warn(
      "API unavailable. Calculating pending count locally.",
      error
    );

    return getComplaints().filter(
      (complaint) =>
        complaint.status === "Pending"
    ).length;
  }
}

// ============================================================
// SUBMIT COMPLAINT
// ============================================================

export async function submitComplaint(complaint) {
  try {
    return await apiRequest("/api/complaints", {
      method: "POST",
      body: JSON.stringify(complaint),
    });
  } catch (error) {
    console.warn(
      "API unavailable. Saving complaint locally.",
      error
    );

    const complaints = getComplaints();

    const newComplaint = {
      ...complaint,
      id:
        complaint.id ||
        `C${Date.now()}`,
      status:
        complaint.status ||
        "Pending",
      createdAt:
        complaint.createdAt ||
        new Date().toISOString(),
    };

    complaints.push(newComplaint);

    saveComplaints(complaints);

    return newComplaint;
  }
}

// ============================================================
// ADMIN LOGIN
// ============================================================

export async function adminLogin(credentials) {
  try {
    return await apiRequest(
      "/api/admin/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
  } catch (error) {
    console.error(
      "Admin login failed:",
      error
    );

    throw error;
  }
}

// ============================================================
// GET ALL COMPLAINTS
// ============================================================

export async function allComplaints() {
  try {
    const result = await apiRequest(
      "/api/complaints"
    );

    return Array.isArray(result)
      ? result
      : result?.complaints || [];
  } catch (error) {
    console.warn(
      "API unavailable. Reading complaints locally.",
      error
    );

    return getComplaints();
  }
}

// ============================================================
// NEW COMPLAINT COUNT
// ============================================================

export async function newCount(since) {
  try {
    const query = since
      ? `?since=${encodeURIComponent(since)}`
      : "";

    const result = await apiRequest(
      `/api/complaints/new-count${query}`
    );

    if (typeof result === "number") {
      return result;
    }

    return Number(
      result?.count ||
      result?.newCount ||
      0
    );
  } catch (error) {
    console.warn(
      "API unavailable. Calculating new complaint count locally.",
      error
    );

    const complaints = getComplaints();

    if (!since) {
      return complaints.length;
    }

    const sinceDate = new Date(since);

    return complaints.filter(
      (complaint) =>
        new Date(
          complaint.createdAt
        ) > sinceDate
    ).length;
  }
}

// ============================================================
// UPDATE COMPLAINT STATUS
// ============================================================

export async function updateStatus(
  complaintId,
  status
) {
  try {
    return await apiRequest(
      `/api/complaints/${encodeURIComponent(
        complaintId
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    );
  } catch (error) {
    console.warn(
      "API unavailable. Updating complaint locally.",
      error
    );

    const complaints = getComplaints();

    const index = complaints.findIndex(
      (complaint) =>
        complaint.id === complaintId
    );

    if (index === -1) {
      throw new Error(
        "Complaint not found"
      );
    }

    complaints[index] = {
      ...complaints[index],
      status,
      updatedAt:
        new Date().toISOString(),
    };

    saveComplaints(complaints);

    return complaints[index];
  }
}

// ============================================================
// AUDIO URL
// ============================================================

export function audioUrl(path) {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ============================================================
// EXPORT API BASE
// ============================================================

export { API_BASE };