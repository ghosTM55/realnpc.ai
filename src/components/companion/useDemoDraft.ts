"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_DRAFT,
  parseDemoDraft,
  serializeDemoDraft,
  type DemoDraft,
} from "@/lib/companion";

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
  const draft = update(getSnapshot().draft);
  let storageAvailable = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, serializeDemoDraft(draft));
  } catch {
    storageAvailable = false;
  }
  snapshot = { draft, storageAvailable };
  listeners.forEach((listener) => listener());
}

export function clearDemoDraft() {
  let storageAvailable = true;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    storageAvailable = false;
  }
  snapshot = { draft: DEFAULT_DRAFT, storageAvailable };
  listeners.forEach((listener) => listener());
}

export function useDemoDraft() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
