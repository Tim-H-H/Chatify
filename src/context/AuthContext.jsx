import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { tokenAuth, fetchCsrf } from "../api";

import { setAuthToken } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("chatify_auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.token) setAuthToken(user.token);
  }, [user]);

  async function login({ username, password }) {
    setLoading(true);
    try {
      await fetchCsrf();

      const res = await tokenAuth({ username, password });
      const token = res.data?.token || res.data?.accessToken || res.data;
      if (!token) throw new Error("Ingen token mottagen från API");

      let decoded = {};
      try {
        decoded = jwtDecode(token);
      } catch (e) {
        console.warn("Kunde inte dekoda token", e);
      }

      const authUser = {
        token,
        id: decoded?.sub || decoded?.id || res.data?.user?.id,
        username: decoded?.username || res.data?.user?.username || username,
        avatar: res.data?.user?.avatar || "https://i.pravatar.cc/40",
      };

      localStorage.setItem("chatify_auth", JSON.stringify(authUser));
      setAuthToken(token);
      setUser(authUser);
      setLoading(false);
      return authUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem("chatify_auth");
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
