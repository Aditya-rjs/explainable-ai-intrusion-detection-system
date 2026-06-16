import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ThreatAlerts from "./pages/ThreatAlerts.jsx";
import TrafficAnalysis from "./pages/TrafficAnalysis.jsx";
import ManualScan from "./pages/ManualScan.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  // Simple auth state — in production, use JWT or session storage
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("xai_ids_auth") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("xai_ids_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("xai_ids_auth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<ThreatAlerts />} />
        <Route path="/traffic" element={<TrafficAnalysis />} />
        <Route path="/scan" element={<ManualScan />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
