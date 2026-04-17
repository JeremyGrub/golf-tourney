export default function HeroCourseFallback() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        viewBox="0 0 600 600"
        className="absolute inset-0 w-full h-full cm-breathe"
        aria-hidden
      >
        <defs>
          <radialGradient id="topo-fade" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#4A6B7A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4A6B7A" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 10 }).map((_, i) => {
          const r = 40 + i * 26;
          return (
            <ellipse
              key={i}
              cx="300"
              cy="330"
              rx={r}
              ry={r * 0.45}
              fill="none"
              stroke="url(#topo-fade)"
              strokeWidth={1}
            />
          );
        })}
        <circle cx="300" cy="310" r="22" fill="#FFFDF7" stroke="#0E120F" strokeWidth="1" />
        <g>
          <line x1="430" y1="80" x2="430" y2="260" stroke="#0E120F" strokeWidth="2" />
          <polygon points="430,80 470,92 430,104" fill="#FF6B1A" />
        </g>
      </svg>
    </div>
  );
}
