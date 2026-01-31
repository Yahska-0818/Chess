import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

export default function Multiplayer() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/game/create`, { method: 'POST' });
      const data = await res.json();
      if (data.gameId) navigate(`/game/${data.gameId}`);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white p-4">
      <div className="bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700 w-full max-w-md">
        <button onClick={() => navigate('/')} className="mb-6 text-sm text-neutral-400 hover:text-white flex items-center gap-1">← Back</button>
        <h2 className="text-2xl font-bold mb-6">Multiplayer Lobby</h2>
        
        <button 
          onClick={createGame} 
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl mb-6 transition-colors"
        >
          {loading ? "Creating..." : "Create New Room"}
        </button>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400 font-medium">Join Existing Room</label>
          <div className="flex gap-2">
            <input 
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Room ID"
              className="flex-1 bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 font-mono focus:border-amber-500 outline-none transition-colors"
            />
            <button 
              onClick={() => gameId && navigate(`/game/${gameId}`)}
              className="bg-neutral-700 hover:bg-neutral-600 px-6 rounded-lg font-bold transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}