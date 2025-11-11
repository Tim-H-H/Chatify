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
import { fakeData } from "../fakeChat.js";

// const fakeConversationId = "fake-local-conversation";
// const fakeWrittenMessages = [
//   {id: "f1", text: "Hej, detta är ett fejkmeddelande.", userId: "fakeUser1", avatar: "https://i.pravatar.cc/100?img=1" },
//   {id: "f2", text: "Välkommen till Chatify!", userId: "fakeUser2", avatar: "https://i.pravatar.cc/100?img=2" },
// ];


export default function Chat() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [fakeMessages, setFakeMessages] = useState([]);
  const [newFakeMsg, setFakeMsg] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

// useEffect(() => {
//   console.log("useEffect - fetchconversations");
//   if(user?.jwtToken) fetchConversations();
// }, [user?.jwtToken]);



  useEffect(() => {
    console.log("useEffect - fetchMessagesFor");
    console.log("useEffect: selectedConversationId: ", selectedConversation);
    if (selectedConversation) fetchMessagesFor(selectedConversation);
  }, [selectedConversation]);

  async function fetchConversations() {
    try {
      // console.log("jwtToken: ", user.jwtToken );
      // console.log("csrftoken: ", user.csrftoken);
      console.log("user: ", user);

      const response = await getConversations();
      console.log("response: ", response)
      const conversationGroups = response.data || {};

      const ids = Array.from(
        new Set([
          ...(conversationGroups.invitesReceived || []),
          ...(conversationGroups.invitesSent || []),
          ...(conversationGroups.participating || []),
        ])
      );

      console.log("ids: ", ids);

      if (ids.length) {
        const list = ids.map((id) => ({ id, title: id }));

        setConversations(list);
        setSelectedConversation(list[0].id);
      } 
      else {
        const fallback = [
          { id: crypto?.randomUUID?.() || uuidv4(), title: "Fake Konversation 1" , userId: 1},
          { id: crypto?.randomUUID?.() || uuidv4(), title: "Fake Konversation 2" , userId: 2},
        ];

        setConversations(fallback);
        setSelectedConversation(fallback[0].id);

         console.log("conversations: ", conversations);
         console.log("selectedId: ", selectedConversation);
      }
    } catch (err) {
      console.error(
        "fetchConversations(): Ett fel inträffade när konversationer skulle hämtas: ",
        err
      );
      const fallback = [
        { id: crypto?.randomUUID?.() || uuidv4(), title: "Fake Konversation 1" , userId: 1},
        { id: crypto?.randomUUID?.() || uuidv4(), title: "Fake Konversation 2" , userId: 2},
      ];
      setConversations(fallback);
      setSelectedConversation(fallback[0].id);
    }
  }

  async function fetchMessagesFor(conversation) {
    try {
      console.log("conversationId: ", conversation.id);
      const messageResult = await getMessages( conversation.id );
      const messages = messageResult.data ;
      console.log("messages: ", messages);

      if (selectedConversation.id === conversation.id) {

        const mergedMessages = [];
        console.log("conversation.userId: ", conversation.userId);
        fakeData.forEach((fakeMessage, i) => {
          if(messages[i] && messages[i].text && messages[i].text === fakeMessage.question) {
            mergedMessages.push(messages[i]);
            mergedMessages.push({userId: conversation.userId, text: fakeMessage.response });
          } else {

          }

        })
        console.log("mergedMessages: ", mergedMessages);

        

        // TODO: 1. Deklarera en variabel som är en array som heter mergedMessages.
        // 2. Loopa igenom messages med forEach. För varje iteration så ska man pusha ett fejk meddelande efter mitt meddelande, beroende på vilken frågan. 
        // array.push exempel: const test = []; test.push("Hej"); console.log(test); // ["Hej"]
        // test.push("då"); console.log(test); // ["Hej", "då"]
        setMessages(mergedMessages);
      }
    } catch (err) {
      console.error("Chat.jsx: fetchMessagesFor: Kunde inte hämta meddelanden", err);
      setMessages([]);
    }
  }

  async function handleSend() {
    if (!newMsg.trim()) return;
    const clean = newMsg.trim();
    try {
      await createMessage({ text: clean, conversationId: selectedConversation.id });
      setNewMsg("");
      fetchMessagesFor(selectedConversation);
    } catch (err) {
      console.error("Chat.jsx: handleSend(): ", err);
    }
  }

  async function handleDelete(msgId) {
    if (!confirm("Vill du radera meddelandet?")) return;
    try {
      await deleteMessage(msgId);
      fetchMessagesFor(selectedConversation);
    } catch (err) {
      console.error("Chat.jsx: handleDelete(msgId): Kunde inte radera ditt meddelande", err);
    }
  }

  return (
    <div className="flex gap-6">
      <aside className="w-1/4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Konversationer</h3>
        <ul className="space-y-2">
          {conversations.length ? conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedConversation.id === conversation.id
                    ? "bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {conversation.title || conversation.name || conversation.id}
              </button>
            </li>
          )) : "Inga konversationer än..." }
        </ul>
      </aside>

      <section className="flex-1 bg-white p-4 rounded shadow flex flex-col">
        {!selectedConversation ? (
          <div className="text-gray-500">Välj en konversation</div>
        ) : (
          <>
            <div className="flex-1 overflow-auto mb-4">
              {messages.length === 0 && (
                <div className="text-gray-400">Inga meddelanden</div>
              )}
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.userId === user.id}
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
