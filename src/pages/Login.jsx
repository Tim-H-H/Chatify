import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [isError, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login({ username: form.username, password: form.password });
      navigate("/chat");
    } catch (error) {
      setError(true);
      setErrorMsg("Ogiltiga inloggningsuppgifter");
      console.log("Login.jsx: onSubmit: Error:", error);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Logga in</h1>
      {isError && <div className="mb-3 text-red-600">{errorMsg}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="username" value={form.username} onChange={onChange} placeholder="Username" className="w-full p-2 border rounded" />
        <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password" className="w-full p-2 border rounded" />
        <button className="w-full py-2 bg-green-600 text-white rounded">Logga in</button>
      </form>
      <div className="mt-3 text-sm text-gray-600">Inget konto? <button onClick={() => navigate("/register")} className="text-blue-600">Registrera</button></div>
    </div>
  );
}
