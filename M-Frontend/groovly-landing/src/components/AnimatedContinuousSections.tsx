"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

const slides = [
  {
    title: "Vibe Together",
    subtitle: "Real-time sync",
    bg: "bg-gradient-to-br from-purple-900 to-black",
    image: "/assets/cd1.jpg",
  },
  {
    title: "Democratic Voting",
    subtitle: "The crowd decides",
    bg: "bg-gradient-to-br from-pink-900 to-black",
    image: "/assets/cd2.jpg",
  },
  {
    title: "Zero Latency",
    subtitle: "Perfectly timed playback",
    bg: "bg-gradient-to-br from-orange-900 to-black",
    image: "/assets/cd4.jpeg",
  },
];

export function AnimatedContinuousSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const sections = gsap.utils.toArray<HTMLElement>(".continuous-section");
      const images = gsap.utils.toArray<HTMLElement>(".continuous-bg");
      const headings = gsap.utils.toArray<HTMLElement>(".continuous-heading");
      const outerWrappers = gsap.utils.toArray<HTMLElement>(".continuous-outer");
      const innerWrappers = gsap.utils.toArray<HTMLElement>(".continuous-inner");

      let currentIndex = -1;
      const wrap = gsap.utils.wrap(0, sections.length);
      let animating = false;

      gsap.set(outerWrappers, { yPercent: 100 });
      gsap.set(innerWrappers, { yPercent: -100 });

      function gotoSection(index: number, direction: number) {
        index = wrap(index);
        animating = true;
        const fromTop = direction === -1;
        const dFactor = fromTop ? -1 : 1;

        const tl = gsap.timeline({
          defaults: { duration: 1.25, ease: "power1.inOut" },
          onComplete: () => {
            animating = false;
          },
        });

        if (currentIndex >= 0) {
          gsap.set(sections[currentIndex], { zIndex: 0 });
          tl.to(images[currentIndex], { yPercent: -15 * dFactor }).set(
            sections[currentIndex],
            { autoAlpha: 0 }
          );
        }

        gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });

        tl.fromTo(
          [outerWrappers[index], innerWrappers[index]],
          {
            yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor),
          },
          {
            yPercent: 0,
          },
          0
        )
          .fromTo(
            images[index],
            { yPercent: 15 * dFactor },
            { yPercent: 0 },
            0
          )
          .fromTo(
            headings[index],
            { autoAlpha: 0, yPercent: 150 * dFactor },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 1,
              ease: "power2",
            },
            0.2
          );

        currentIndex = index;
      }

      // Initial section
      gotoSection(0, 1);

      // Create an Observer that only prevents default when hovering over this specific section
      const observer = Observer.create({
        target: container,
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onDown: () => !animating && gotoSection(currentIndex - 1, -1),
        onUp: () => !animating && gotoSection(currentIndex + 1, 1),
        tolerance: 10,
        preventDefault: true, // Prevents page scrolling while hovering over this component
      });

      return () => {
        observer.kill();
      };
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black gs_reveal"
    >
      {slides.map((slide, i) => (
        <section
          key={i}
          className="continuous-section absolute inset-0 invisible"
        >
          <div className="continuous-outer absolute inset-0 w-full h-full overflow-hidden">
            <div className="continuous-inner absolute inset-0 w-full h-full overflow-hidden">
              <div
                className={clsx(
                  "continuous-bg absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center",
                  slide.bg
                )}
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${slide.image})`,
                }}
              >
                <h2 className="continuous-heading text-6xl md:text-8xl font-black text-white text-center tracking-tighter drop-shadow-2xl uppercase">
                  {slide.title}
                </h2>
                <p className="continuous-heading mt-6 text-xl md:text-3xl text-white/80 font-medium tracking-wide">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
