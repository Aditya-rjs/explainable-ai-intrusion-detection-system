import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  Search,
  FileBarChart,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Wifi,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/alerts", label: "Threat Alerts", icon: ShieldAlert },
  { path: "/traffic", label: "Traffic Analysis", icon: Activity },
  { path: "/scan", label: "Manual Scan", icon: Search },
  { path: "/reports", label: "Reports", icon: FileBarChart },
  { path: "/settings", label: "Settings", icon: Settings },
];

function Layout({ children, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-cyber-dark overflow-hidden grid-bg">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } transition-all duration-300 bg-cyber-darker border-r border-cyber-border flex flex-col flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-cyber-border">
          <div className="relative flex-shrink-0">
            <Shield className="w-8 h-8 text-cyber-accent" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-green rounded-full border border-cyber-darker animate-pulse" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-cyber-accent font-bold text-sm font-mono glow-text">
                XAI-IDS
              </div>
              <div className="text-slate-500 text-xs">Intrusion Detection</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${
                    active
                      ? "bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent"
                      : "text-slate-400 hover:text-slate-200 hover:bg-cyber-panel"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${active ? "text-cyber-accent" : ""}`}
                />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
                {active && sidebarOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyber-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status + Logout */}
        <div className="border-t border-cyber-border p-3 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-2 px-2 py-1">
              <Wifi className="w-4 h-4 text-cyber-green" />
              <span className="text-xs text-cyber-green font-mono">
                MONITORING ACTIVE
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400
                       hover:text-cyber-red hover:bg-red-900/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-cyber-darker border-b border-cyber-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-cyber-accent transition-colors p-1 rounded"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-200">
                {navItems.find((n) => n.path === location.pathname)?.label ||
                  "XAI-IDS"}
              </h1>
              <p className="text-xs text-slate-500">
                Explainable AI Intrusion Detection System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-cyber-accent font-mono">
                {time.toLocaleTimeString()}
              </div>
              <div className="text-xs text-slate-500">
                {time.toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-cyber-panel border border-cyber-border rounded-lg px-3 py-1.5">
              <span className="status-dot bg-cyber-green animate-pulse" />
              <span className="text-xs text-slate-300 font-mono">
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
