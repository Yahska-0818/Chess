import { useState } from "react";
import ChessBoard from "./ChessBoard";
import MoveHistory from "./MoveHistory";
import CapturedPieces from "./CapturedPieces";
import ChatPanel from "./ChatPanel";
import { getCapturedPieces } from "../utils/gameHelpers";
import { Link } from "react-router-dom";

export default function GameScreen({
  chess,
  fen,
  turn,
  role,
  winner,
  isGameOver,
  makeMove,
  resetGame,
  isConnected = true,
  gameId,
  messages,
  sendChat,
  moveList
}) {
  const [activeTab, setActiveTab] = useState("chat");

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white gap-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Connecting to server...</p>
      </div>
    );
  }

  const board = chess.board();
  const history = chess.history({ verbose: true });
  const captured = getCapturedPieces(fen);

  const topCaptured = role === 'b' ? captured.b : captured.w;
  const bottomCaptured = role === 'b' ? captured.w : captured.b;

  const isMultiplayer = !!sendChat;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col">

      <nav className="border-b border-neutral-800 bg-neutral-900/95 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors">
          ChessLab
        </Link>
        <div className="flex gap-3 items-center">
          {gameId && <div className="hidden md:block px-2 py-0.5 bg-neutral-800 rounded text-xs font-mono text-neutral-400">ID: {gameId}</div>}
          <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${turn === 'w' ? 'bg-white text-black' : 'bg-neutral-800 text-white border border-neutral-600'}`}>
            {turn === 'w' ? "White" : "Black"}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 justify-center items-start w-full">
        
        <div className="flex flex-col gap-3 w-full max-w-[600px] mx-auto lg:mx-0">
          
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-neutral-700 flex items-center justify-center font-bold text-neutral-400">
                {role === 'w' ? 'B' : 'W'}
              </div>
              <span className="text-sm font-medium text-neutral-400">Opponent</span>
            </div>
            <CapturedPieces pieces={topCaptured} />
          </div>

          <ChessBoard chess={chess} board={board} role={role} onMove={makeMove} />

          <div className="flex justify-between items-start px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/20">
                {role === 'b' ? 'B' : 'W'}
              </div>
              <span className="text-sm font-medium text-white">You</span>
            </div>
            <CapturedPieces pieces={bottomCaptured} />
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          
          {isMultiplayer && (
            <div className="flex lg:hidden border-b border-neutral-700 mb-2">
              <button 
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'moves' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'}`}
              >
                Moves
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-bold ${activeTab === 'chat' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'}`}
              >
                Chat
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-2xl text-center mb-4">
              <h2 className="text-2xl font-black uppercase mb-1">Game Over</h2>
              <p className="text-amber-100 font-medium text-lg mb-4">
                {winner === 'draw' ? 'Draw' : `${winner === 'w' ? 'White' : 'Black'} Wins!`}
              </p>
              {resetGame && (
                <button onClick={resetGame} className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold shadow-lg w-full hover:scale-105 transition-transform">
                  Play Again
                </button>
              )}
              {!resetGame && <Link to="/" className="block mt-2 underline text-sm hover:text-amber-100">Return to Menu</Link>}
            </div>
          )}
          <div className={`
            ${!isMultiplayer ? 'block' : (activeTab === 'moves' ? 'block' : 'hidden')} 
            lg:block 
            h-[300px] lg:h-[400px]
          `}>
            <div className="h-full lg:hidden">
              <MoveHistory history={history} showTitle={!isMultiplayer} />
            </div>
            <div className="hidden lg:block h-full">
              <MoveHistory moves={moveList} showTitle={true} />
            </div>
          </div>

          {isMultiplayer && (
            <div className={`
              ${activeTab === 'chat' ? 'block' : 'hidden'} 
              lg:block 
              h-[300px] lg:h-[300px]
            `}>
              <div className="h-full lg:hidden">
                <ChatPanel messages={messages} onSend={sendChat} role={role} showTitle={false} />
              </div>
              <div className="hidden lg:block h-full">
                <ChatPanel messages={messages} onSend={sendChat} role={role} showTitle={true} />
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}