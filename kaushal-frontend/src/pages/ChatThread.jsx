// src/pages/ChatThread.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rtdb } from "../firebase/firebaseConfig";

import {
  ref,
  onValue,
  push,
  set,
} from "firebase/database";

import RatingModal from "../components/RatingModal";
import Button from "../components/Button";
import Input from "../components/Input";

export default function ChatThread() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showRating, setShowRating] = useState(false);

  // fallback user
  const currentUser =
    JSON.parse(localStorage.getItem("user")) || { uid: "unknown" };

  // ✅ Load messages
  useEffect(() => {
    const messagesRef = ref(rtdb, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgArr = Object.values(data).sort(
          (a, b) => a.timestamp - b.timestamp
        );
        setMessages(msgArr);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  // ✅ Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
    const newMsgRef = push(messagesRef);

    await set(newMsgRef, {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: Date.now(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* ✅ Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h2 className="font-semibold text-lg">Chat</h2>

        <div className="flex gap-2">
          <Button onClick={() => navigate(`/video/${chatId}`)}>🎥 Video</Button>
          <Button onClick={() => setShowRating(true)}>⭐ Rate</Button>
        </div>
      </div>

      {/* ✅ Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-2xl max-w-[75%] ${
              msg.senderId === currentUser.uid
                ? "bg-blue-600 text-white self-end"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* ✅ Message Input */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white flex gap-2 border-t items-center"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
        />
        <Button type="submit">Send</Button>
      </form>

      {/* ✅ Rating Modal */}
      {showRating && <RatingModal onClose={() => setShowRating(false)} />}
    </div>
  );
}
