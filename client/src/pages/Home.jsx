import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white p-4">
      <div className="bg-neutral-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-neutral-700 max-w-lg w-full text-center">
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">ChessLab</h1>
        <p className="text-neutral-400 mb-10">Real-time Socket Chess</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/local')}
            className="w-full py-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 transition-all font-bold text-lg hover:scale-[1.02]"
          >
            Play Local (Pass & Play)
          </button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-700"></div></div>
            <div className="relative flex justify-center"><span className="bg-neutral-800 px-2 text-neutral-500 text-sm">OR</span></div>
          </div>
          <button 
            onClick={() => navigate('/multiplayer')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all font-bold text-lg shadow-lg shadow-emerald-900/20 hover:scale-[1.02]"
          >
            Play Online
          </button>
        </div>
      </div>
    </div>
  );
}