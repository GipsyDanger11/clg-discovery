export function Logo({ showText = true, size = "sm" }: { showText?: boolean; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          size === "sm"
            ? "flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500"
            : size === "md"
              ? "flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500"
              : "flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500"
        }
      >
        <svg
          className={
            size === "sm"
              ? "h-5 w-5 text-white"
              : size === "md"
                ? "h-6 w-6 text-white"
                : "h-7 w-7 text-white"
          }
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="currentColor" />
          <path d="M2 7.5V12C2 12 4 13.5 12 13.5C20 13.5 22 12 22 12V7.5" fill="currentColor" />
          <path d="M6.5 10V15L12 17.5L17.5 15V10" fill="currentColor" opacity="0.8" />
          <rect x="9" y="16" width="6" height="3" rx="1" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
      {showText && (
        <span
          className={
            size === "sm"
              ? "text-xl font-bold text-primary-700"
              : size === "md"
                ? "text-2xl font-bold text-primary-700"
                : "text-3xl font-bold text-primary-700"
          }
        >
          CollegeDiscovery
        </span>
      )}
    </div>
  );
}
