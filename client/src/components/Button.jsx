const Button = ({ text,setOnClick }) => {
  return (
    <button className="
      relative overflow-hidden
      rounded-2xl border border-amber-100
      bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200
      text-neutral-800 font-medium tracking-wide
      px-10 py-5 min-w-40
      shadow-sm hover:shadow-lg hover:shadow-amber-100/50
      transition-all duration-300 ease-out
      hover:-translate-y-0.5 active:translate-y-0
      backdrop-blur-sm
      hover:cursor-pointer
    "  onClick={() => setOnClick(text)} >
      <span className="relative z-10">{text}</span>
    </button>
  );
};

export default Button;
