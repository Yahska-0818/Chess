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
  sendChat
}) {
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

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-amber-500/30">
      <nav className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors">
            ChessLab
          </Link>
          <div className="flex gap-4 items-center">
            {gameId && <div className="hidden md:block px-3 py-1 bg-neutral-800 rounded text-xs font-mono text-neutral-400">ID: {gameId}</div>}
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${turn === 'w' ? 'bg-white text-black' : 'bg-neutral-800 text-white border border-neutral-600'}`}>
              {turn === 'w' ? "White's Turn" : "Black's Turn"}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 justify-center items-start">

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

        <div className="w-full lg:w-80 flex flex-col gap-4 h-[600px] lg:h-auto lg:min-h-[600px]">
          
          {isGameOver && (
            <div className="animate-in slide-in-from-top-4 duration-500 bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-2xl text-center">
              <h2 className="text-2xl font-black uppercase mb-1">Game Over</h2>
              <p className="text-amber-100 font-medium text-lg mb-4">
                {winner === 'draw' ? 'Stalemate / Draw' : `${winner === 'w' ? 'White' : 'Black'} Wins!`}
              </p>
              {resetGame && (
                <button onClick={resetGame} className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
                  Play Again
                </button>
              )}
              {!resetGame && <Link to="/" className="block mt-2 underline text-sm hover:text-amber-100">Return to Menu</Link>}
            </div>
          )}

          <div className={`${sendChat ? 'h-1/2' : 'h-full'} min-h-[200px]`}>
            <MoveHistory history={history} />
          </div>
          {sendChat && (
            <div className="h-1/2 min-h-[200px]">
              <ChatPanel messages={messages} onSend={sendChat} role={role} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}