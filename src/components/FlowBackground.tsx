"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { initFlowBackground } from "@/lib/flowBackground";

const FlowPaused = createContext(false);

function FlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowRef = useRef<ReturnType<typeof initFlowBackground>>(null);
  const paused = useContext(FlowPaused);

  useEffect(() => {
    if (!canvasRef.current) return;
    const flow = initFlowBackground(canvasRef.current);
    flowRef.current = flow;
    return () => {
      flow?.dispose();
      flowRef.current = null;
    };
  }, []);

  useEffect(() => {
    flowRef.current?.setPaused(paused);
  }, [paused]);

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
        <FlowCanvas />
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
