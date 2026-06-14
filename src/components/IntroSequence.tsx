"use client";

import { useRef } from "react";
import AssemblyStage from "@/components/AssemblyStage";
import Hero from "@/components/Hero";
import { gsap, useGSAP } from "@/lib/gsap";

export default function IntroSequence() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-intro-assembly]", {
          autoAlpha: 0.01,
          pointerEvents: "none",
          zIndex: 30,
        });
        gsap.set("[data-intro-hero]", {
          pointerEvents: "auto",
          zIndex: 20,
        });
        // Hero (closed eye) starts in crisp focus.
        gsap.set("[data-intro-hero] [data-hero-background]", {
          filter: "blur(0px) brightness(1) saturate(1)",
          transformOrigin: "50% 50%",
        });
        // Stage (open eye + parts) starts heavily defocused and dimmed —
        // the lens then racks into focus as the page scrolls.
        gsap.set("[data-intro-assembly] [data-stage-background]", {
          scale: 1.06,
          filter: "blur(26px) brightness(0.72) saturate(0.94)",
          transformOrigin: "50% 50%",
        });
        gsap.set("[data-intro-assembly] [data-assembly-overlay]", {
          autoAlpha: 0,
          y: 12,
        });
        gsap.set("[data-intro-assembly] [data-hotspot-marker]", {
          autoAlpha: 0,
        });
        // Variant B cross-fades the two frames instead of flashing white.
        gsap.set("[data-focus-wash]", {
          autoAlpha: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
          },
        });

        tl
          // Hero copy lifts away first.
          .to(
            "[data-intro-hero] [data-hero-copy]",
            {
              autoAlpha: 0,
              y: -42,
              duration: 0.3,
              ease: "power3.out",
            },
            0,
          )
          // Hero frame softens and eases back — the lens leaving the closed eye.
          .to(
            "[data-intro-hero] [data-hero-background]",
            {
              scale: 1.04,
              filter: "blur(10px) brightness(1.06) saturate(0.96)",
              duration: 0.55,
              ease: "none",
            },
            0,
          )
          // Stage cross-fades in over the hero — no flash.
          .to(
            "[data-intro-assembly]",
            {
              autoAlpha: 1,
              duration: 0.4,
              ease: "none",
            },
            0.1,
          )
          // Core rack-focus: blur tightens, exposure lifts, push-in settles.
          .to(
            "[data-intro-assembly] [data-stage-background]",
            {
              scale: 1,
              filter: "blur(0px) brightness(1.05) saturate(1)",
              duration: 0.5,
              ease: "power2.out",
            },
            0.16,
          )
          // Auto-exposure settles back to neutral once locked.
          .to(
            "[data-intro-assembly] [data-stage-background]",
            {
              filter: "blur(0px) brightness(1) saturate(1)",
              duration: 0.16,
              ease: "none",
            },
            0.66,
          )
          // Hero fully clears once the stage carries the frame.
          .to(
            "[data-intro-hero]",
            {
              autoAlpha: 0,
              duration: 0.24,
              ease: "none",
            },
            0.4,
          )
          // Parts panel locks in after focus lands.
          .to(
            "[data-intro-assembly] [data-assembly-overlay]",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.22,
              ease: "power2.out",
            },
            0.6,
          )
          // Hotspot markers acquire one after another, like HUD locks.
          .to(
            "[data-intro-assembly] [data-hotspot-marker]",
            {
              autoAlpha: 1,
              duration: 0.2,
              stagger: 0.05,
              ease: "power2.out",
            },
            0.62,
          )
          .set(
            "[data-intro-assembly]",
            {
              pointerEvents: "auto",
              zIndex: 30,
            },
            0.68,
          )
          .set(
            "[data-intro-hero]",
            {
              pointerEvents: "none",
            },
            0.68,
          )
          .to({}, { duration: 0.4, ease: "none" }, 0.82);
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative h-[240vh] bg-paper motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-screen overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div
          data-intro-hero
          className="absolute inset-0 z-20 motion-reduce:relative motion-reduce:z-auto"
        >
          <Hero />
        </div>
        <div
          data-focus-wash
          className="pointer-events-none absolute inset-0 z-40 bg-white opacity-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 54%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.9) 34%, rgba(239,250,253,0.76) 62%, rgba(255,255,255,0.42) 100%)",
          }}
          aria-hidden
        />
        <div
          data-intro-assembly
          className="absolute inset-0 z-10 motion-reduce:relative motion-reduce:z-auto"
        >
          <AssemblyStage />
        </div>
      </div>
    </section>
  );
}
