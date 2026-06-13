"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type CDSide = "left" | "right";

export type CDProps = {
  src: string;
  side?: CDSide;
  size?: number;
  alt?: string;
};

export function CD({ src, side, size = 310, alt = "CD artwork" }: CDProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    const spinEl = spinContainerRef.current;
    if (!el || !spinEl) return;

    // Continuous spin animation
    const spinAnimation = gsap.to(spinEl, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none",
    });

    const xTo = gsap.quickTo(el, "rotationY", { ease: "power3", duration: 0.6 });
    const yTo = gsap.quickTo(el, "rotationX", { ease: "power3", duration: 0.6 });
    const scaleTo = gsap.quickTo(el, "scale", { ease: "power3", duration: 0.4 });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      
      const xPos = (relX / rect.width - 0.5) * 40; // max rotation 20deg
      const yPos = (relY / rect.height - 0.5) * -40;

      xTo(xPos);
      yTo(yPos);
    };

    const handleMouseEnter = () => {
      scaleTo(1.15);
      gsap.to(el, { boxShadow: "0px 20px 50px rgba(168, 85, 247, 0.6), 0px 0px 100px rgba(168, 85, 247, 0.3)", duration: 0.4, ease: "power3" });
      gsap.to(spinAnimation, { timeScale: 3.33, duration: 0.5 }); // 20s -> 6s is roughly 3.33x speed
      el.addEventListener("mousemove", handleMouseMove);
    };

    const handleMouseLeave = () => {
      el.removeEventListener("mousemove", handleMouseMove);
      xTo(0);
      yTo(0);
      scaleTo(1);
      gsap.to(el, { boxShadow: "none", duration: 0.4, ease: "power3" });
      gsap.to(spinAnimation, { timeScale: 1, duration: 0.5 });
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, { scope: containerRef, dependencies: [] });

  return (
    <div
      ref={containerRef}
      className={clsx(
        "group relative rounded-full overflow-hidden pointer-events-auto cursor-pointer",
      )}
      style={{
        height: size,
        width: size,
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Spinning Container */}
      <div
        ref={spinContainerRef}
        className={clsx(
          "absolute inset-0 rounded-full overflow-hidden cd-spin-container",
          "bg-gradient-to-br from-[#111] via-[#181818] to-[#050505]",
          "ring-2 ring-white/20 group-hover:ring-purple-500/40 transition-colors duration-500"
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={100}
          sizes={`${size}px`}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Center Hole / CD Hub */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:border-purple-400/40 transition-colors duration-500">
             <div className="h-[25px] w-[25px] rounded-full bg-[#111] border border-black shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* CD Glare effect */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-full",
            "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_45deg,transparent_90deg,transparent_180deg,rgba(255,255,255,0.1)_225deg,transparent_270deg)]",
            "opacity-50 group-hover:opacity-100 transition-opacity duration-500"
          )}
        />
      </div>
    </div>
  );
}
