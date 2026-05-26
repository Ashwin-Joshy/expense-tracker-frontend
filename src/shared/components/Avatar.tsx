type Props = {
  src: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-8 text-[0.6rem]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
};

const initials = (name: string) => name.trim().slice(0, 2).toUpperCase() || "U";

export default function Avatar({ src, name, size = "md" }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizeClass[size]} rounded-full object-cover ring-1 ring-white/10`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass[size]} grid place-items-center rounded-full bg-white/10 font-semibold text-zinc-200 ring-1 ring-white/10`}
    >
      {initials(name)}
    </div>
  );
}
