import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LocalGame from "./pages/LocalGame";
import Multiplayer from "./pages/Multiplayer";
import GameRoom from "./pages/GameRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/local" element={<LocalGame />} />
        <Route path="/multiplayer" element={<Multiplayer />} />
        <Route path="/game/:id" element={<GameRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}