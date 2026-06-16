import axios from "axios";

// Base URL for the Flask backend
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://explainable-ai-intrusion-detection-system.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Stats ───────────────────────────────────────────────────────────────────
export async function fetchStats() {
  const res = await api.get("/stats");
  return res.data;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export async function fetchAlerts(params = {}) {
  const res = await api.get("/alerts", { params });
  return res.data;
}

export async function deleteAlert(alertId) {
  const res = await api.delete(`/alerts/${alertId}`);
  return res.data;
}

export async function clearAllAlerts() {
  const res = await api.delete("/alerts");
  return res.data;
}

// ─── Scan ─────────────────────────────────────────────────────────────────────
export async function runScan(payload) {
  const res = await api.post("/scan", payload);
  return res.data;
}

// ─── Train ───────────────────────────────────────────────────────────────────
export async function trainModel(params = {}) {
  const res = await api.post("/train", params);
  return res.data;
}

export async function fetchModelStatus() {
  const res = await api.get("/train/status");
  return res.data;
}

// ─── Traffic ─────────────────────────────────────────────────────────────────
export async function fetchTraffic(params = {}) {
  const res = await api.get("/traffic", { params });
  return res.data;
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export async function fetchReports() {
  const res = await api.get("/report");
  return res.data;
}

export async function generateReport(params = {}) {
  const res = await api.post("/report/generate", params);
  return res.data;
}

export default api;
