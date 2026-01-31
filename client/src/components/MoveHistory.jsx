export default function MoveHistory({ history, showTitle = true }) {
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1]
    });
  }

  return (
    <div className="flex flex-col h-full bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 shadow-xl">
      {showTitle && (
        <div className="bg-neutral-900 p-3 border-b border-neutral-700 font-bold text-neutral-300">
          Move History
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-neutral-600">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.num} className="odd:bg-neutral-800 even:bg-neutral-800/50 border-b border-neutral-700/30">
                <td className="py-2 pl-4 w-8 text-neutral-500 font-mono">{row.num}.</td>
                <td className="py-2 pl-2 font-medium text-neutral-200">{row.white.san}</td>
                <td className="py-2 pl-2 font-medium text-neutral-200">{row.black?.san}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}