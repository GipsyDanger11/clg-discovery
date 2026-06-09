export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800" />
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-64 opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          className="animate-wave"
          fill="url(#waveGrad)"
          d="M0,160 C320,300 420,60 720,160 C1020,260 1120,100 1440,160 L1440,320 L0,320 Z"
        />
        <path
          className="animate-wave-reverse"
          fill="url(#waveGrad)"
          opacity="0.5"
          d="M0,200 C320,80 480,280 720,200 C960,120 1120,280 1440,200 L1440,320 L0,320 Z"
        />
      </svg>
    </div>
  );
}
