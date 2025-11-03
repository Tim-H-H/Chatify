import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { getUser, updateUser, deleteUser } from "../api";

export default function Profile() {
  const { user, logout, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", avatar: "" });
  // const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (user?.id) {
      (async () => {
        try {
          const result = await getUser(user.id);
          const userResult = result.data;
          setForm({ username: userResult.username || "", email: userResult.email || "", avatar: userResult.avatar || "" });
          // setPreview(userResult.avatar || "");
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [user]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // if (name === "avatar") setPreview(value);
  }

  async function onSave(e) {
    e.preventDefault();
    try {
      await updateUser({ 
        userId: Number(user.id), 
        updatedData: {
        username: form.username, 
        email: form.email, 
        avatar: form.avatar
        },
      });
      setMsg("Uppdatering lyckades");

      setUser(prev => ({ ...prev, username: form.username, avatar: form.avatar }));
      const raw = JSON.parse(localStorage.getItem("chatify_auth") || "{}");
      localStorage.setItem("chatify_auth", JSON.stringify({ ...raw, username: form.username, avatar: form.avatar }));
    } catch (err) {
      setMsg("Kunde inte uppdatera: " + (err?.response?.data?.message || err.message));
    }
  }



  async function handleDelete() {
    if (!confirm("Vill du radera ditt konto? Detta går inte att ångra.")) return;
    try {
      await deleteUser(user.id);
      alert("Kontot raderat");
      logout();
    } catch (err) {
      alert("Kunde inte radera kontot: " + (err?.response?.data?.message || err.message));
    }
  }

  return (
    <div className="max-w-lg bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Profil</h2>
      {msg && <div className="mb-3 text-green-600">{msg}</div>}
      <form onSubmit={onSave} className="space-y-3">
        <input name="username" value={form.username} onChange={onChange} placeholder="Username" className="w-full p-2 border rounded" />
        <input name="email" value={form.email} onChange={onChange} placeholder="Email" className="w-full p-2 border rounded" />
        <input name="avatar" value={form.avatar} onChange={onChange} placeholder="Avatar URL" className="w-full p-2 border rounded" />
        <div className="flex gap-2 mt-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Spara</button>
          <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">Radera konto</button>
        </div>
      </form>
    </div>
  );
}
