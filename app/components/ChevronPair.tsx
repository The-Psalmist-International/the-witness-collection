export function ChevronPair({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col text-neutral-400 ${className}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="-mb-0.5"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="-mt-0.5"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
