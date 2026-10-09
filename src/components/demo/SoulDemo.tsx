"use client";
import { useDemoDraft } from "@/components/configurator/draftStore";
import { SoulChat } from "@/components/configurator/SoulChat";
import "./soul-demo.css";

export default function SoulDemo() {
  const { draft, storageAvailable } = useDemoDraft();
  return <main data-flow-cover className="soul-demo">
    <SoulChat key={JSON.stringify(draft.config)} config={draft.config} storageAvailable={storageAvailable} />
  </main>;
}
