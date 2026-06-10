"use client";

import clsx from "clsx";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

type CDSide = "left" | "right";

export type CDProps = {
  src: string;
  side?: CDSide;
  size?: number;
  alt?: string;
};

export function CD({ src, side, size = 310, alt = "CD artwork" }: CDProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={clsx(
        "group relative rounded-full overflow-hidden pointer-events-auto cursor-pointer",
        "transition-all duration-700 ease-out",
        "hover:scale-110 hover:shadow-[0_0_60px_rgba(168,85,247,0.5),0_0_120px_rgba(168,85,247,0.2)]"
      )}
      style={{
        height: size,
        width: size,
      }}
    >
      {/* Spinning Container — uses CSS custom property for smooth speed transition */}
      <div
        className={clsx(
          "absolute inset-0 rounded-full overflow-hidden cd-spin-container",
          "bg-gradient-to-br from-[#111] via-[#181818] to-[#050505]",
          "shadow-[0_45px_120px_-30px_rgba(0,0,0,0.85)] ring-2 ring-white/20",
          "group-hover:ring-purple-500/40",
          !reducedMotion && "animate-[spin_20s_linear_infinite] group-hover:[animation-duration:6s]"
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

        {/* Additional hover glow ring */}
        <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.15),transparent_70%)]" />
      </div>
    </div>
  );
}
