import { createContext, useEffect, useState } from "react";
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
      const csrfRes = await fetchCsrf();
      const token = csrfRes.data?.csrfToken;
      if (!token) throw new Error("Ingen token mottagen från API");
      const tokenAuthResult = await tokenAuth({
        username,
        password,
        csrfToken: token,
      });

      let decoded = {};
      const jwtToken = tokenAuthResult.data?.token;
      try {
        decoded = jwtDecode(jwtToken);
      } catch (err) {
        console.warn("AuthContext.jsx: login: Kunde inte dekoda token", err);
      }

      const authUser = {
        token,
        id: decoded?.sub || decoded?.id || tokenAuthResult.data?.user?.id,
        username:
          decoded?.username || tokenAuthResult.data?.user?.username || username,
        avatar:
          tokenAuthResult.data?.user?.avatar || "https://i.pravatar.cc/40",
      };

      localStorage.setItem("chatify_auth", JSON.stringify(authUser));
      setAuthToken(jwtToken);
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
