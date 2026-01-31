import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Multiplayer() {
  const navigate = useNavigate();
  const [view, setView] = useState("menu");
  const [roomCode, setRoomCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateClick = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setView("create");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const startGame = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: roomCode })
      });
      
      const data = await res.json();
      
      if (data.gameId) {
        navigate(`/game/${data.gameId}`);
      } else {
        throw new Error("No ID returned");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      alert("Error starting game. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white p-4">
      {view === "menu" && (
        <div className="bg-neutral-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-neutral-700 w-full max-w-md text-center">
          <h2 className="text-3xl font-black mb-8 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            Multiplayer
          </h2>
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleCreateClick}
              className="w-full py-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 font-bold text-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              Create Party
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-700"></div></div>
              <div className="relative flex justify-center"><span className="bg-neutral-800 px-2 text-neutral-500 text-sm font-mono">OR</span></div>
            </div>
            <button 
              onClick={() => setView("join")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Join Party
            </button>
            <button onClick={() => navigate('/')} className="mt-4 text-neutral-400 hover:text-white text-sm cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {view === "create" && (
        <div className="bg-neutral-800 p-8 rounded-3xl shadow-2xl border border-neutral-700 w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
          <h3 className="text-neutral-400 font-medium mb-4">Your Party Code</h3>
          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 bg-black/40 border border-neutral-600 rounded-xl py-4 text-3xl font-mono font-bold tracking-widest text-amber-400 select-all">
              {roomCode}
            </div>
            <button 
              onClick={copyToClipboard}
              className={`h-full px-5 rounded-xl border font-bold transition-all duration-200 ${isCopied ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 p-5' : 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600 p-5 cursor-pointer'}`}
              title="Copy to clipboard"
            >
              {isCopied ? "✓" : "Copy"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={startGame}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              {loading ? "Starting..." : "Start Game"}
            </button>
            <button 
              onClick={() => setView("menu")}
              className="text-neutral-500 hover:text-neutral-300 py-2 cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      )}
      {view === "join" && (
        <div className="bg-neutral-800 p-8 rounded-3xl shadow-2xl border border-neutral-700 w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-300">
          <h2 className="text-xl font-bold mb-6 text-center">Enter Party Code</h2>
          <div className="flex gap-2 mb-6">
            <input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="X7K9P2"
              maxLength={6}
              className="flex-1 bg-neutral-900 border border-neutral-600 rounded-xl px-4 py-3 text-center text-2xl font-mono uppercase focus:border-amber-500 outline-none transition-colors placeholder:text-neutral-700"
            />
          </div>
          <button 
            onClick={() => roomCode && navigate(`/game/${roomCode}`)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg shadow-lg mb-3"
          >
            Join Room
          </button>
          <button onClick={() => setView("menu")} className="w-full text-neutral-400 hover:text-white py-2">Back</button>
        </div>
      )}
    </div>
  );
}