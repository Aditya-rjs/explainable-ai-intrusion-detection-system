import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Shield,
  Activity,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchStats, fetchAlerts } from "../services/api.js";

// ─── Mock data helpers (used when backend is offline) ───────────────────────
function generateTrafficData() {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, "0")}:00`,
    normal: Math.floor(Math.random() * 800 + 200),
    attack: Math.floor(Math.random() * 150 + 10),
  }));
}

const ATTACK_COLORS = {
  DDoS: "#ff3366",
  PortScan: "#ffcc00",
  BruteForce: "#ff7700",
  SQLInjection: "#cc44ff",
  Botnet: "#00aaff",
  DNS: "#00ff88",
  FTP: "#ff4488",
  SSH: "#44ccff",
};

const PIE_COLORS = ["#ff3366", "#ffcc00", "#ff7700", "#cc44ff", "#00aaff", "#00ff88"];

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="cyber-panel p-4 flex items-start gap-4 hover:border-cyber-accent/30 transition-colors duration-300">
      <div className={`p-2.5 rounded-lg bg-${color}/10 flex-shrink-0`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5 font-mono">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {trend != null && (
        <div className={`ml-auto text-xs font-mono ${trend >= 0 ? "text-red-400" : "text-green-400"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ level }) {
  const cls =
    level === "CRITICAL"
      ? "badge-critical"
      : level === "HIGH"
      ? "badge-high"
      : level === "MEDIUM"
      ? "badge-medium"
      : "badge-low";
  return <span className={cls}>{level}</span>;
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function CyberTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cyber-darker border border-cyber-border rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-1 font-mono">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [trafficData, setTrafficData] = useState(generateTrafficData());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const [statsRes, alertsRes] = await Promise.allSettled([
        fetchStats(),
        fetchAlerts({ limit: 8 }),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (alertsRes.status === "fulfilled") {
        const data = alertsRes.value;
        setRecentAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
      }
    } catch {
      // Backend may be offline — use mock data
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setTrafficData(generateTrafficData());
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── fallback mock stats ──
  const s = stats ?? {
    total_alerts: 1247,
    critical_alerts: 23,
    blocked_attacks: 891,
    model_accuracy: 97.4,
    attack_distribution: [
      { name: "DDoS", value: 34 },
      { name: "PortScan", value: 22 },
      { name: "BruteForce", value: 18 },
      { name: "SQLInjection", value: 12 },
      { name: "Botnet", value: 9 },
      { name: "Others", value: 5 },
    ],
    severity_counts: { CRITICAL: 23, HIGH: 87, MEDIUM: 214, LOW: 923 },
    hourly_attacks: Array.from({ length: 7 }, (_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      attacks: Math.floor(Math.random() * 120 + 20),
    })),
  };

  const mockAlerts =
    recentAlerts.length > 0
      ? recentAlerts
      : [
          { id: 1, attack_type: "DDoS", source_ip: "192.168.1.45", severity: "CRITICAL", confidence: 98.2, timestamp: new Date().toISOString() },
          { id: 2, attack_type: "Port Scan", source_ip: "10.0.0.22", severity: "HIGH", confidence: 91.5, timestamp: new Date().toISOString() },
          { id: 3, attack_type: "SQL Injection", source_ip: "172.16.0.8", severity: "HIGH", confidence: 87.3, timestamp: new Date().toISOString() },
          { id: 4, attack_type: "Brute Force", source_ip: "192.168.2.100", severity: "MEDIUM", confidence: 79.8, timestamp: new Date().toISOString() },
          { id: 5, attack_type: "Botnet", source_ip: "10.10.10.5", severity: "HIGH", confidence: 93.1, timestamp: new Date().toISOString() },
        ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Security Overview</h2>
          <p className="text-xs text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="cyber-btn-outline flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Alerts"
          value={s.total_alerts?.toLocaleString()}
          sub="All time detections"
          icon={ShieldAlert}
          color="cyber-red"
          trend={12}
        />
        <StatCard
          label="Critical Alerts"
          value={s.critical_alerts}
          sub="Immediate action needed"
          icon={AlertTriangle}
          color="yellow-400"
          trend={-3}
        />
        <StatCard
          label="Attacks Blocked"
          value={s.blocked_attacks?.toLocaleString()}
          sub="Successfully mitigated"
          icon={Shield}
          color="cyber-green"
        />
        <StatCard
          label="Model Accuracy"
          value={`${s.model_accuracy ?? 97.4}%`}
          sub="XGBoost + SHAP"
          icon={Cpu}
          color="cyber-accent"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic over time */}
        <div className="lg:col-span-2 cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-accent" />
            Real-Time Traffic Monitor
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip content={<CyberTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="normal" name="Normal" stroke="#00d4ff" fill="url(#normalGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="attack" name="Attack" stroke="#ff3366" fill="url(#attackGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attack distribution */}
        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyber-yellow" />
            Attack Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={Array.isArray(s.attack_distribution) ? s.attack_distribution : []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {(Array.isArray(s.attack_distribution) ? s.attack_distribution : []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly attacks */}
        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyber-purple" />
            Weekly Attack Trend
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={Array.isArray(s.hourly_attacks) ? s.hourly_attacks : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip content={<CyberTooltip />} />
              <Bar dataKey="attacks" name="Attacks" fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity breakdown */}
        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Severity Levels</h3>
          <div className="space-y-3">
            {[
              { label: "CRITICAL", count: s.severity_counts?.CRITICAL ?? 23, color: "bg-red-500", pct: 2 },
              { label: "HIGH", count: s.severity_counts?.HIGH ?? 87, color: "bg-orange-500", pct: 7 },
              { label: "MEDIUM", count: s.severity_counts?.MEDIUM ?? 214, color: "bg-yellow-500", pct: 17 },
              { label: "LOW", count: s.severity_counts?.LOW ?? 923, color: "bg-green-500", pct: 74 },
            ].map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-mono">{label}</span>
                  <span className="text-slate-300 font-semibold">{count}</span>
                </div>
                <div className="h-1.5 bg-cyber-darker rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts table */}
        <div className="cyber-panel p-4 overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Recent Detections
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-48">
            {mockAlerts.slice(0, 5).map((alert, i) => (
              <div key={alert?.id ?? i} className="flex items-center justify-between text-xs p-2 rounded bg-cyber-darker border border-cyber-border/50 gap-2">
                <div className="min-w-0">
                  <p className="text-slate-300 font-semibold truncate">{alert?.attack_type ?? "Unknown"}</p>
                  <p className="text-slate-500 font-mono">{alert?.source_ip ?? "—"}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <SeverityBadge level={alert?.severity ?? "LOW"} />
                  <p className="text-slate-500 mt-0.5">{alert?.confidence?.toFixed(1) ?? "—"}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
