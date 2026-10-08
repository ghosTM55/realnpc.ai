import { createFlowField, type FlowMessage, type FrameScheduler } from "./flowField.ts";

// Worker frames follow the placeholder canvas where supported; a timer covers the rest.
const frames: FrameScheduler = typeof requestAnimationFrame === "function"
  ? { request: (callback) => requestAnimationFrame(callback), cancel: (id) => cancelAnimationFrame(id) }
  : { request: (callback) => self.setTimeout(() => callback(performance.now()), 1000 / 60), cancel: (id) => clearTimeout(id) };

let field: ReturnType<typeof createFlowField> | null = null;

addEventListener("message", ({ data }: MessageEvent<FlowMessage>) => {
  switch (data.type) {
    case "init": {
      const context = data.canvas.getContext("2d");
      if (!context) throw new Error("Flow worker could not create a 2D context");
      field = createFlowField(context, data.line, frames);
      self.postMessage({ type: "ready" });
      break;
    }
    case "size":
      field?.resize(data.size);
      break;
    case "state":
      field?.update(data.state);
      break;
  }
});
