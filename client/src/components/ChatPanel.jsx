import { useState, useEffect } from "react";

export default function ChatPanel({ socket, roomCode, role }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages((m) => [...m, msg]);
    };
    socket.on("chat:message", handler);
    return () => socket.off("chat:message", handler);
  }, [socket]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socket) return;

    const message = {
      by: role,
      text,
      ts: Date.now()
    };

    socket.emit("chat:message", { roomCode, message });
    setInput("");
  };

  return (
    <div className="flex h-full w-full max-h-96 flex-col rounded-2xl bg-white/5 p-3 ring-1 ring-black/20">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-neutral-300">
          Room <span className="font-mono">{roomCode}</span>
        </div>
        <div className="text-xs text-neutral-400">
          You are <span className="font-semibold">{role === "p1" ? "Player 1" : "Player 2"}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map((m, i) => {
          const mine = m.by === role;
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  mine
                    ? "bg-emerald-600/20 text-emerald-100"
                    : "bg-neutral-700/60 text-neutral-100"
                }`}
                title={new Date(m.ts).toLocaleTimeString()}
              >
                <div className="text-[10px] opacity-70 mb-0.5">
                  {m.by === "p1" ? "Player 1" : "Player 2"}
                </div>
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-black/30 focus:ring-white/20"
        />
        <button
          type="submit"
          className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
        >
          Send
        </button>
      </form>
    </div>
  );
}
