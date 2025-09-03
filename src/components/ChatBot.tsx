// ChatBot.tsx
import React, { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Call your backend API
    try {
      const res = await fetch("https://gigpoint-backend.onrender.com/ai/myBot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();

      const botMessage: Message = { sender: "bot", text: data.data || "No response" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const botMessage: Message = { sender: "bot", text: "Something went wrong" };
      setMessages((prev) => [...prev, botMessage]);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          💬
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="w-80 max-h-[500px] bg-white border shadow-lg rounded-lg flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-lg">
            <h4>GigPoint Bot</h4>
            <button onClick={() => setIsOpen(false)} className="text-white font-bold">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg ${
                    msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="p-2 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
