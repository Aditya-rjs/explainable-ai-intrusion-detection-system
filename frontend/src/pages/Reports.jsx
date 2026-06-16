import React, { useState, useEffect, useCallback } from "react";
import {
  FileBarChart,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchReports, generateReport } from "../services/api.js";

// ── Mock report generator ────────────────────────────────────────────────────
let repId = 1;
function mockReport() {
  const types = ["Weekly Summary", "Incident Report", "Traffic Analysis", "Model Performance"];
  const d = new Date(Date.now() - Math.random() * 7 * 86400000);
  return {
    id: repId++,
    title: types[Math.floor(Math.random() * types.length)],
    generated_at: d.toISOString(),
    total_alerts: Math.floor(Math.random() * 500 + 50),
    critical_count: Math.floor(Math.random() * 20 + 1),
    blocked_count: Math.floor(Math.random() * 400 + 40),
    model_accuracy: parseFloat((Math.random() * 3 + 95).toFixed(2)),
    top_attack: ["DDoS", "Port Scan", "Brute Force", "SQL Injection"][Math.floor(Math.random() * 4)],
    size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
  };
}

const weeklyTrend = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  alerts: Math.floor(Math.random() * 200 + 30),
  blocked: Math.floor(Math.random() * 150 + 20),
}));

const modelMetrics = [
  { metric: "Accuracy", value: 97.4 },
  { metric: "Precision", value: 96.8 },
  { metric: "Recall", value: 95.2 },
  { metric: "F1 Score", value: 96.0 },
  { metric: "AUC-ROC", value: 98.1 },
];

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

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReports();
      const data = Array.isArray(res?.reports) ? res.reports : [];
      setReports(data.length > 0 ? data : [mockReport(), mockReport(), mockReport()]);
    } catch {
      setReports([mockReport(), mockReport(), mockReport()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateReport({ type: "summary" });
      if (res) setReports((prev) => [res, ...prev]);
      else setReports((prev) => [mockReport(), ...prev]);
    } catch {
      setReports((prev) => [mockReport(), ...prev]);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    // In production, this would hit GET /api/report/:id/download
    const blob = new Blob(
      [
        `XAI-IDS Report\n${"=".repeat(40)}\nGenerated: ${report.generated_at}\nTotal Alerts: ${report.total_alerts}\nCritical: ${report.critical_count}\nBlocked: ${report.blocked_count}\nModel Accuracy: ${report.model_accuracy}%\nTop Attack: ${report.top_attack}\n`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xai-ids-report-${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Security Reports</h2>
          <p className="text-xs text-slate-500">
            Generated analysis and incident summaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="cyber-btn-outline flex items-center gap-1.5 text-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="cyber-btn-primary flex items-center gap-1.5 text-sm"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Generate Report
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyber-accent" />
            Weekly Alert Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip content={<CyberTooltip />} />
              <Legend />
              <Bar dataKey="alerts" name="Total Alerts" fill="#ff3366" radius={[3, 3, 0, 0]} />
              <Bar dataKey="blocked" name="Blocked" fill="#00ff88" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-green" />
            Model Performance Metrics
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modelMetrics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" horizontal={false} />
              <XAxis type="number" domain={[90, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis dataKey="metric" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={55} />
              <Tooltip content={<CyberTooltip />} />
              <Bar dataKey="value" name="Score (%)" fill="#00d4ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report list */}
      <div className="cyber-panel overflow-hidden">
        <div className="p-3 border-b border-cyber-border flex items-center gap-2">
          <FileBarChart className="w-4 h-4 text-cyber-accent" />
          <span className="text-sm font-semibold text-slate-300">Generated Reports</span>
          <span className="ml-auto text-xs text-slate-500 font-mono">
            {reports.length} reports
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <FileBarChart className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            No reports yet. Generate one above.
          </div>
        ) : (
          <div className="divide-y divide-cyber-border">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-cyber-accent/5 transition-colors flex items-center gap-4"
              >
                <div className="p-2.5 rounded-lg bg-cyber-accent/10 flex-shrink-0">
                  <FileBarChart className="w-5 h-5 text-cyber-accent" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">
                    {report.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.generated_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.generated_at).toLocaleTimeString()}
                    </span>
                    {report.size && <span>{report.size}</span>}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-6 text-xs flex-shrink-0">
                  <div className="text-center">
                    <p className="text-slate-500">Alerts</p>
                    <p className="text-slate-200 font-bold font-mono">{report.total_alerts}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Critical</p>
                    <p className="text-red-400 font-bold font-mono">{report.critical_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Accuracy</p>
                    <p className="text-cyber-green font-bold font-mono">{report.model_accuracy}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">Top Attack</p>
                    <p className="text-yellow-400 font-mono text-xs">{report.top_attack}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(report)}
                  className="cyber-btn-outline flex items-center gap-1.5 text-xs flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
