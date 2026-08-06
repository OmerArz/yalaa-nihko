export default function BackgroundWave() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M-100,620 C 260,520 500,720 860,600 C 1180,500 1400,650 1640,560"
        fill="none" stroke="#2D5A27" strokeWidth={2} opacity={0.06}
        className="bg-wave-drift motion-reduce:animate-none"
        style={{ animationDuration: '26s' }}
      />
      <path
        d="M-100,760 C 300,680 560,860 900,740 C 1220,630 1420,780 1640,700"
        fill="none" stroke="#D4AF37" strokeWidth={2} opacity={0.06}
        className="bg-wave-drift-reverse motion-reduce:animate-none"
        style={{ animationDuration: '32s' }}
      />
      <path
        d="M-100,200 C 260,120 520,280 840,180 C 1140,90 1380,220 1640,160"
        fill="none" stroke="#0E7C86" strokeWidth={1.5} opacity={0.05}
        className="bg-wave-drift motion-reduce:animate-none"
        style={{ animationDuration: '26s' }}
      />
    </svg>
  )
}
