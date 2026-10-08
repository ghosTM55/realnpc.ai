"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import { initFlowBackground } from "@/lib/flowBackground";

const FlowPaused = createContext(false);

function FlowCanvas({ className, background = false }: { className: string; background?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReturnType<typeof initFlowBackground>>(null);
  const paused = useContext(FlowPaused);
  const pathname = usePathname();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // A fresh canvas per mount: a canvas can hand its drawing to a worker only once.
    const canvas = host.appendChild(document.createElement("canvas"));
    const flow = initFlowBackground(canvas, { occludable: background });
    flowRef.current = flow;
    return () => {
      flow?.dispose();
      flowRef.current = null;
      host.replaceChildren();
    };
  }, [background]);

  useEffect(() => {
    flowRef.current?.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    flowRef.current?.refreshCovers();
  }, [pathname]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}

export function FlowSurface() {
  return <FlowCanvas className="flow-surface-background" />;
}

export default function FlowBackground({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);

  return (
    <FlowPaused.Provider value={paused}>
      <FlowCanvas className="site-flow-background" background />
      {children}
      <button
        type="button"
        className="flow-motion-control motion-reduce:hidden"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Resume background animation" : "Pause background animation"}
        title={paused ? "Resume background animation" : "Pause background animation"}
      >
        {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
      </button>
    </FlowPaused.Provider>
  );
}
