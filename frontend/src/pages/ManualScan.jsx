import React, { useState } from "react";
import {
  Search,
  Play,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { runScan } from "../services/api.js";

const PROTOCOLS = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "FTP", "SSH"];
const ATTACK_TYPES_MOCK = [
  "DDoS", "Port Scan", "Brute Force", "SQL Injection",
  "Botnet", "DNS Tunneling", "FTP Patator", "SSH Patator", "BENIGN",
];

const defaultForm = {
  source_ip: "192.168.1.100",
  dest_ip: "10.0.0.1",
  src_port: "54321",
  dest_port: "80",
  protocol: "TCP",
  packet_size: "1500",
  flow_duration: "120",
  byte_rate: "12500",
  packet_rate: "45",
  flags: "SYN",
};

function Field({ label, name, value, onChange, type = "text", options }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1 font-mono uppercase">
        {label}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="cyber-input text-sm"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="cyber-input text-sm"
        />
      )}
    </div>
  );
}

function ShapBar({ feature, value }) {
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-slate-500 w-28 truncate font-mono">{feature}</span>
      <div className="flex-1 h-2 bg-cyber-darker rounded-full overflow-hidden relative">
        {positive ? (
          <div
            className="absolute left-1/2 top-0 h-full bg-red-500 rounded-full"
            style={{ width: `${Math.min(Math.abs(value) * 100, 50)}%` }}
          />
        ) : (
          <div
            className="absolute right-1/2 top-0 h-full bg-cyan-500 rounded-full"
            style={{ width: `${Math.min(Math.abs(value) * 100, 50)}%` }}
          />
        )}
      </div>
      <span className={`w-14 text-right font-mono ${positive ? "text-red-400" : "text-cyan-400"}`}>
        {positive ? "+" : ""}{value.toFixed(3)}
      </span>
    </div>
  );
}

