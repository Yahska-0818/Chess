import Button from "./Button";
const Multiplayer = () => {
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
        <div className="flex gap-8">
          <Button text="Create Party"/>
          <Button text="Join With A Code"/>
        </div>
      </div>
    </div>
  );
}

export default Multiplayer;