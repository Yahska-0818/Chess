import { pieceIcons } from '../assets/pieceIcons';

const typeMap = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king'
};

export default function CapturedPieces({ pieces }) {
  if (!pieces || pieces.length === 0) return <div className="h-8 w-full"></div>;

  return (
    <div className="flex flex-wrap gap-1 items-center min-h-[32px] bg-neutral-800/40 p-1 rounded-lg border border-white/5">
      {pieces.map((p, i) => {
        const typeKey = typeMap[p.type] || p.type; 
        const colorKey = p.color === 'w' ? 'white' : 'black';
        
        return (
          <div key={i} className="w-6 h-6 opacity-90 transform scale-90">
            {pieceIcons[`${colorKey}_${typeKey}`]}
          </div>
        );
      })}
    </div>
  );
}