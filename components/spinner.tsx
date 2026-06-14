// Minimal spinning ring — drop-in for any button or inline context.
// Inherits `currentColor` so it matches whatever text colour the parent has.
export default function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      {/* Arc */}
      <path
        fill="currentColor"
        className="opacity-80"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
