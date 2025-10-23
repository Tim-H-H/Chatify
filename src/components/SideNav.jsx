import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function SideNav() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r p-4">
      <div className="flex items-center gap-3 mb-6">
        <img src={user.avatar || "https://i.pravatar.cc/40"} alt="avatar" className="w-10 h-10 rounded-full" />
        <div>
          <div className="font-semibold">{user.username}</div>
          <div className="text-xs text-gray-500">ID: {user.id}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <Link to="/profile" className="px-3 py-2 rounded hover:bg-gray-100">Profil</Link>
        <Link to="/chat" className="px-3 py-2 rounded hover:bg-gray-100">Chat</Link>
      </nav>

      <div className="mt-6">
        <button onClick={handleLogout} className="w-full text-left px-3 py-2 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>
    </aside>
  );
}
