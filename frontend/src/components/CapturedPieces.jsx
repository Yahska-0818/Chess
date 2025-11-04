import { pieceIcons } from "../pieces";

const CapturedPieces = ({ pieces }) => {
  return (
    <ul className="grid grid-cols-2 gap-2 w-full">
      {pieces.map((piece, index) => (
      <li key={index} className="w-full h-14 flex items-center justify-center">
        {pieceIcons[`${piece.color}_${piece.type}`]}
      </li>
      ))}
    </ul>
  );
}

export default CapturedPieces