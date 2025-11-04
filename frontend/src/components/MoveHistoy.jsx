const MoveHistory = ({ moveHistory = [], currentMoveIndex = null, onJumpToMove }) => {
  const rows = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    rows.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1
    });
  }

  const copyPGN = async () => {
    const pgn = rows.map(r => `${r.moveNumber}. ${r.white?.notation || ""} ${r.black?.notation || ""}`).join(' ');
    await navigator.clipboard.writeText(pgn);
    alert('PGN copied to clipboard');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(moveHistory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moveHistory.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-72 bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-lg ring-1 ring-black/20 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-200">Move History</h4>
        <div className="flex gap-2">
          <button onClick={copyPGN} className="text-xs px-2 py-1 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white">Copy PGN</button>
          <button onClick={exportJSON} className="text-xs px-2 py-1 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white">Export</button>
        </div>
      </div>

      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full table-fixed text-sm">
          <thead className="text-neutral-400 text-left sticky top-0">
            <tr>
              <th className="w-12">#</th>
              <th className="">White</th>
              <th className="">Black</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.moveNumber} className="align-top border-b border-white/5">
                <td className="py-2 pr-2 text-neutral-300">{r.moveNumber}</td>
                <td
                  className={`py-2 pr-2 cursor-pointer ${currentMoveIndex === r.whiteIndex ? 'bg-amber-500/30 rounded-md' : ''}`}
                  onClick={() => onJumpToMove && onJumpToMove(r.whiteIndex)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-200">{r.white?.notation || ''}</span>
                    {r.white?.capture && <span className="text-xs text-rose-400">x</span>}
                  </div>
                </td>
                <td
                  className={`py-2 pr-2 cursor-pointer ${currentMoveIndex === r.blackIndex ? 'bg-amber-500/30 rounded-md' : ''}`}
                  onClick={() => onJumpToMove && r.black && onJumpToMove(r.blackIndex)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-200">{r.black?.notation || ''}</span>
                    {r.black?.capture && <span className="text-xs text-rose-400">x</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MoveHistory