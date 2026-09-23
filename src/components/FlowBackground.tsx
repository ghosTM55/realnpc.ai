"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import { initFlowBackground } from "@/lib/flowBackground";

const FlowPaused = createContext(false);

function FlowCanvas({ background = false }: { background?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowRef = useRef<ReturnType<typeof initFlowBackground>>(null);
  const paused = useContext(FlowPaused);
  const pathname = usePathname();

  useEffect(() => {
    if (!canvasRef.current) return;
    const coverEnd = background ? document.querySelector<HTMLElement>("[data-flow-cover-end]") : null;
    const flow = initFlowBackground(canvasRef.current, coverEnd);
    flowRef.current = flow;
    return () => {
      flow?.dispose();
      flowRef.current = null;
    };
  }, [background, pathname]);

  useEffect(() => {
    flowRef.current?.setPaused(paused);
  }, [paused, pathname]);

  return <canvas ref={canvasRef} />;
}

export function FlowSurface() {
  return <div className="flow-surface-background" aria-hidden="true"><FlowCanvas /></div>;
}

export default function FlowBackground({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);

  return (
    <FlowPaused.Provider value={paused}>
      <div className="site-flow-background" aria-hidden="true">
        <FlowCanvas background />
      </div>
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
