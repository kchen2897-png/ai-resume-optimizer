import type { OptimizeResult } from "./types";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  targetRole: string;
  resumeSnippet: string;
  result: OptimizeResult;
}

type ModuleKey = 'optimizer' | 'builder';

function getStorageKey(module: ModuleKey): string {
  return `resume-${module}-history`;
}

const MAX_ENTRIES = 3;

export function getHistory(module: ModuleKey = 'optimizer'): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(module));
    if (!raw) {
      // Migrate old key
      const old = localStorage.getItem('resume-optimizer-history');
      if (old && module === 'optimizer') return JSON.parse(old) as HistoryEntry[];
      return [];
    }
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(
  targetRole: string,
  resumeText: string,
  result: OptimizeResult,
  module: ModuleKey = 'optimizer'
): HistoryEntry[] {
  const entries = getHistory(module);
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    targetRole,
    resumeSnippet: resumeText.slice(0, 120).replace(/\n/g, " "),
    result,
  };
  entries.unshift(entry);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(getStorageKey(module), JSON.stringify(trimmed));
  } catch {
    try {
      localStorage.setItem(getStorageKey(module), JSON.stringify(trimmed.slice(0, -1)));
    } catch { /* give up */ }
  }
  return trimmed;
}

export function deleteHistoryEntry(id: string, module: ModuleKey = 'optimizer'): HistoryEntry[] {
  const entries = getHistory(module).filter((e) => e.id !== id);
  localStorage.setItem(getStorageKey(module), JSON.stringify(entries));
  return entries;
}
