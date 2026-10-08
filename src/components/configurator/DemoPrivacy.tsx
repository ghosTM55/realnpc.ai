"use client";

import { useState } from "react";
import { LockKeyhole, RotateCcw } from "lucide-react";
import type { DemoDraft } from "@/domain/companion/draft";
import { clearDemoDraft, updateDemoDraft, useDemoDraft } from "./draftStore";
import { focusFlowHeading } from "./FlowUI";

export function DemoPrivacy() {
  const { draft, storageAvailable } = useDemoDraft();
  const [undo, setUndo] = useState<DemoDraft | null>(null);
  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-5 sm:flex-row">
      <details className="max-w-[70ch] text-xs leading-relaxed text-steel">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-ink">
          <LockKeyhole size={14} />
          {storageAvailable
            ? "Demo choices stay in this tab"
            : "Browser storage unavailable"}
        </summary>
        <p className="pb-3">
          {storageAvailable
            ? "Only preset choices are saved for this browser session. No dialogue is stored or submitted. Memory settings are a preview, not a connected service."
            : "You can still finish and download your preview. Choices are kept in page memory, so a full reload or a new tab will reset them."}
        </p>
      </details>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-steel hover:text-ink"
          onClick={() => {
            setUndo(draft);
            clearDemoDraft();
            focusFlowHeading();
          }}
        >
          <RotateCcw size={14} />
          Reset demo
        </button>
        {undo && (
          <button
            type="button"
            className="min-h-11 text-xs font-semibold text-soul-ink underline"
            onClick={() => {
              updateDemoDraft(() => undo);
              setUndo(null);
              focusFlowHeading();
            }}
          >
            Undo reset
          </button>
        )}
      </div>
    </div>
  );
}
