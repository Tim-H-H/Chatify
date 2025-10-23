import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import SideNav from "./components/SideNav";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex">
      <SideNav />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
