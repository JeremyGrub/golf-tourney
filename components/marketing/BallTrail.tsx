"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  /** "M … C … " path in a 100×100 viewBox, tuned per-segment */
  d: string;
  /** Height in vh units */
  heightVh?: number;
  /** Flip stroke opacity for darker backgrounds */
  onDark?: boolean;
};

export default function BallTrail({ d, heightVh = 28, onDark = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;

    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduce) return;

    const path = wrap.querySelector<SVGPathElement>("path.ball-path");
    const ball = wrap.querySelector<HTMLElement>(".ball");
    const shadow = wrap.querySelector<HTMLElement>(".ball-shadow");
    if (!path || !ball || !shadow) return;

    const ctx = gsap.context(() => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      const place = (progress: number) => {
        const pt = path.getPointAtLength(length * progress);
        // pt is in 0–100 / 0–100 SVG coords; translate to % of container.
        ball.style.left = `${pt.x}%`;
        ball.style.top = `${pt.y}%`;
        shadow.style.left = `${pt.x}%`;
        const grounded = 1 - Math.abs(0.5 - progress) * 2;
        shadow.style.opacity = `${0.08 + grounded * 0.22}`;
        shadow.style.transform = `translate(-50%, -50%) scaleX(${
          0.7 + grounded * 0.9
        })`;
      };
      place(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
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
    }, wrap);

    return () => ctx.revert();
  }, []);

  const stroke = onDark
    ? "rgba(255,225,200,0.7)"
    : "rgba(255,107,26,0.6)";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative hidden w-full md:block"
      style={{ height: `${heightVh}vh` }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path
          className="ball-path"
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth="0.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
        />
      </svg>
      <span
        className="ball-shadow absolute h-[6px] w-[14px] rounded-full bg-ink/40"
        style={{
          left: "0%",
          top: "100%",
          transform: "translate(-50%, 4px) scaleX(0.6)",
          filter: "blur(3px)",
          opacity: 0,
        }}
      />
      <span
        className="ball absolute block h-3.5 w-3.5 rounded-full bg-chalk shadow-[0_2px_4px_rgba(14,18,15,0.18),inset_-1px_-1px_0_rgba(14,18,15,0.08)] ring-1 ring-ink/15"
        style={{ left: "0%", top: "0%", transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
