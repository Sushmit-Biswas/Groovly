"use client";

import clsx from "clsx";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

type CDSide = "left" | "right";

export type CDProps = {
  src: string;
  side?: CDSide; // kept for backwards compatibility but not used for positioning inside the component anymore
  size?: number;
  alt?: string;
};

export function CD({ src, side, size = 310, alt = "CD artwork" }: CDProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={clsx(
        "group relative rounded-full overflow-hidden",
        "transition-transform duration-500 ease-out hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]"
      )}
      style={{
        height: size,
        width: size,
      }}
    >
      {/* Spinning Container */}
      <div
        className={clsx(
          "absolute inset-0 rounded-full overflow-hidden",
          "bg-gradient-to-br from-[#111] via-[#181818] to-[#050505]",
          "shadow-[0_45px_120px_-30px_rgba(0,0,0,0.85)] ring-2 ring-white/20",
          !reducedMotion && "animate-[spin_20s_linear_infinite]"
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
          <div className="relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
             <div className="h-[25px] w-[25px] rounded-full bg-[#111] border border-black shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* CD Glare effect */}
        <div
          className={clsx(
            "pointer-events-none absolute inset-0 rounded-full",
            "bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_45deg,transparent_90deg,transparent_180deg,rgba(255,255,255,0.1)_225deg,transparent_270deg)]",
            "opacity-50 group-hover:opacity-80 transition-opacity duration-500"
          )}
        />
      </div>
    </div>
  );
}
