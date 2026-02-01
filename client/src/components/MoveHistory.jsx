import { useEffect, useRef } from "react";

export default function MoveHistory({ moves = [], showTitle = true }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [moves]);

  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1]
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
                <td className="py-2 pl-2 font-medium text-neutral-200">{row.white?.san}</td>
                <td className="py-2 pl-2 font-medium text-neutral-200">{row.black?.san}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}