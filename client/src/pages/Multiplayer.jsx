import { useState } from "react";
import Button from "../components/Button";
import useChessGame from "../hooks/useChessGame";
import GameScreen from "../components/GameScreen";

function getSecureCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join('');
}

function MultiplayerRoom() {
  const gameState = useChessGame();
  return <GameScreen {...gameState} />;
}

const Multiplayer = () => {
  const [mode,setMode] = useState(null);
  const [code,setCode] = useState(getSecureCode());
  const [copy,setCopy] = useState(false);
  const [joinCode,setJoinCode] = useState('');
  const [joining,setJoining] = useState(false);

  const inRoom =
    mode === 'Create Party' ||
    (mode === 'Join With A Code' && joining);

  const handleChange = (event) => {
    const newValue = event.target.value.toUpperCase();
    setJoinCode(newValue);
  };
  if (inRoom) {
    return <MultiplayerRoom />;
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex justify-center items-center">
        <div className="bg-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-12 p-16 border border-neutral-700 shadow-lg shadow-black/40">
          <div className="flex gap-8">
            <Button text="Create Party" onClick={() => setMode('create')}/>
            <Button text="Join With A Code" onClick={() => setMode('join')}/>
          </div>
        </div>
      </div>
    );
  } else if (mode == 'create') {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex justify-center items-center">
        <div className="bg-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-12 p-16 border border-neutral-700 shadow-lg shadow-black/40">
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-neutral-300">Party Code</div>
            <div className="flex items-center gap-6">
              <span className="font-mono text-3xl tracking-wider bg-neutral-700/50 px-6 py-3 rounded-xl border border-neutral-600 select-all" aria-live="polite" title="Party code - click Copy to copy">
                {code}
              </span>
              <button
                className="relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 font-medium tracking-wide px-8 py-4 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm hover:cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopy(true);
                  setTimeout(() => setCopy(false), 1200);
                }}
              >
                <span className="relative z-10">{copy ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-10 mt-4">
            <button
              className="relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 font-medium tracking-wide px-10 py-5 min-w-40 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm hover:cursor-pointer"
              onClick={() => setCode(getSecureCode())}
            >
              <span className="relative z-10">Regenerate</span>
            </button>

            <button
              className="relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 font-medium tracking-wide px-10 py-5 min-w-40 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm hover:cursor-pointer"
              onClick={() => setMode(null)}
            >
              <span className="relative z-10">Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  } else if (mode == 'join') {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex justify-center items-center">
        <div className="bg-neutral-800 rounded-2xl flex items-center justify-center gap-5 p-16 border border-neutral-700 shadow-lg shadow-black/40">
          <form className="flex gap-5" onSubmit={(event) => { event.preventDefault(); setJoining(true); }}>
            <input
              type="text"
              value={joinCode}
              onChange={handleChange}
              className="border-2 border-neutral-50 rounded-2xl p-4 font-mono text-sm uppercase"
              placeholder="Enter a 6 digit code"
              required
              minLength={6}
              maxLength={6}
              pattern="[A-Z0-9]{6}"
              inputMode="text"
              aria-label="Enter party code"
            />
            <button
              className={`relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 font-medium tracking-wide px-10 py-5 min-w-40 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm hover:cursor-pointer ${joining ? 'opacity-60 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={joining}
            >
              <span className="relative z-10">{joining ? 'Joining!' : 'Join'}</span>
            </button>
          </form>
          <button
            className="relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 font-medium tracking-wide px-10 py-5 min-w-40 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm hover:cursor-pointer"
            onClick={() => setMode(null)}
          >
            <span className="relative z-10">Back</span>
          </button>
        </div>
      </div>
    );
  }
};

export default Multiplayer;