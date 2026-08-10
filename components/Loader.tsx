import Image from "next/image";

interface LoaderProps {
  text?: string;
  className?: string;
  size?: number;
}

const Loader = ({ text = "Loading...", className = "", size = 28 }: LoaderProps) => {
  return (
    <div className={`flex items-center justify-center gap-3 text-white ${className}`}>
      <Image
        src="/assets/icons/loader.svg"
        alt="loader"
        width={size}
        height={size}
        className="animate-spin"
      />
      {text && <span className="text-sm text-zinc-300 font-medium">{text}</span>}
    </div>
  );
};

export default Loader;