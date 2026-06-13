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
    title: "Vibe together",
    bg: "bg-gradient-to-br from-purple-900 to-black",
    image: "/assets/cd1.jpg",
  },
  {
    title: "Democratic voting",
    bg: "bg-gradient-to-br from-pink-900 to-black",
    image: "/assets/cd2.jpg",
  },
  {
    title: "Zero latency",
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

      // Apply SplitText to headings if available from CDN
      const SplitText = (window as any).SplitText;
      let splitHeadings: any[] = [];
      if (SplitText) {
        splitHeadings = headings.map(heading => {
          return new SplitText(heading, { type: 'chars,words,lines', linesClass: 'clip-text' });
        });
      }

      // Add overflow hidden to lines to create the slice effect
      gsap.set(".clip-text", { overflow: "hidden" });

      let currentIndex = -1;
      const wrap = gsap.utils.wrap(0, sections.length);
      let animating = false;
      let autoPlayTimer: ReturnType<typeof setTimeout>;

      gsap.set(outerWrappers, { yPercent: 100 });
      gsap.set(innerWrappers, { yPercent: -100 });

      function startAutoPlay() {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = setTimeout(() => {
          if (!animating) gotoSection(currentIndex + 1, 1);
        }, 4000);
      }

      function gotoSection(index: number, direction: number) {
        index = wrap(index);
        animating = true;
        clearTimeout(autoPlayTimer);
        const fromTop = direction === -1;
        const dFactor = fromTop ? -1 : 1;

        const tl = gsap.timeline({
          defaults: { duration: 1.25, ease: "power1.inOut" },
          onComplete: () => {
            animating = false;
            startAutoPlay();
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
          );

        // Animate the characters instead of the whole heading
        if (splitHeadings[index]) {
          const chars = splitHeadings[index].chars;
          if (chars && chars.length > 0) {
            tl.fromTo(
              chars,
              { autoAlpha: 0, yPercent: 150 * dFactor },
              {
                autoAlpha: 1,
                yPercent: 0,
                duration: 1,
                ease: "power2",
                stagger: {
                  each: 0.02,
                  from: "random",
                },
              },
              0.2
            );
          }
        }

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
        clearTimeout(autoPlayTimer);
        if (SplitText) {
          splitHeadings.forEach(split => split.revert());
        }
      };
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div
      ref={containerRef}
      className="relative h-[80vh] w-full overflow-hidden bg-black gs_reveal my-12"
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
                <h2 
                  className="continuous-heading text-[clamp(2rem,6vw,8rem)] font-[600] leading-[1.2] text-center w-[90vw] max-w-[1200px] normal-case text-white drop-shadow-2xl"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  {slide.title}
                </h2>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
