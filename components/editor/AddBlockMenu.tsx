'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, User2, GraduationCap, Briefcase, FolderGit2, Code2, Award, Languages, Blocks } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';
import type { ModuleType } from '@/lib/editor-types';

const OPTIONS: { type: ModuleType; label: string; icon: typeof Plus; desc: string }[] = [
  { type: 'header', label: '头部信息', icon: User2, desc: '姓名、联系方式' },
  { type: 'education', label: '教育背景', icon: GraduationCap, desc: '学校、专业、学历' },
  { type: 'workExperience', label: '工作经历', icon: Briefcase, desc: '全职工作经历' },
  { type: 'internshipExperience', label: '实习经历', icon: Briefcase, desc: '实习工作经历' },
  { type: 'campusExperience', label: '学生组织经历', icon: Briefcase, desc: '学生会、社团等' },
  { type: 'projectExperience', label: '项目经历', icon: FolderGit2, desc: '项目名称、角色、成果' },
  { type: 'skills', label: '专业技能', icon: Code2, desc: '技能列表' },
  { type: 'certifications', label: '证书资质', icon: Award, desc: '证书、获奖、荣誉' },
  { type: 'languages', label: '语言能力', icon: Languages, desc: '语言等级、外语水平' },
  { type: 'custom', label: '自定义模块', icon: Blocks, desc: '自由添加内容' },
];

export default function AddBlockMenu() {
  const { dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false); };
    if (open) { document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn); }
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
        <Plus className="h-4 w-4" />添加模块
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-lg z-50 py-1 animate-fade-in max-h-80 overflow-y-auto">
          {OPTIONS.map((opt) => (
            <button key={opt.type} onClick={() => { dispatch({ type: 'ADD_MODULE', moduleType: opt.type }); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
              <opt.icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div><p className="font-medium">{opt.label}</p><p className="text-xs text-gray-400">{opt.desc}</p></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
