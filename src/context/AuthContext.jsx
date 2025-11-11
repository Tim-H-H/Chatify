import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { tokenAuth, fetchCsrf, setAuthToken } from "../api";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("chatify_auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      console.warn("Authprovider: setUser: No value found in local storage, returning null")
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.jwtToken) setAuthToken(user.jwtToken);
  }, [user]);

// TODO: Se till att antingen skicka felmeddelande när jwtToken har gått ut eller stanna så länge jag kan.

  async function login({ username, password }) {
    setLoading(true);
    try {
      const csrfResult = await fetchCsrf();
      const csrftoken = csrfResult.data?.csrfToken;
      if (!csrftoken) throw new Error("Ingen token mottagen från API");
      const tokenAuthResult = await tokenAuth({
        username,
        password,
        csrfToken: csrftoken,
      });

      let decoded = {};
      const jwtToken = tokenAuthResult.data?.token;
      try {
        decoded = jwtDecode(jwtToken);
        console.log("decoded: ", decoded);
      } catch (err) {
        console.warn("AuthContext.jsx: login: Kunde inte dekoda token", err);
      }
      
      const authUser = {
        jwtToken,
        csrftoken,
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
