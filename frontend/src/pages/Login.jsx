import React, { useState } from "react";
import { Shield, Eye, EyeOff, Lock, User, Wifi } from "lucide-react";

// Default credentials for demo (shown on the UI)
const DEMO_USER = "admin";
const DEMO_PASS = "xai@2024";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate auth check (replace with real API call in production)
    setTimeout(() => {
      if (username === DEMO_USER && password === DEMO_PASS) {
        onLogin();
      } else {
        setError("Invalid credentials. Use admin / xai@2024");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-cyber-dark grid-bg flex items-center justify-center p-4">
      {/* Animated background rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 rounded-full border border-cyber-accent/10 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-cyber-accent/5 rotate-slow" />
          <div className="absolute inset-8 rounded-full border border-cyber-accent/5" />
        </div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
                          bg-cyber-panel border border-cyber-accent/30 mb-4 glow-border">
            <Shield className="w-10 h-10 text-cyber-accent" />
          </div>
          <h1 className="text-3xl font-bold text-cyber-accent font-mono glow-text tracking-wider">
            XAI-IDS
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Explainable AI Intrusion Detection System
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Wifi className="w-3 h-3 text-cyber-green" />
            <span className="text-xs text-cyber-green font-mono">
              SECURE CHANNEL ESTABLISHED
            </span>
          </div>
        </div>

        {/* Login card */}
        <div className="cyber-panel p-6 glow-border space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-200">
              System Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized personnel only
            </p>
          </div>

          {/* Demo hint */}
          <div className="bg-cyber-accent/5 border border-cyber-accent/20 rounded-lg p-3">
            <p className="text-xs text-cyber-accent text-center font-mono">
              Demo: <strong>admin</strong> / <strong>xai@2024</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                USERNAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="cyber-input pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="cyber-input pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded px-3 py-2">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cyber-btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Authenticate
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          XAI-IDS v1.0 — B.Tech Final Year Project
        </p>
      </div>
    </div>
  );
}

export default Login;
