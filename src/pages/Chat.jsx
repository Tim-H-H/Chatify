import { useContext, useEffect, useState } from "react";
import {
  getConversations,
  getMessages,
  createMessage,
  deleteMessage,
} from "../api";
import { v4 as uuidv4 } from "uuid";
import AuthContext from "../context/AuthContext";
import Message from "../components/Message";

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedId) fetchMessagesFor(selectedId);
  }, [selectedId]);

  async function fetchConversations() {
    try {
      const response = await getConversations();
      const data = response.data || {};
      const conversationGroups = response.data || {};

      console.log("data: ", data);
      const ids = Array.from(new Set([
        ...(conversationGroups.invitesReceived || []),
        ...(conversationGroups.invitesSent || []),
        ...(conversationGroups.participating || []),
      ]));

      if (data.length > 0) {
        const list = ids.map(id => ({ id, title: id }));
        setConversations(list);
        setSelectedId(list[0].id);
      } else {
        const fallback = [
          { id: crypto?.randomUUID?.() || uuidv4(), title: "General (lokal)" },
          { id: crypto?.randomUUID?.() || uuidv4(), title: "Projekt (lokal)" },
        ];
        setConversations(fallback);
        setSelectedId(fallback[0].id);
      }
    } catch (err) {
      // console.error("status:", err.response?.status);
      // console.error("headers:", err.response?.headers);
      // console.error("data:", err.response?.data);
      console.error(err);
      const fallback = [
        { id: crypto?.randomUUID?.() || uuidv4(), title: "General (lokal)" },
        { id: crypto?.randomUUID?.() || uuidv4(), title: "Projekt (lokal)" },
      ];
      setConversations(fallback);
      setSelectedId(fallback[0].id);
    }
  }

  async function fetchMessagesFor(conversationId) {
    try {
      console.log("conversationId: ", conversationId );
      const messageResult = await getMessages({ conversationId });
      const raw = messageResult.data || [];
      const normalized = raw.map((m) => ({
        ...m,
        id: m.id ?? m._id ?? m.messageId,
        content: m.content ?? m.text ?? "",
        userId: m.userId ?? m.user?.id ?? m.user_id ?? null,
        createdAt: m.createdAt ?? m.created_at ?? null,
      }));

      // normalized.sort(
      //   (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      // );

      if (selectedId === conversationId) {
    setMessages(normalized);    
      }
    } catch (err) {
      console.error("Kunde inte hämta meddelanden", err);
      setMessages([]);
    }
  }

  async function handleSend() {
    if (!newMsg.trim()) return;
    const clean = newMsg.trim();
    // console.log("clean: ", clean);
    // console.log("selectedId: ", selectedId);
    try {
      await createMessage({ text: clean, conversationId: selectedId });
      setNewMsg("");
      fetchMessagesFor(selectedId);
    } catch (err) {
      console.error("Skickfel", err);
    }
  }

  async function handleDelete(msgId) {
    if (!confirm("Vill du radera meddelandet?")) return;
    try {
      await deleteMessage(msgId);
      fetchMessagesFor(selectedId);
    } catch (err) {
      console.error("Radera fel", err);
    }
  }

  return (
    <div className="flex gap-6">
      <aside className="w-1/4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Konversationer</h3>
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                onClick={() => setSelectedId(conversation.id)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedId === conversation.id
                    ? "bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {conversation.title || conversation.name || conversation.id}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 bg-white p-4 rounded shadow flex flex-col">
        {!selectedId ? (
          <div className="text-gray-500">Välj en konversation</div>
        ) : (
          <>
            <div className="flex-1 overflow-auto mb-4">
              {messages.length === 0 && (
                <div className="text-gray-400">Inga meddelanden</div>
              )}
              {messages.map((msg) => (
                <Message
                  key={msg.id || msg._id}
                  msg={msg}
                  isOwn={(msg.userId || msg.user?.id) === user.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <div className="mt-auto">
              <textarea
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Skriv ett meddelande..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Skicka
                </button>
                <button
                  onClick={() => setNewMsg("")}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Rensa
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
