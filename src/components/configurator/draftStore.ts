"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_DRAFT, type DemoDraft, normalizeDemoDraft, parseDemoDraft } from "@/domain/companion/draft";

const STORAGE_KEY = "realnpc:companion-demo:v1";
const serverSnapshot = { draft: DEFAULT_DRAFT, storageAvailable: true };
let snapshot = serverSnapshot;
let loaded = false;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (!loaded) {
    loaded = true;
    try {
      snapshot = {
        draft: parseDemoDraft(window.sessionStorage.getItem(STORAGE_KEY)),
        storageAvailable: true,
      };
    } catch {
      snapshot = { draft: DEFAULT_DRAFT, storageAvailable: false };
    }
  }
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateDemoDraft(update: (draft: DemoDraft) => DemoDraft) {
  // Memory and storage hold the same validated value, so a refresh never
  // restores something different from what was on screen.
  const draft = normalizeDemoDraft(update(getSnapshot().draft));
  let storageAvailable = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    storageAvailable = false;
  }
  snapshot = { draft, storageAvailable };
  listeners.forEach((listener) => listener());
}

export function useDemoDraft() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