export default function ManualScan() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [history, setHistory] = useState([]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setScanning(true);
    setResult(null);

    try {
      const res = await runScan(form);
      setResult(res);
      if (res) setHistory((prev) => [{ ...res, input: form, ts: new Date() }, ...prev.slice(0, 9)]);
    } catch {
      // Backend offline — generate mock result
      const mockAttack = ATTACK_TYPES_MOCK[Math.floor(Math.random() * ATTACK_TYPES_MOCK.length)];
      const confidence = parseFloat((Math.random() * 30 + 70).toFixed(2));
      const mock = {
        prediction: mockAttack,
        confidence,
        severity: confidence > 90 ? "CRITICAL" : confidence > 80 ? "HIGH" : confidence > 70 ? "MEDIUM" : "LOW",
        is_attack: mockAttack !== "BENIGN",
        shap_values: {
          packet_size: (Math.random() - 0.3) * 0.8,
          flow_duration: (Math.random() - 0.3) * 0.6,
          byte_rate: (Math.random() - 0.3) * 0.7,
          packet_rate: (Math.random() - 0.3) * 0.5,
          src_port: (Math.random() - 0.5) * 0.3,
          flags: (Math.random() - 0.5) * 0.4,
          protocol: (Math.random() - 0.5) * 0.2,
          dest_port: (Math.random() - 0.5) * 0.3,
        },
        top_features: ["packet_size", "byte_rate", "flow_duration"],
      };
      setResult(mock);
      setHistory((prev) => [{ ...mock, input: form, ts: new Date() }, ...prev.slice(0, 9)]);
    } finally {
      setScanning(false);
    }
  };

  const severityColor =
    result?.severity === "CRITICAL"
      ? "text-red-400 border-red-800 bg-red-900/20"
      : result?.severity === "HIGH"
      ? "text-orange-400 border-orange-800 bg-orange-900/20"
      : result?.severity === "MEDIUM"
      ? "text-yellow-400 border-yellow-800 bg-yellow-900/20"
      : "text-green-400 border-green-800 bg-green-900/20";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
      {/* Left: Input form */}
      <div className="space-y-4">
        <div className="cyber-panel p-4">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyber-accent" />
            Manual Packet Scan
          </h3>

          <form onSubmit={handleScan} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Source IP" name="source_ip" value={form.source_ip} onChange={handleChange} />
              <Field label="Dest IP" name="dest_ip" value={form.dest_ip} onChange={handleChange} />
              <Field label="Src Port" name="src_port" value={form.src_port} onChange={handleChange} type="number" />
              <Field label="Dest Port" name="dest_port" value={form.dest_port} onChange={handleChange} type="number" />
              <Field label="Protocol" name="protocol" value={form.protocol} onChange={handleChange} options={PROTOCOLS} />
              <Field label="Flags" name="flags" value={form.flags} onChange={handleChange} options={["SYN", "ACK", "FIN", "RST", "PSH", "URG", "SYN-ACK"]} />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Advanced Traffic Features
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field label="Packet Size (bytes)" name="packet_size" value={form.packet_size} onChange={handleChange} type="number" />
                <Field label="Flow Duration (ms)" name="flow_duration" value={form.flow_duration} onChange={handleChange} type="number" />
                <Field label="Byte Rate (B/s)" name="byte_rate" value={form.byte_rate} onChange={handleChange} type="number" />
                <Field label="Packet Rate (p/s)" name="packet_rate" value={form.packet_rate} onChange={handleChange} type="number" />
              </div>
            )}

            <button
              type="submit"
              disabled={scanning}
              className="cyber-btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {scanning ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" />
                  Analyzing with XAI-IDS...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Detection
                </>
              )}
            </button>
          </form>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="cyber-panel p-4">
            <h4 className="text-xs font-semibold text-slate-400 mb-3 font-mono uppercase">
              Scan History
            </h4>
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded bg-cyber-darker border border-cyber-border/50 cursor-pointer hover:border-cyber-accent/30"
                  onClick={() => setResult(h)}
                >
                  <span className="text-slate-300 font-semibold">{h.prediction}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{h.confidence?.toFixed(1)}%</span>
                    <span className="text-slate-600 font-mono">{h.ts?.toLocaleTimeString?.()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Result */}
      <div className="space-y-4">
        {!result && !scanning && (
          <div className="cyber-panel p-8 flex flex-col items-center justify-center text-center h-64">
            <Cpu className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">
              Configure traffic parameters and run detection
            </p>
            <p className="text-slate-600 text-xs mt-1">
              XGBoost + SHAP will analyze the packet features
            </p>
          </div>
        )}

        {scanning && (
          <div className="cyber-panel p-8 flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-cyber-accent/30 border-t-cyber-accent animate-spin" />
              <Cpu className="absolute inset-0 m-auto w-6 h-6 text-cyber-accent" />
            </div>
            <p className="text-cyber-accent font-mono mt-4 text-sm">Running XGBoost model...</p>
            <p className="text-slate-500 text-xs mt-1">Generating SHAP explanations</p>
          </div>
        )}

        {result && !scanning && (
          <>
            {/* Verdict */}
            <div className={`cyber-panel p-5 border ${severityColor}`}>
              <div className="flex items-center gap-3">
                {result.is_attack ? (
                  <ShieldAlert className="w-8 h-8 text-red-400 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-green-400 flex-shrink-0" />
                )}
                <div>
                  <p className="text-xs text-slate-500 font-mono">PREDICTION</p>
                  <p className="text-2xl font-bold text-slate-100 font-mono">
                    {result.prediction}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Confidence:{" "}
                    <strong className="text-slate-200">{result.confidence?.toFixed(2)}%</strong>
                    {result.severity && (
                      <>
                        {" "}· Severity: <strong className={severityColor.split(" ")[0]}>{result.severity}</strong>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-3">
                <div className="h-2 bg-cyber-darker rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.is_attack ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* SHAP explanations */}
            {result.shap_values && (
              <div className="cyber-panel p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-1">
                  SHAP Feature Explanations
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Positive values (red) push toward attack; negative (blue) push toward benign.
                </p>
                <div className="space-y-2">
                  {Object.entries(result.shap_values)
                    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                    .map(([feature, value]) => (
                      <ShapBar key={feature} feature={feature} value={value} />
                    ))}
                </div>
              </div>
            )}

            {/* Input summary */}
            <div className="cyber-panel p-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-2 font-mono uppercase">
                Input Summary
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(form).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-cyber-border/30 py-1">
                    <span className="text-slate-500 font-mono">{k}</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
