```js
// api.js

// ============================================================
// API BASE URL
// ============================================================
// Local development:
// VITE_API_URL=http://localhost:4000
//
// Production:
// VITE_API_URL=https://your-backend-domain.com
//
// Create a .env file in your frontend project:
// VITE_API_URL=http://localhost:4000
// ============================================================

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

// ============================================================
// SAMPLE AUDIO
// ============================================================

const SAMPLE_AUDIO_BEEP =
  "data:audio/wav;base64,UklGRmACAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoCAACBhYqFbF1fdJivrJBhNjVgodDbq2EcHCek2/LDn184M3m41OG9jWcxH2O0zN/DpmM6H2Csx9vCqG9DHHmxwtnCtHhPG3mrwNfGtn9VHHGkvNXFt4FfIWmct8/CvohkKGmTuMzBw4tpLTNjj7fBw4xrLzRfhbO/xYptMC5ZgLDCw41tLy5VfbC+xIxrMDFFb665v4hrLy9EbKu2u4hrLS5BbKe0uYdqLy4+a6WytoaIKy05aKGttYeILCo0Z5+ssYOGKywrZZyqq4SDLScoY5elqIOELSAmYJGdn39/Kx8hXo2YlXt8JyEcW4ePj3V2IBsaV36GiXBpFRAPTXF9e2peDAg=";

// ============================================================
// DEFAULT VILLAGERS
// ============================================================

const DEFAULT_VILLAGERS = [
  { name: "Ramesh Kumar", phone: "9848012345" },
  { name: "Radha Devi", phone: "9440156789" },
  { name: "Srinivasa Rao", phone: "9866234567" },
  { name: "Lakshmi Narayana", phone: "9988776655" },
  { name: "Venkatesh Prasad", phone: "9123456780" },
  { name: "Anitha Kumari", phone: "9701234987" },
];

// ============================================================
// DEFAULT COMPLAINTS
// ============================================================

const DEFAULT_COMPLAINTS = [
  {
    id: "PW-2026-KANK-01",
    phone: "9848012345",
    villagerName: "Ramesh Kumar",
    audioUrl: "/uploads/sample-audio-kankipadu.wav",
    lat: 16.5186,
    lng: 80.6199,
    note:
      "Pole #18 tilted precariously at 45 degrees after heavy rains near ZP High School. Exposed wires touching tree branches posing risk to school children.",
    status: "Pending",
    createdAt: Date.now() - 2 * 3600 * 1000,
    updatedAt: Date.now() - 2 * 3600 * 1000,
  },

  {
    id: "PW-2026-GOSA-02",
    phone: "9440156789",
    villagerName: "Radha Devi",
    audioUrl: "/uploads/sample-audio-gosala.wav",
    lat: 16.5242,
    lng: 80.6315,
    note:
      "Electric pole collapsed across lane near Primary Health Centre (PHC). Entire street pitch dark at night, elderly patients unable to reach clinic safely.",
    status: "Verified",
    createdAt: Date.now() - 26 * 3600 * 1000,
    updatedAt: Date.now() - 24 * 3600 * 1000,
  },

  {
    id: "PW-2026-PUNA-03",
    phone: "9866234567",
    villagerName: "Srinivasa Rao",
    audioUrl: "/uploads/sample-audio-punadipadu.wav",
    lat: 16.5091,
    lng: 80.6421,
    note:
      "Missing pole gap on agricultural feeder route between Well #4 and distribution transformer. Sagging conductors hanging only 5 feet above field path.",
    status: "Pending",
    createdAt: Date.now() - 4 * 3600 * 1000,
    updatedAt: Date.now() - 4 * 3600 * 1000,
  },

  {
    id: "PW-2026-PROD-04",
    phone: "9988776655",
    villagerName: "Lakshmi Narayana",
    audioUrl: "/uploads/sample-audio-proddutur.wav",
    lat: 16.531,
    lng: 80.6552,
    note:
      "Department deployed linemen team: New 9-meter pre-stressed concrete (PSC) pole successfully erected and LT distribution line re-tensioned.",
    status: "Resolved",
    createdAt: Date.now() - 72 * 3600 * 1000,
    updatedAt: Date.now() - 70 * 3600 * 1000,
  },

  {
    id: "PW-2026-GANG-05",
    phone: "9123456780",
    villagerName: "Venkatesh Prasad",
    audioUrl: "/uploads/sample-audio-ganguru.wav",
    lat: 16.5402,
    lng: 80.621,
    note:
      "Temporary bamboo support used for power line across Panchayat main road. High risk of wire snap during tractor and harvester movement.",
    status: "Verified",
    createdAt: Date.now() - 16 * 3600 * 1000,
    updatedAt: Date.now() - 14 * 3600 * 1000,
  },

  {
    id: "PW-2026-EDUP-06",
    phone: "9701234987",
    villagerName: "Anitha Kumari",
    audioUrl: "/uploads/sample-audio-edupugallu.wav",
    lat: 16.495,
    lng: 80.608,
    note:
      "Request for dedicated pole inside private farmland compound. Junior engineer site inspection confirmed existing distribution pole is within 14 meters.",
    status: "Rejected",
    createdAt: Date.now() - 96 * 3600 * 1000,
    updatedAt: Date.now() - 94 * 3600 * 1000,
  },
];

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

function getLocalComplaints() {
  try {
    const raw = localStorage.getItem("pw-complaints-db");

    if (!raw) {
      localStorage.setItem(
        "pw-complaints-db",
        JSON.stringify(DEFAULT_COMPLAINTS)
      );

      return DEFAULT_COMPLAINTS;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("Unable to read local complaints:", error);
    return DEFAULT_COMPLAINTS;
  }
}

function saveLocalComplaints(list) {
  try {
    localStorage.setItem(
      "pw-complaints-db",
      JSON.stringify(list)
    );
  } catch (error) {
    console.error("Unable to save local complaints:", error);
  }
}

function getLocalVillagers() {
  try {
    const raw = localStorage.getItem("pw-villagers-db");

    if (!raw) {
      localStorage.setItem(
        "pw-villagers-db",
        JSON.stringify(DEFAULT_VILLAGERS)
      );

      return DEFAULT_VILLAGERS;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("Unable to read local villagers:", error);
    return DEFAULT_VILLAGERS;
  }
}

function saveLocalVillagers(list) {
  try {
    localStorage.setItem(
      "pw-villagers-db",
      JSON.stringify(list)
    );
  } catch (error) {
    console.error("Unable to save local villagers:", error);
  }
}

// ============================================================
// API RESPONSE HANDLER
// ============================================================

async function handleResponse(response) {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();

      if (body?.error) {
        message = body.error;
      }
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

// ============================================================
// AUDIO
// ============================================================

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    if (!blob) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

// ============================================================
// API
// ============================================================

export const api = {
  base: API_BASE,

  // ----------------------------------------------------------
  // ADD / UPDATE VILLAGER
  // ----------------------------------------------------------

  async upsertVillager(name, phone) {
    const cleanName = String(name || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanName || !cleanPhone) {
      throw new Error("Name and phone number are required.");
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/villagers`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
          }),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Using localStorage.",
        error
      );

      const list = getLocalVillagers();

      const existing = list.find(
        (villager) => villager.phone === cleanPhone
      );

      if (existing) {
        existing.name = cleanName;
      } else {
        list.push({
          name: cleanName,
          phone: cleanPhone,
        });
      }

      saveLocalVillagers(list);

      return {
        name: cleanName,
        phone: cleanPhone,
      };
    }
  },

  // ----------------------------------------------------------
  // GET MY COMPLAINTS
  // ----------------------------------------------------------

  async myComplaints(phone) {
    const cleanPhone = String(phone || "").trim();

    if (!cleanPhone) {
      return [];
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/complaints/mine?phone=${encodeURIComponent(
          cleanPhone
        )}`
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Reading complaints locally.",
        error
      );

      const list = getLocalComplaints();

      return list
        .filter((complaint) => complaint.phone === cleanPhone)
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  // ----------------------------------------------------------
  // PENDING COUNT
  // ----------------------------------------------------------

  async pendingCount() {
    try {
      const response = await fetch(
        `${API_BASE}/api/complaints/pending-count`
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Calculating pending count locally.",
        error
      );

      const list = getLocalComplaints();

      return {
        count: list.filter(
          (complaint) => complaint.status === "Pending"
        ).length,
      };
    }
  },

  // ----------------------------------------------------------
  // SUBMIT COMPLAINT
  // ----------------------------------------------------------

  async submitComplaint({
    phone,
    villagerName,
    lat,
    lng,
    note,
    audioBlob,
  }) {
    const cleanPhone = String(phone || "").trim();
    const cleanName = String(villagerName || "").trim();

    if (!cleanPhone) {
      throw new Error("Phone number is required.");
    }

    if (!cleanName) {
      throw new Error("Villager name is required.");
    }

    if (
      lat === undefined ||
      lat === null ||
      lng === undefined ||
      lng === null
    ) {
      throw new Error("Location is required.");
    }

    try {
      const form = new FormData();

      form.append("phone", cleanPhone);
      form.append("villagerName", cleanName);
      form.append("lat", String(lat));
      form.append("lng", String(lng));
      form.append("note", note ? String(note).trim() : "");

      if (audioBlob) {
        form.append(
          "audio",
          audioBlob,
          "recording.webm"
        );
      }

      const response = await fetch(
        `${API_BASE}/api/complaints`,
        {
          method: "POST",
          body: form,
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Saving complaint locally.",
        error
      );

      const audioUrl = audioBlob
        ? await blobToDataUrl(audioBlob)
        : SAMPLE_AUDIO_BEEP;

      const complaint = {
        id:
          "PW-" +
          Date.now().toString(36).toUpperCase() +
          Math.floor(Math.random() * 900 + 100),

        phone: cleanPhone,

        villagerName: cleanName,

        audioUrl: audioUrl || SAMPLE_AUDIO_BEEP,

        lat: Number.parseFloat(lat),

        lng: Number.parseFloat(lng),

        note: note ? String(note).trim() : "",

        status: "Pending",

        createdAt: Date.now(),

        updatedAt: Date.now(),
      };

      const list = getLocalComplaints();

      list.push(complaint);

      saveLocalComplaints(list);

      return complaint;
    }
  },

  // ----------------------------------------------------------
  // ADMIN LOGIN
  // ----------------------------------------------------------
  //
  // IMPORTANT:
  // Do NOT put the real admin password in frontend code.
  // Authentication should happen on the backend.
  // ----------------------------------------------------------

  async adminLogin(password) {
    if (!password) {
      throw new Error("Password is required.");
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Admin login failed:", error);

      throw new Error(
        "Unable to connect to the server. Please try again."
      );
    }
  },

  // ----------------------------------------------------------
  // GET ALL COMPLAINTS
  // ----------------------------------------------------------

  async allComplaints(token) {
    if (!token) {
      throw new Error("Admin authentication token is required.");
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Reading complaints locally.",
        error
      );

      const list = getLocalComplaints();

      return [...list].sort(
        (a, b) => b.createdAt - a.createdAt
      );
    }
  },

  // ----------------------------------------------------------
  // NEW COMPLAINT COUNT
  // ----------------------------------------------------------

  async newCount(token, since) {
    if (!token) {
      throw new Error("Admin authentication token is required.");
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/complaints/new-count?since=${encodeURIComponent(
          since
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Calculating count locally.",
        error
      );

      const list = getLocalComplaints();

      return {
        count: list.filter(
          (complaint) => complaint.createdAt > since
        ).length,
      };
    }
  },

  // ----------------------------------------------------------
  // UPDATE COMPLAINT STATUS
  // ----------------------------------------------------------

  async updateStatus(token, id, status) {
    if (!token) {
      throw new Error("Admin authentication token is required.");
    }

    if (!id) {
      throw new Error("Complaint ID is required.");
    }

    if (!status) {
      throw new Error("Complaint status is required.");
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/complaints/${encodeURIComponent(id)}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        "Backend unavailable. Updating complaint locally.",
        error
      );

      const list = getLocalComplaints();

      const index = list.findIndex(
        (complaint) => complaint.id === id
      );

      if (index === -1) {
        throw new Error("Complaint not found.");
      }

      list[index].status = status;
      list[index].updatedAt = Date.now();

      saveLocalComplaints(list);

      return list[index];
    }
  },

  // ----------------------------------------------------------
  // AUDIO URL
  // ----------------------------------------------------------

  audioUrl(path) {
    if (!path) {
      return SAMPLE_AUDIO_BEEP;
    }

    if (
      path.startsWith("data:") ||
      path.startsWith("blob:") ||
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  },
};
```
