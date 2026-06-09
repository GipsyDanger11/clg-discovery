export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <div className="absolute bottom-0 left-0 w-[200%] h-52">
        <svg
          className="absolute bottom-0 left-0 w-full h-52"
          viewBox="0 0 2880 180"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#6B46C1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="wave2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#553C9A" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path
            className="animate-wave"
            fill="url(#wave1)"
            d="M0,80 C480,160 720,0 1440,80 C2160,160 2400,0 2880,80 L2880,180 L0,180 Z"
          />
          <path
            className="animate-wave-slow"
            fill="url(#wave2)"
            d="M0,110 C480,30 960,160 1440,110 C1920,60 2400,160 2880,110 L2880,180 L0,180 Z"
          />
        </svg>
      </div>
    </div>
  );
}
