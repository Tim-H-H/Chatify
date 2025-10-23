import React, { useContext, useEffect, useState } from "react";
import { getConversations, getMessages, createMessage, deleteMessage } from "../api";
import sanitizeHtml from "sanitize-html";
import { v4 as uuidv4 } from "uuid";
import AuthContext from "../context/AuthContext";

function Message({ msg, isOwn, onDelete }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[70%] p-3 rounded ${isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}>
        <div className="text-sm">{msg.content}</div>
        <div className="text-xs mt-2 text-gray-200">{new Date(msg.createdAt || Date.now()).toLocaleString()}</div>
        {isOwn && <button onClick={() => onDelete(msg.id || msg._id)} className="text-xs text-red-100 mt-2">Radera</button>}
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selected) fetchMessagesFor(selected);
  }, [selected]);

  async function fetchConversations() {
    try {
      const res = await getConversations();
      const data = res.data || [];
      if (data.length >= 2) {
        setConvs(data);
        setSelected(data[0].id || data[0]._id || data[0].conversationId);
      } else {
        const fallback = [
          { id: crypto?.randomUUID?.() || uuidv4(), title: "General (lokal)" },
          { id: crypto?.randomUUID?.() || uuidv4(), title: "Projekt (lokal)" }
        ];
        setConvs(fallback);
        setSelected(fallback[0].id);
      }
    } catch (err) {
      console.error(err);
      const fallback = [
        { id: crypto?.randomUUID?.() || uuidv4(), title: "General (lokal)" },
        { id: crypto?.randomUUID?.() || uuidv4(), title: "Projekt (lokal)" }
      ];
      setConvs(fallback);
      setSelected(fallback[0].id);
    }
  }

  async function fetchMessagesFor(convId) {
    try {
      const res = await getMessages({ conversationId: convId });
      setMessages(res.data || []);
    } catch (err) {
      console.error("Kunde inte hämta meddelanden", err);
      setMessages([]);
    }
  }

  async function handleSend() {
    if (!newMsg.trim()) return;
    const clean = sanitizeHtml(newMsg, { allowedTags: [], allowedAttributes: {} });
    try {
      await createMessage({ conversationId: selected, content: clean });
      setNewMsg("");
      fetchMessagesFor(selected);
    } catch (err) {
      console.error("Skickfel", err);
    }
  }

  async function handleDelete(msgId) {
    if (!confirm("Vill du radera meddelandet?")) return;
    try {
      await deleteMessage(msgId);
      fetchMessagesFor(selected);
    } catch (err) {
      console.error("Radera fel", err);
    }
  }

  return (
    <div className="flex gap-6">
      <aside className="w-1/4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Konversationer</h3>
        <ul className="space-y-2">
          {convs.map(c => (
            <li key={c.id || c._id || c.conversationId}>
              <button onClick={() => setSelected(c.id || c._id || c.conversationId)} className={`w-full text-left px-3 py-2 rounded ${selected === (c.id || c._id || c.conversationId) ? "bg-blue-100" : "hover:bg-gray-50"}`}>
                {c.title || c.name || (c.id || c._id || c.conversationId)}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 bg-white p-4 rounded shadow flex flex-col">
        {!selected ? <div className="text-gray-500">Välj en konversation</div> : (
          <>
            <div className="flex-1 overflow-auto mb-4">
              {messages.length === 0 && <div className="text-gray-400">Inga meddelanden</div>}
              {messages.map(m => (
                <Message key={m.id || m._id} msg={m} isOwn={(m.userId || m.user?.id) === user.id} onDelete={handleDelete} />
              ))}
            </div>

            <div className="mt-auto">
              <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Skriv ett meddelande..." />
              <div className="flex gap-2">
                <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">Skicka</button>
                <button onClick={() => setNewMsg("")} className="px-4 py-2 bg-gray-200 rounded">Rensa</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
