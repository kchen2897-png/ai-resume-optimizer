'use client';

import { createContext, useContext, useReducer, useCallback, useRef, useEffect, useState, type ReactNode } from 'react';
import type {
  ResumeDocument, EditorAction, EditorState, ResumeModule, ModuleType,
  BlockStyles,
} from '@/lib/editor-types';
import { DEFAULT_BLOCK_STYLES, createModule } from '@/lib/editor-types';

const MAX_HISTORY = 50;
const AUTOSAVE_KEY = 'resume-builder-autosave';

function loadAutosave(): ResumeModule[] | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {}
  return null;
}

function saveAutosave(modules: ResumeModule[]) {
  try {
    if (modules.length > 0) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(modules));
    } else {
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  } catch {}
}

function createInitialDocument(): ResumeDocument {
  return { modules: [], mode: 'pre-optimize', selectedModuleId: null, fileName: null };
}

function createInitialState(): EditorState {
  return { document: createInitialDocument(), history: [], future: [] };
}

function pushHistory(state: EditorState): EditorState {
  const history = [...state.history, structuredClone(state.document)].slice(-MAX_HISTORY);
  return { ...state, history, future: [] };
}

function recomputeOrders(mods: ResumeModule[]): ResumeModule[] {
  return mods.map((m, i) => ({ ...m, order: i }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function updateModuleItem(state: EditorState, moduleId: string, itemId: string, update: (item: any) => any, replaceItems: (m: any, items: any[]) => any): EditorState {
  const ns = pushHistory(state);
  return {
    ...ns,
    document: {
      ...ns.document,
      modules: ns.document.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const items: any[] = (m as any).items;
        if (!items) return m;
        return replaceItems(m, items.map((it: any) => it.id === itemId ? update(it) : it));
      }),
    },
  };
}
/* eslint-enable */

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {

    case 'LOAD_MODULES': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: action.modules, mode: action.mode ?? 'pre-optimize', fileName: action.fileName ?? null, selectedModuleId: null } };
    }

    case 'RESTORE_AUTOSAVE':
      return {
        ...state,
        document: { ...state.document, modules: action.modules, selectedModuleId: null },
        history: [],
        future: [],
      };

    case 'SET_MODE':
      return { ...state, document: { ...state.document, mode: action.mode } };

    case 'UPDATE_MODULE_TITLE': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.id ? { ...m, title: action.title } as ResumeModule : m) } };
    }

    case 'UPDATE_MODULE_STYLES': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.id ? { ...m, styles: { ...m.styles, ...action.styles } } as ResumeModule : m) } };
    }

    case 'UPDATE_HEADER_CONTENT': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.id && m.type === 'header' ? { ...m, content: action.content } : m) } };
    }

    case 'UPDATE_HEADER_PHOTO': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.id && m.type === 'header' ? { ...m, photo: action.photo } : m) } };
    }

    case 'UPDATE_CUSTOM_CONTENT': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.id && m.type === 'custom' ? { ...m, content: action.content } : m) } };
    }

    case 'ADD_EDUCATION_ITEM': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && m.type === 'education' ? { ...m, items: [...m.items, action.item] } : m) } };
    }
    case 'UPDATE_EDUCATION_ITEM':
      return updateModuleItem(state, action.moduleId, action.item.id, () => action.item, (m, items) => ({ ...m, items }));
    case 'REMOVE_EDUCATION_ITEM': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && m.type === 'education' ? { ...m, items: m.items.filter((it) => it.id !== action.itemId) } : m) } };
    }

    case 'ADD_EXPERIENCE_ITEM': {
      const ns = pushHistory(state);
      const isExp = (t: string) => t === 'workExperience' || t === 'internshipExperience' || t === 'campusExperience';
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && isExp(m.type) ? { ...m, items: [...(m as any).items, action.item] } : m) } };
    }
    case 'UPDATE_EXPERIENCE_ITEM':
      return updateModuleItem(state, action.moduleId, action.item.id, () => action.item, (m, items) => ({ ...m, items }));
    case 'REMOVE_EXPERIENCE_ITEM': {
      const ns = pushHistory(state);
      const isExpR = (t: string) => t === 'workExperience' || t === 'internshipExperience' || t === 'campusExperience';
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && isExpR(m.type) ? { ...m, items: (m as any).items.filter((it: any) => it.id !== action.itemId) } : m) } };
    }

    case 'ADD_PROJECT_ITEM': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && m.type === 'projectExperience' ? { ...m, items: [...(m as any).items, action.item] } : m) } };
    }
    case 'UPDATE_PROJECT_ITEM':
      return updateModuleItem(state, action.moduleId, action.item.id, () => action.item, (m, items) => ({ ...m, items }));
    case 'REMOVE_PROJECT_ITEM': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && m.type === 'projectExperience' ? { ...m, items: (m as any).items.filter((it: any) => it.id !== action.itemId) } : m) } };
    }

    case 'ADD_SKILL_ITEM': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId && (m.type === 'skills' || m.type === 'certifications' || m.type === 'languages') ? { ...m, items: [...(m as any).items, action.item] } : m) } };
    }
    case 'UPDATE_SKILL_ITEM':
      return updateModuleItem(state, action.moduleId, action.item.id, () => action.item, (m, items) => ({ ...m, items }));
    case 'REMOVE_SKILL_ITEM': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId ? { ...m, items: (m as any).items?.filter((it: any) => it.id !== action.itemId) ?? [] } : m) } };
    }

    case 'MOVE_MODULE_ITEM': {
      const currentModule = state.document.modules.find((m) => m.id === action.moduleId);
      if (!currentModule || !('items' in currentModule)) return state;

      const currentIndex = currentModule.items.findIndex((item) => item.id === action.itemId);
      const targetIndex = currentIndex + action.direction;
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= currentModule.items.length) return state;

      const ns = pushHistory(state);
      return {
        ...ns,
        document: {
          ...ns.document,
          modules: ns.document.modules.map((module) => {
            if (module.id !== action.moduleId || !('items' in module)) return module;
            const items: Array<{ id: string }> = [...module.items];
            const [movedItem] = items.splice(currentIndex, 1);
            items.splice(targetIndex, 0, movedItem);
            return { ...module, items } as ResumeModule;
          }),
        },
      };
    }

    case 'ADD_BULLET': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId ? { ...m, items: (m as any).items?.map((it: any) => it.id === action.itemId ? { ...it, bulletPoints: [...(it.bulletPoints || []), ''] } : it) ?? [] } : m) } };
    }
    case 'UPDATE_BULLET': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId ? { ...m, items: (m as any).items?.map((it: any) => it.id === action.itemId ? { ...it, bulletPoints: (it.bulletPoints || []).map((b: string, i: number) => i === action.index ? action.text : b) } : it) ?? [] } : m) } };
    }
    case 'REMOVE_BULLET': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: ns.document.modules.map((m) => m.id === action.moduleId ? { ...m, items: (m as any).items?.map((it: any) => it.id === action.itemId ? { ...it, bulletPoints: (it.bulletPoints || []).filter((_: string, i: number) => i !== action.index) } : it) ?? [] } : m) } };
    }

    case 'REORDER_MODULES': {
      const mods = state.document.modules;
      const oi = mods.findIndex((m) => m.id === action.activeId);
      const ni = mods.findIndex((m) => m.id === action.overId);
      if (oi === -1 || ni === -1 || oi === ni) return state;
      const ns = pushHistory(state);
      const reordered = [...ns.document.modules];
      const [rem] = reordered.splice(oi, 1);
      reordered.splice(ni, 0, rem);
      return { ...ns, document: { ...ns.document, modules: recomputeOrders(reordered) } };
    }

    case 'ADD_MODULE': {
      const ns = pushHistory(state);
      const m = createModule(action.moduleType, 0);
      const mods = [...ns.document.modules];
      if (action.afterId) {
        const idx = mods.findIndex((x) => x.id === action.afterId);
        mods.splice(idx + 1, 0, m);
      } else { mods.push(m); }
      return { ...ns, document: { ...ns.document, modules: recomputeOrders(mods), selectedModuleId: m.id } };
    }

    case 'REMOVE_MODULE': {
      const ns = pushHistory(state);
      return { ...ns, document: { ...ns.document, modules: recomputeOrders(ns.document.modules.filter((m) => m.id !== action.id)), selectedModuleId: ns.document.selectedModuleId === action.id ? null : ns.document.selectedModuleId } };
    }

    case 'SELECT_MODULE':
      return { ...state, document: { ...state.document, selectedModuleId: action.id } };

    case 'TOGGLE_COLLAPSE':
      return { ...state, document: { ...state.document, modules: state.document.modules.map((m) => m.id === action.id ? { ...m, isCollapsed: !m.isCollapsed } as ResumeModule : m) } };

    case 'UNDO': {
      const previous = state.history.at(-1);
      if (!previous) return state;
      return {
        document: structuredClone(previous),
        history: state.history.slice(0, -1),
        future: [structuredClone(state.document), ...state.future].slice(0, MAX_HISTORY),
      };
    }

    case 'REDO': {
      const [next, ...remainingFuture] = state.future;
      if (!next) return state;
      return {
        document: structuredClone(next),
        history: [...state.history, structuredClone(state.document)].slice(-MAX_HISTORY),
        future: remainingFuture,
      };
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSavedData: boolean;
  clearSavedData: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialState);
  const [hasSavedData, setHasSavedData] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;

  useEffect(() => {
    const saved = loadAutosave();
    if (!saved) return;
    dispatch({ type: 'RESTORE_AUTOSAVE', modules: saved });
    setHasSavedData(true);
  }, []);

  // Auto-save modules to localStorage (debounced 800ms)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveAutosave(state.document.modules);
      setHasSavedData(state.document.modules.length > 0);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.document.modules]);

  const undo = useCallback(() => {
    if (canUndo) dispatch({ type: 'UNDO' });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) dispatch({ type: 'REDO' });
  }, [canRedo]);

  const clearSavedData = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setHasSavedData(false);
  }, []);

  return (
    <EditorContext.Provider value={{ state, dispatch, undo, redo, canUndo, canRedo, hasSavedData, clearSavedData }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}
