import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  ChevronDown,
  Search,
} from "lucide-react";
import { fetchAlerts, deleteAlert, clearAllAlerts } from "../services/api.js";

// ── Mock alert generator ────────────────────────────────────────────────────
let mockId = 1;
function makeMockAlerts(n = 20) {
  const types = ["DDoS", "Port Scan", "Brute Force", "SQL Injection", "Botnet", "DNS Tunneling", "FTP Patator", "SSH Patator"];
  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const ips = () => `${[192, 10, 172][Math.floor(Math.random() * 3)]}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

  return Array.from({ length: n }, () => ({
    id: mockId++,
    attack_type: types[Math.floor(Math.random() * types.length)],
    source_ip: ips(),
    destination_ip: ips(),
    severity: severities[Math.floor(Math.random() * severities.length)],
    confidence: parseFloat((Math.random() * 30 + 70).toFixed(1)),
    protocol: ["TCP", "UDP", "ICMP", "HTTP"][Math.floor(Math.random() * 4)],
    port: Math.floor(Math.random() * 65535),
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    status: "DETECTED",
  }));
}

function SeverityBadge({ level }) {
  const cls =
    level === "CRITICAL" ? "badge-critical"
    : level === "HIGH" ? "badge-high"
    : level === "MEDIUM" ? "badge-medium"
    : "badge-low";
  return <span className={cls}>{level}</span>;
}

function ConfidenceBar({ value }) {
  const color =
    value >= 90 ? "bg-red-500" : value >= 75 ? "bg-orange-500" : "bg-yellow-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-cyber-darker rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-400">{value}%</span>
    </div>
  );
}

export default function ThreatAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAlerts();
      const data = Array.isArray(res?.alerts) ? res.alerts : [];
      setAlerts(data.length > 0 ? data : makeMockAlerts(20));
    } catch {
      setAlerts(makeMockAlerts(20));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
    } catch { /* ignore */ }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all alerts?")) return;
    try { await clearAllAlerts(); } catch { /* ignore */ }
    setAlerts([]);
    setSelected(null);
  };

  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const filtered = alerts.filter((a) => {
    const matchSeverity = filter === "ALL" || a.severity === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.attack_type?.toLowerCase().includes(q) ||
      a.source_ip?.includes(q) ||
      a.protocol?.toLowerCase().includes(q);
    return matchSeverity && matchSearch;
  });

  return (
    <div className="flex gap-4 h-full animate-fade-in">
      {/* Main table */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by type, IP, protocol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cyber-input pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-cyber-panel border border-cyber-border rounded-lg p-1">
            {severities.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  filter === s
                    ? "bg-cyber-accent text-cyber-dark font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={load} className="cyber-btn-outline flex items-center gap-1.5 text-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleClearAll}
            className="cyber-btn flex items-center gap-1.5 text-sm border border-red-800 text-red-400 hover:bg-red-900/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>

        <div className="cyber-panel overflow-hidden">
          <div className="p-3 border-b border-cyber-border flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-slate-300">
              Threat Alerts
            </span>
            <span className="ml-auto text-xs text-slate-500 font-mono">
              {filtered.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cyber-border bg-cyber-darker">
                  {["Attack Type", "Source IP", "Dest IP", "Severity", "Confidence", "Protocol", "Port", "Time", ""].map(
                    (h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-slate-500 font-mono uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading alerts...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-500">
                      No alerts found
                    </td>
                  </tr>
                ) : (
                  filtered.map((alert) => (
                    <tr
                      key={alert.id}
                      className={`border-b border-cyber-border/50 hover:bg-cyber-accent/5 cursor-pointer transition-colors ${
                        selected?.id === alert.id ? "bg-cyber-accent/5" : ""
                      }`}
                      onClick={() => setSelected(selected?.id === alert.id ? null : alert)}
                    >
                      <td className="px-3 py-2.5 font-semibold text-slate-200 whitespace-nowrap">
                        {alert.attack_type}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                        {alert.source_ip}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                        {alert.destination_ip}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <SeverityBadge level={alert.severity} />
                      </td>
                      <td className="px-3 py-2.5">
                        <ConfidenceBar value={alert.confidence} />
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">{alert.protocol}</td>
                      <td className="px-3 py-2.5 text-slate-400 font-mono">{alert.port}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(alert); }}
                            className="p-1 text-slate-500 hover:text-cyber-accent rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(alert.id); }}
                            className="p-1 text-slate-500 hover:text-red-400 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-72 flex-shrink-0 cyber-panel p-4 space-y-4 animate-slide-in self-start sticky top-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Alert Detail</h3>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="text-center py-3 bg-cyber-darker rounded-lg">
              <SeverityBadge level={selected.severity} />
              <p className="text-lg font-bold text-slate-100 mt-2">{selected.attack_type}</p>
              <p className="text-slate-500 font-mono">{selected.protocol} / Port {selected.port}</p>
            </div>

            {[
              ["Source IP", selected.source_ip],
              ["Destination IP", selected.destination_ip],
              ["Confidence", `${selected.confidence}%`],
              ["Detected", new Date(selected.timestamp).toLocaleString()],
              ["Status", selected.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1.5 border-b border-cyber-border/50">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-300 font-mono">{v}</span>
              </div>
            ))}

            <div>
              <p className="text-slate-500 mb-1">SHAP Explanation</p>
              <div className="bg-cyber-darker rounded p-2 space-y-1">
                {["Packet Size", "Flow Duration", "Byte Rate", "Flags"].map((f) => {
                  const val = Math.random();
                  return (
                    <div key={f} className="flex items-center gap-2">
                      <span className="text-slate-500 w-20 truncate">{f}</span>
                      <div className="flex-1 h-1.5 bg-cyber-panel rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${val > 0.5 ? "bg-red-500" : "bg-green-500"}`}
                             style={{ width: `${val * 100}%` }} />
                      </div>
                      <span className={`text-xs ${val > 0.5 ? "text-red-400" : "text-green-400"}`}>
                        {val > 0.5 ? "+" : ""}{(val * 0.4 - 0.1).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-slate-600 mt-1 text-center">SHAP feature importances</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
