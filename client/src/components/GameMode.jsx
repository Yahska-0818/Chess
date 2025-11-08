import Button from "./Button";

const GameMode = ({ setGameType }) => {
  return (
    <div className="
      min-h-screen 
      bg-neutral-900 text-white 
      flex justify-center items-center
    ">
      <div className="
        bg-neutral-800 
        rounded-2xl 
        flex flex-col items-center justify-center
        gap-12 p-16
        border border-neutral-700
        shadow-lg shadow-black/40
      ">
        <h1 className="text-3xl font-semibold tracking-wide text-neutral-100">
          Pick A Game Mode
        </h1>

        <div className="flex gap-8">
          <Button text="Local" setOnClick={setGameType}/>
          <Button text="Multiplayer" setOnClick={setGameType}/>
        </div>
      </div>
    </div>
  );
};

export default GameMode;
