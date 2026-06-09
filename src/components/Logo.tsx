export function Logo({ showText = true, size = "sm" }: { showText?: boolean; size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 8 : size === "md" ? 10 : 12;
  const textSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-3xl";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-${iconSize} w-${iconSize} items-center justify-center rounded-lg bg-primary-500`}>
        <svg className={`h-${size === "sm" ? 5 : size === "md" ? 6 : 7} w-${size === "sm" ? 5 : size === "md" ? 6 : 7} text-white`} viewBox="0 0 120 120" fill="none">
          <path d="M60 24L24 44L60 64L96 44L60 24Z" fill="currentColor"/>
          <path d="M24 44V62C24 62 32 66 60 66C88 66 96 62 96 62V44" fill="currentColor"/>
          <path d="M44 54V74L60 82L76 74V54" fill="currentColor" opacity="0.8"/>
          <rect x="50" y="78" width="20" height="10" rx="2" fill="currentColor" opacity="0.9"/>
        </svg>
      </div>
      {showText && (
        <span className={`${textSize} font-bold text-primary-700`}>CollegeDiscovery</span>
      )}
    </div>
  );
}
