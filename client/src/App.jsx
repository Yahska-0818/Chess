import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import GameMode from "./components/GameMode";
import LocalGame from "./pages/LocalGame";
import Multiplayer from "./pages/Multiplayer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 text-neutral-100">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">ChessLab</Link>
          <div className="flex gap-3 text-sm">
            <Link to="/local" className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">Local</Link>
            <Link to="/multiplayer" className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">Multiplayer</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<GameMode />} />
          <Route path="/local" element={<LocalGame />} />
          <Route path="/multiplayer" element={<Multiplayer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}