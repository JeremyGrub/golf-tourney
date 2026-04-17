"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The narrative:
//   ball tees off top-left, arcs over the dark green,
//   lands in the cup that sits just above the CTA button,
//   settles with a little hop, a ring ripples out.
//
// Laid out inside a 100×100 viewBox; the parent container
// positions and sizes it via absolute positioning.

// Cup sits at the bullseye of the topography rings in ClosingCTA
// (topo SVG stretched via preserveAspectRatio="none", cx=900/1200, cy=520/600).
const CUP = { cx: 75, cy: 86 };
const ARC_D = "M 4 8 C 22 -4, 52 2, 62 34 S 76 76, 75 86";

export default function CupFinale() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const path = wrap.querySelector<SVGPathElement>("path.ball-path");
    const ball = wrap.querySelector<HTMLElement>(".finale-ball");
    const shadow = wrap.querySelector<HTMLElement>(".finale-shadow");
    const flag = wrap.querySelector<SVGElement>(".finale-flag");
    if (!path || !ball || !shadow || !flag) return;

    const ctx = gsap.context(() => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      const place = (progress: number) => {
        const pt = path.getPointAtLength(length * progress);
        ball.style.left = `${pt.x}%`;
        ball.style.top = `${pt.y}%`;
        shadow.style.left = `${pt.x}%`;
        const grounded = 1 - Math.abs(0.5 - progress) * 2;
        shadow.style.opacity = `${0.1 + grounded * 0.3}`;
        shadow.style.transform = `translate(-50%, -50%) scaleX(${
          0.7 + grounded * 1
        })`;
      };
      place(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      tl.to(path, { strokeDashoffset: 0, ease: "none" }, 0);
      tl.to(
        { v: 0 },
        {
          v: 1,
          duration: 1,
          ease: "none",
          onUpdate: function () {
            place(this.progress());
          },
        },
        0
      );
      // Flag plants itself as the ball drops in.
      gsap.set(flag, { xPercent: -50, yPercent: -100 });
      tl.fromTo(
        flag,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.15 },
        0.88
      );
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          className="ball-path"
          d={ARC_D}
          fill="none"
          stroke="rgba(255,107,26,0.6)"
          strokeWidth="0.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
        />
      </svg>

      {/* Cup: a darker patch + inner lip suggesting a hole */}
      <span
        className="absolute block h-4 w-7 rounded-full bg-[#0B1C14] ring-1 ring-ink/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{
          left: `${CUP.cx}%`,
          top: `${CUP.cy}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Inner shadow suggesting depth */}
      <span
        className="absolute block h-3 w-5 rounded-full bg-[#050C09]"
        style={{
          left: `${CUP.cx}%`,
          top: `${CUP.cy}%`,
          transform: "translate(-50%, -40%)",
        }}
      />

      {/* Flag — pole centered in its viewBox so it plants in the cup.
          GSAP sets xPercent/yPercent so it owns the transform. */}
      <svg
        className="finale-flag absolute"
        viewBox="0 0 40 70"
        preserveAspectRatio="xMidYMax meet"
        style={{
          left: `${CUP.cx}%`,
          top: `${CUP.cy}%`,
          width: "3%",
          height: "12%",
          opacity: 0,
        }}
      >
        <line x1="20" y1="2" x2="20" y2="70" stroke="#EFEBDD" strokeWidth="1.5" />
        <path d="M 21 6 L 36 13 L 21 22 Z" fill="#FF6B1A" />
      </svg>

      {/* Ball shadow */}
      <span
        className="finale-shadow absolute h-[8px] w-[18px] rounded-full bg-ink/50"
        style={{
          left: "0%",
          top: `${CUP.cy}%`,
          transform: "translate(-50%, -50%) scaleX(0.6)",
          filter: "blur(4px)",
          opacity: 0,
        }}
      />

      {/* The ball itself */}
      <span
        className="finale-ball absolute block h-4 w-4 rounded-full bg-chalk shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_-1px_-1px_0_rgba(14,18,15,0.12)] ring-1 ring-ink/20"
        style={{ left: "0%", top: "0%", transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
