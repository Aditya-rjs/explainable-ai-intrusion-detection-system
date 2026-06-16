import React, { useState, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  TrendingUp,
  Network,
  Globe,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Data generators ─────────────────────────────────────────────────────────
function genTimeSeriesData(points = 20) {
  return Array.from({ length: points }, (_, i) => ({
    t: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
    inbound: Math.floor(Math.random() * 600 + 100),
    outbound: Math.floor(Math.random() * 400 + 80),
    malicious: Math.floor(Math.random() * 60 + 5),
  }));
}

function genProtocolData() {
  return [
    { name: "TCP", packets: Math.floor(Math.random() * 5000 + 3000) },
    { name: "UDP", packets: Math.floor(Math.random() * 2000 + 500) },
    { name: "ICMP", packets: Math.floor(Math.random() * 500 + 100) },
    { name: "HTTP", packets: Math.floor(Math.random() * 3000 + 1000) },
    { name: "HTTPS", packets: Math.floor(Math.random() * 4000 + 2000) },
    { name: "DNS", packets: Math.floor(Math.random() * 1000 + 300) },
  ];
}

function genScatterData(n = 50) {
  return Array.from({ length: n }, () => ({
    x: Math.floor(Math.random() * 10000),
    y: Math.floor(Math.random() * 1000),
    attack: Math.random() > 0.8,
  }));
}

function CyberTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cyber-darker border border-cyber-border rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-1 font-mono">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div className="cyber-panel p-3 text-center">
      <p className="text-xs text-slate-500 font-mono uppercase">{label}</p>
      <p className={`text-xl font-bold font-mono mt-1 text-${color}`}>
        {value}
      </p>
    </div>
  );
}

export default function TrafficAnalysis() {
  const [timeData, setTimeData] = useState(genTimeSeriesData());
  const [protoData, setProtoData] = useState(genProtocolData());
  const [scatter, setScatter] = useState(genScatterData());
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const iv = setInterval(() => {
      setTimeData(genTimeSeriesData());
    }, 3000);
    return () => clearInterval(iv);
  }, [auto]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setTimeData(genTimeSeriesData());
      setProtoData(genProtocolData());
      setScatter(genScatterData());
      setLoading(false);
    }, 400);
  };

  const totalPackets = protoData.reduce((s, d) => s + d.packets, 0);
  const attackPoints = scatter.filter((d) => d.attack).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Traffic Analysis</h2>
          <p className="text-xs text-slate-500">
            Live network packet inspection and anomaly detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAuto(!auto)}
            className={`cyber-btn text-sm border ${
              auto
                ? "border-cyber-green text-cyber-green bg-cyber-green/10"
                : "border-cyber-border text-slate-400"
            }`}
          >
            {auto ? "● LIVE" : "○ PAUSED"}
          </button>
          <button
            onClick={refresh}
            className="cyber-btn-outline flex items-center gap-1.5 text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Total Packets" value={totalPackets.toLocaleString()} color="cyber-accent" />
        <StatChip label="Malicious" value={attackPoints} color="cyber-red" />
        <StatChip label="Throughput" value="2.4 Gbps" color="cyber-green" />
        <StatChip label="Active Flows" value="1,842" color="yellow-400" />
      </div>

      {/* Traffic over time */}
      <div className="cyber-panel p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-accent" />
          Network Traffic Timeline
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={timeData}>
            <defs>
              <linearGradient id="inbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="malGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3366" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
            <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<CyberTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="inbound" name="Inbound" stroke="#00d4ff" fill="url(#inbGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="outbound" name="Outbound" stroke="#00ff88" fill="url(#outGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="malicious" name="Malicious" stroke="#ff3366" fill="url(#malGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Protocol breakdown + Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-cyber-purple" />
            Protocol Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={protoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={45} />
              <Tooltip content={<CyberTooltip />} />
              <Bar dataKey="packets" name="Packets" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cyber-panel p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyber-yellow" />
            Flow Anomaly Scatter
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
              <XAxis dataKey="x" name="Bytes" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Bytes", fill: "#64748b", fontSize: 10, dy: 10 }} />
              <YAxis dataKey="y" name="Duration" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Duration", fill: "#64748b", fontSize: 10, angle: -90, dx: -10 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name="Normal"
                data={scatter.filter((d) => !d.attack)}
                fill="#00d4ff"
                opacity={0.7}
              />
              <Scatter
                name="Attack"
                data={scatter.filter((d) => d.attack)}
                fill="#ff3366"
                opacity={0.9}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyber-accent inline-block" /> Normal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Attack</span>
          </div>
        </div>
      </div>

      {/* Top talkers */}
      <div className="cyber-panel p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyber-green" />
          Top Talkers (by packet count)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cyber-border">
                {["Rank", "Source IP", "Destination IP", "Protocol", "Packets", "Bytes", "Risk"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 text-left text-slate-500 font-mono uppercase">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => {
                const risk = i < 2 ? "HIGH" : i < 4 ? "MEDIUM" : "LOW";
                const riskCls = i < 2 ? "text-red-400" : i < 4 ? "text-yellow-400" : "text-green-400";
                return (
                  <tr key={i} className="border-b border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors">
                    <td className="px-3 py-2 text-slate-500 font-mono">#{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-slate-300">
                      {`${[192, 10, 172][i % 3]}.${Math.floor(Math.random() * 255)}.${i}.${i + 1}`}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500">
                      {`10.0.0.${i + 1}`}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {["TCP", "UDP", "HTTP", "HTTPS", "ICMP", "DNS"][i]}
                    </td>
                    <td className="px-3 py-2 text-slate-300 font-semibold">
                      {(Math.floor(Math.random() * 5000 + 500)).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {`${(Math.random() * 10 + 0.5).toFixed(1)} MB`}
                    </td>
                    <td className={`px-3 py-2 font-semibold ${riskCls}`}>{risk}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
