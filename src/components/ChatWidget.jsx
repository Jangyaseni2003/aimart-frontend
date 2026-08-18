import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ChatWidget() {
  const { isAuthenticated, token } = useAuth();
  const { refreshCartCount } = useCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(API_BASE_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("message", (content) => {
      setMessages((prev) => [...prev, { from: "bot", text: content }]);
      setSending(false);
      refreshCartCount();
    });

    return () => socket.disconnect();
  }, [isAuthenticated, token, refreshCartCount]);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    setMessages((prev) => [...prev, { from: "me", text: input }]);
    socketRef.current.emit("message", input);
    setInput("");
    setSending(true);
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`chat-widget ${open ? "chat-widget-open" : ""}`}>
      {open ? (
        <div className="chat-panel">
          <div className="chat-header">
            <span>AI-BUDDY</span>
            <button className="link-button" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-message chat-message-${m.from}`}>
                {m.from === "bot" ? (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            ))}
            {sending && <div className="chat-message chat-message-bot">Thinking...</div>}
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              placeholder="Ask AI-BUDDY to find something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <button className="chat-fab" onClick={() => setOpen(true)}>
          Chat
        </button>
      )}
    </div>
  );
}
