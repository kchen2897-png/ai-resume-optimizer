'use client';

import { useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Blocks } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import ResumeBlockCard from './ResumeBlockCard';

export default function EditorCanvas({ targetRole = '' }: { targetRole?: string }) {
  const { state, dispatch } = useEditor();
  const { modules, selectedModuleId } = state.document;

  const sorted = modules.slice().sort((a, b) => a.order - b.order);
  const ids = useMemo(() => sorted.map((m) => m.id), [sorted]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch({ type: 'REORDER_MODULES', activeId: String(active.id), overId: String(over.id) });
    }
  }

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mx-auto">
            <Blocks className="h-8 w-8 text-gray-300" />
          </div>
          <p className="mt-4 text-sm text-gray-400">暂无简历模块</p>
          <p className="mt-1 text-xs text-gray-300">请先上传简历文件，或手动添加模块</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-canvas-bg flex-1 overflow-y-auto p-4 lg:p-6" onClick={(e) => { if (e.target === e.currentTarget) dispatch({ type: 'SELECT_MODULE', id: null }); }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="mx-auto max-w-2xl space-y-3">
            {sorted.map((mod) => (
              <ResumeBlockCard key={mod.id} module={mod} isSelected={selectedModuleId === mod.id} targetRole={targetRole} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
