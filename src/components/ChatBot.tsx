// ChatBot.tsx
import React, { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
 
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(
        "https://gigpoint-backend.onrender.com/ai/myBot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        }
      );
      const data = await res.json();

      // Typing effect simulation
      const botText = data.data || "No response";
      let index = 0;
      const interval = setInterval(() => {
        index++;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { sender: "bot", text: botText.slice(0, index) },
        ]);
        if (index === botText.length) {
          clearInterval(interval);
          setTyping(false);
        }
      }, 30);

      setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
    } catch {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-10 left-6 z-50">
      {/* Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-110"
        >
          💬
        </button>
      )}

      {/* Overlay & Popup */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          ></div>

          {/* Chat Window */}
          <div className="relative w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3">
              <h3 className="font-semibold">🤖 GigPoint Consultant</h3>
              <button onClick={() => setOpen(false)} className="text-lg">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm bg-gray-50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-[75%] ${
                      m.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="text-gray-500 text-xs italic">
                  Consultant is typing...
                </div>
              )}
              <div ref={bottomRef}></div>
            </div>

            {/* Input */}
            <div className="flex border-t bg-white">
              <input
                className="flex-1 px-3 py-2 text-sm outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your question..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 hover:bg-blue-700 transition"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
