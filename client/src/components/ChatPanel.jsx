import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, onSend, role }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 shadow-xl">
      <div className="bg-neutral-900 p-3 border-b border-neutral-700 font-bold text-neutral-300 flex justify-between items-center">
        <span>Chat</span>
        <span className="text-xs font-normal text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
          {role === 'w' ? 'Playing as White' : role === 'b' ? 'Playing as Black' : 'Spectating'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-600">
        {messages.length === 0 && (
          <div className="text-neutral-500 text-center text-sm mt-4 italic">No messages yet...</div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.role === role;
          return (
            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div 
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm break-words ${
                  isMe 
                    ? "bg-emerald-600 text-white rounded-br-none" 
                    : "bg-neutral-700 text-neutral-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 uppercase font-bold">
                {msg.role === 'w' ? 'White' : msg.role === 'b' ? 'Black' : 'Spec'}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 bg-neutral-900 border-t border-neutral-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors"
        />
        <button 
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded text-sm font-bold transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}