import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    console.log("Registering user with data:", form);

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    try {
      // Lägg in ett request till fetchCsrf så du har token här.
      // Lägg till resultatet av det i payload.
      await registerUser(payload);
      alert("Registrering lyckades! Logga in.");
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data || err.message;
      setError(msg.error);
      console.log("Registration error:", msg);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Registrera</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="Username"
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <button className="w-full py-2 bg-blue-600 text-white rounded">
          Registrera
        </button>
      </form>
      <div className="mt-3 text-sm text-gray-600">
        Har du redan konto?{" "}
        <button onClick={() => navigate("/login")} className="text-blue-600">
          Logga in
        </button>
      </div>
    </div>
  );
}
