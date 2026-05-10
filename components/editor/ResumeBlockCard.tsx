'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight, Trash2, Pencil, Plus, X, Camera, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/EditorContext';
import type { ResumeModule, BlockStyles, EducationItem, ExperienceItem, ProjectItem, SkillItem } from '@/lib/editor-types';
import { emptyEducationItem, emptyExperienceItem, emptyProjectItem, emptySkillItem } from '@/lib/editor-types';
import BlockStyleBar from './BlockStyleBar';
import AIPolishButton from '@/components/builder/AIPolishButton';

interface Props {
  module: ResumeModule;
  isSelected: boolean;
  targetRole?: string;
}

const TYPE_COLORS: Record<string, string> = {
  header: 'bg-purple-100 text-purple-700 border-purple-200',
  education: 'bg-amber-100 text-amber-700 border-amber-200',
  workExperience: 'bg-blue-100 text-blue-700 border-blue-200',
  internshipExperience: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  campusExperience: 'bg-teal-100 text-teal-700 border-teal-200',
  projectExperience: 'bg-orange-100 text-orange-700 border-orange-200',
  skills: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  certifications: 'bg-pink-100 text-pink-700 border-pink-200',
  languages: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  custom: 'bg-gray-100 text-gray-600 border-gray-200',
};

const inputCls = 'w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-brand-400 bg-white';
const labelCls = 'text-[11px] font-medium text-gray-400 mb-0.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className={labelCls}>{label}</span>{children}</label>;
}

export default function ResumeBlockCard({ module: mod, isSelected, targetRole = '' }: Props) {
  const { dispatch } = useEditor();
  const [showStyleBar, setShowStyleBar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(mod.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id });

  function handleStyleChange(styles: Partial<BlockStyles>) {
    dispatch({ type: 'UPDATE_MODULE_STYLES', id: mod.id, styles });
  }

  function handleSelect() { dispatch({ type: 'SELECT_MODULE', id: mod.id }); }

  function handleRemove() {
    if (confirmDelete) { dispatch({ type: 'REMOVE_MODULE', id: mod.id }); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
  }

  function handleTitleSave() {
    const t = titleDraft.trim();
    if (t && t !== mod.title) dispatch({ type: 'UPDATE_MODULE_TITLE', id: mod.id, title: t });
    setEditingTitle(false);
  }

  const badgeColor = TYPE_COLORS[mod.type] ?? TYPE_COLORS.custom;

  const renderContent = () => {
    switch (mod.type) {
      case 'header':
        return <HeaderEditor moduleId={mod.id} content={mod.content} photo={(mod as any).photo || ''} targetRole={targetRole} />;

      case 'education':
        return <EducationEditor moduleId={mod.id} items={mod.items} targetRole={targetRole} />;

      case 'workExperience':
      case 'internshipExperience':
      case 'campusExperience':
        return <ExperienceEditor moduleId={mod.id} items={mod.items} targetRole={targetRole} />;

      case 'projectExperience':
        return <ProjectEditor moduleId={mod.id} items={mod.items} targetRole={targetRole} />;

      case 'skills':
      case 'certifications':
      case 'languages':
        return <SkillsEditor moduleId={mod.id} items={mod.items} />;

      case 'custom':
        return (
          <div className="space-y-2">
            <textarea
              value={mod.content}
              onChange={(e) => dispatch({ type: 'UPDATE_CUSTOM_CONTENT', id: mod.id, content: e.target.value })}
              placeholder="自定义内容..."
              rows={4}
              className={cn(inputCls, 'resize-y')}
            />
            <AIPolishButton rawText={mod.content} fieldType="content" context="简历自定义模块" targetRole={targetRole} onApply={(text) => dispatch({ type: 'UPDATE_CUSTOM_CONTENT', id: mod.id, content: text })} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'resume-block-card group relative rounded-2xl bg-white border transition-all duration-200',
        isDragging && 'drag-overlay opacity-90 shadow-2xl',
        isSelected && 'selected border-brand-400 shadow-md ring-1 ring-brand-500/20',
        !isSelected && !isDragging && 'border-gray-100 shadow-sm hover:border-gray-200',
      )}
      onClick={handleSelect}
      onMouseEnter={() => setShowStyleBar(true)}
      onMouseLeave={() => setShowStyleBar(false)}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <button {...attributes} {...listeners} className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100 touch-none">
          <GripVertical className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
        </button>

        {editingTitle ? (
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
            onClick={(e) => e.stopPropagation()}
            className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium outline-none ring-1 ring-brand-400', badgeColor)}
            autoFocus
          />
        ) : (
          <span onClick={(e) => { e.stopPropagation(); setTitleDraft(mod.title); setEditingTitle(true); }}
            className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium cursor-pointer hover:ring-1 hover:ring-brand-300', badgeColor)}>
            {mod.title} <Pencil className="h-3 w-3 opacity-40" />
          </span>
        )}

        <div className="flex-1" />
        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_COLLAPSE', id: mod.id }); }}
          className="p-1 rounded hover:bg-gray-100 text-gray-400">
          {mod.isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className={cn('p-1 rounded', confirmDelete ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-500')}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {!mod.isCollapsed && (
        <div className="px-5 pb-4 space-y-3">
          {renderContent()}
        </div>
      )}

      {mod.isCollapsed && <div className="px-5 pb-3 text-xs text-gray-400 truncate">{mod.title}（已折叠）</div>}

      {/* Style bar */}
      {!mod.isCollapsed && (
        <div className={cn('block-style-bar px-4 pb-3 transition-all duration-150', (showStyleBar || isSelected) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none')}
          onClick={(e) => e.stopPropagation()}>
          <BlockStyleBar styles={mod.styles} onChange={handleStyleChange} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════ Sub-editors ═══════════════════

function parseHeaderContent(content: string) {
  const lines = content.split('\n').filter(Boolean);
  let name = '', phone = '', email = '', city = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Extract labeled fields (may appear on same line separated by |)
    const phoneMatch = trimmed.match(/(?:电话|手机|Tel|Phone)[：:\s]*(\+?\d[\d\s-]{6,})/i);
    const emailMatch = trimmed.match(/(?:邮箱|Email|E-mail)[：:\s]*([\w.+-]+@[\w-]+\.[\w.-]+)/i);
    const cityMatch = trimmed.match(/(?:城市|地点|所在地|Base)[：:\s]*(.+)/i);

    if (phoneMatch) phone = phoneMatch[1].trim();
    if (emailMatch) email = emailMatch[1].trim();
    if (cityMatch) city = cityMatch[1].trim();

    // Name detection: first line without label chars, or first segment before |
    const hasLabel = /(电话|手机|邮箱|城市|地点|Email|Tel|Phone|Base|毕业院校|学历|民族|政治|出生)/.test(trimmed);
    if (!name && !hasLabel) {
      // Take first meaningful segment (before | separator)
      const firstSegment = trimmed.split(/\s*\|\s*/)[0].trim();
      if (firstSegment.length >= 2 && firstSegment.length <= 10) {
        name = firstSegment;
      } else if (trimmed.length <= 20) {
        name = trimmed;
      }
    }
  }

  return { name, phone, email, city };
}

function composeHeaderContent(fields: { name: string; phone: string; email: string; city: string }): string {
  const parts: string[] = [];
  if (fields.name) parts.push(fields.name);
  if (fields.phone) parts.push(`电话：${fields.phone}`);
  if (fields.email) parts.push(`邮箱：${fields.email}`);
  if (fields.city) parts.push(`城市：${fields.city}`);
  return parts.join('\n');
}

function HeaderEditor({ moduleId, content, photo, targetRole = '' }: { moduleId: string; content: string; photo: string; targetRole?: string }) {
  const { dispatch } = useEditor();
  const { name, phone, email, city } = parseHeaderContent(content);
  const [fields, setFields] = useState({ name, phone, email, city });
  const [showRaw, setShowRaw] = useState(false);
  const [dragOverPhoto, setDragOverPhoto] = useState(false);

  // Sync fields when content changes externally (e.g. AI polish, import from optimizer)
  useEffect(() => {
    const parsed = parseHeaderContent(content);
    setFields({ name: parsed.name, phone: parsed.phone, email: parsed.email, city: parsed.city });
  }, [content]);

  function updateField(key: string, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    dispatch({ type: 'UPDATE_HEADER_CONTENT', id: moduleId, content: composeHeaderContent(next) });
  }

  function handlePhotoFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'UPDATE_HEADER_PHOTO', id: moduleId, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOverPhoto(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  }

  function removePhoto() {
    dispatch({ type: 'UPDATE_HEADER_PHOTO', id: moduleId, photo: '' });
  }

  if (showRaw) {
    return (
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => dispatch({ type: 'UPDATE_HEADER_CONTENT', id: moduleId, content: e.target.value })}
          placeholder="姓名、电话、邮箱…"
          rows={3}
          className={cn(inputCls, 'resize-y')}
        />
        <button onClick={() => setShowRaw(false)} className="text-xs text-gray-400 hover:text-brand-600">切换到结构化填写</button>
        <AIPolishButton rawText={content} fieldType="content" context="简历头部信息" targetRole={targetRole} onApply={(text) => dispatch({ type: 'UPDATE_HEADER_CONTENT', id: moduleId, content: text })} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {/* Fields */}
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="姓名">
              <input className={inputCls} value={fields.name} onChange={(e) => updateField('name', e.target.value)} placeholder="张三" />
            </Field>
            <Field label="电话">
              <input className={inputCls} value={fields.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="13800138000" />
            </Field>
            <Field label="邮箱">
              <input className={inputCls} value={fields.email} onChange={(e) => updateField('email', e.target.value)} placeholder="zhangsan@example.com" />
            </Field>
            <Field label="城市">
              <input className={inputCls} value={fields.city} onChange={(e) => updateField('city', e.target.value)} placeholder="北京 / 上海…" />
            </Field>
          </div>
        </div>

        {/* Photo */}
        <div className="flex-shrink-0">
          <p className={labelCls}>证件照</p>
          {photo ? (
            <div className="relative group">
              <img src={photo} alt="证件照" className="w-20 h-[27mm] object-cover rounded border border-gray-200" />
              <button
                onClick={removePhoto}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label
              className={cn(
                'flex h-[27mm] w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed transition-colors',
                dragOverPhoto ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-300 hover:bg-brand-50/30',
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverPhoto(true); }}
              onDragLeave={() => setDragOverPhoto(false)}
              onDrop={handlePhotoDrop}
            >
              <Camera className="h-5 w-5 text-gray-300" />
              <span className="text-[9px] text-gray-400 text-center leading-tight">点击{'\n'}上传</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f); e.target.value = ''; }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setShowRaw(true)} className="text-xs text-gray-400 hover:text-brand-600">自由格式编辑</button>
        <AIPolishButton rawText={content} fieldType="content" context="简历头部信息：姓名+联系方式" targetRole={targetRole} onApply={(text) => dispatch({ type: 'UPDATE_HEADER_CONTENT', id: moduleId, content: text })} />
      </div>
    </div>
  );
}

function EducationEditor({ moduleId, items, targetRole = '' }: { moduleId: string; items: EducationItem[]; targetRole?: string }) {
  const { dispatch } = useEditor();

  function add() {
    dispatch({ type: 'ADD_EDUCATION_ITEM', moduleId, item: emptyEducationItem() });
  }

  function update(item: EducationItem) {
    dispatch({ type: 'UPDATE_EDUCATION_ITEM', moduleId, item });
  }

  function remove(itemId: string) {
    dispatch({ type: 'REMOVE_EDUCATION_ITEM', moduleId, itemId });
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">教育经历</span>
            <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="学校名称"><input className={inputCls} value={item.school} onChange={(e) => update({ ...item, school: e.target.value })} placeholder="云南财经大学" /></Field>
            <Field label="专业"><input className={inputCls} value={item.major} onChange={(e) => update({ ...item, major: e.target.value })} placeholder="新闻学" /></Field>
            <Field label="学历"><input className={inputCls} value={item.degree} onChange={(e) => update({ ...item, degree: e.target.value })} placeholder="本科" /></Field>
            <div className="flex gap-2">
              <Field label="开始"><input className={inputCls} value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="2021.09" /></Field>
              <Field label="结束"><input className={inputCls} value={item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="2025.06" /></Field>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="GPA"><input className={inputCls} value={item.gpa} onChange={(e) => update({ ...item, gpa: e.target.value })} placeholder="3.3/4" /></Field>
            <Field label="核心课程"><input className={inputCls} value={item.courses} onChange={(e) => update({ ...item, courses: e.target.value })} placeholder="新闻采访、传播心理学..." /></Field>
            <Field label="获奖"><input className={inputCls} value={item.awards} onChange={(e) => update({ ...item, awards: e.target.value })} placeholder="职业规划大赛二等奖" /></Field>
          </div>
          <BulletEditor moduleId={moduleId} itemId={item.id} bullets={item.bulletPoints} targetRole={targetRole} />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
        <Plus className="h-3.5 w-3.5" />添加教育经历
      </button>
    </div>
  );
}

function ExperienceEditor({ moduleId, items, targetRole = '' }: { moduleId: string; items: ExperienceItem[]; targetRole?: string }) {
  const { dispatch } = useEditor();

  function add() {
    dispatch({ type: 'ADD_EXPERIENCE_ITEM', moduleId, item: emptyExperienceItem() });
  }

  function update(item: ExperienceItem) {
    dispatch({ type: 'UPDATE_EXPERIENCE_ITEM', moduleId, item });
  }

  function remove(itemId: string) {
    dispatch({ type: 'REMOVE_EXPERIENCE_ITEM', moduleId, itemId });
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">经历条目</span>
            <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="公司/组织名称"><input className={inputCls} value={item.organization} onChange={(e) => update({ ...item, organization: e.target.value })} placeholder="腾讯科技" /></Field>
            <Field label="部门"><input className={inputCls} value={item.department} onChange={(e) => update({ ...item, department: e.target.value })} placeholder="技术研发部" /></Field>
            <Field label="职位"><input className={inputCls} value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder="后端开发工程师" /></Field>
            <div className="flex gap-2">
              <Field label="开始"><input className={inputCls} value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="2024.01" /></Field>
              <Field label="结束"><input className={inputCls} value={item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="至今" /></Field>
            </div>
          </div>
          <BulletEditor moduleId={moduleId} itemId={item.id} bullets={item.bulletPoints} targetRole={targetRole} />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
        <Plus className="h-3.5 w-3.5" />添加经历
      </button>
    </div>
  );
}

function ProjectEditor({ moduleId, items, targetRole = '' }: { moduleId: string; items: ProjectItem[]; targetRole?: string }) {
  const { dispatch } = useEditor();

  function add() {
    dispatch({ type: 'ADD_PROJECT_ITEM', moduleId, item: emptyProjectItem() });
  }

  function update(item: ProjectItem) {
    dispatch({ type: 'UPDATE_PROJECT_ITEM', moduleId, item });
  }

  function remove(itemId: string) {
    dispatch({ type: 'REMOVE_PROJECT_ITEM', moduleId, itemId });
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">项目条目</span>
            <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="项目名称"><input className={inputCls} value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="微信支付重构" /></Field>
            <Field label="角色"><input className={inputCls} value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder="后端负责人" /></Field>
            <div className="flex gap-2">
              <Field label="开始"><input className={inputCls} value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="2024.01" /></Field>
              <Field label="结束"><input className={inputCls} value={item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="2024.06" /></Field>
            </div>
          </div>
          <BulletEditor moduleId={moduleId} itemId={item.id} bullets={item.bulletPoints} targetRole={targetRole} />
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
        <Plus className="h-3.5 w-3.5" />添加项目
      </button>
    </div>
  );
}

function SkillsEditor({ moduleId, items }: { moduleId: string; items: SkillItem[] }) {
  const { dispatch } = useEditor();

  function add() {
    dispatch({ type: 'ADD_SKILL_ITEM', moduleId, item: emptySkillItem() });
  }

  function update(item: SkillItem) {
    dispatch({ type: 'UPDATE_SKILL_ITEM', moduleId, item });
  }

  function remove(itemId: string) {
    dispatch({ type: 'REMOVE_SKILL_ITEM', moduleId, itemId });
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            className={cn(inputCls, 'flex-1')}
            value={item.name}
            onChange={(e) => update({ ...item, name: e.target.value })}
            placeholder="技能名称"
          />
          <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
        <Plus className="h-3.5 w-3.5" />添加技能
      </button>
    </div>
  );
}

function BulletEditor({ moduleId, itemId, bullets, targetRole = '' }: { moduleId: string; itemId: string; bullets: string[]; targetRole?: string }) {
  const { dispatch } = useEditor();

  function add() {
    dispatch({ type: 'ADD_BULLET', moduleId, itemId });
  }

  function update(index: number, text: string) {
    dispatch({ type: 'UPDATE_BULLET', moduleId, itemId, index, text });
  }

  function remove(index: number) {
    dispatch({ type: 'REMOVE_BULLET', moduleId, itemId, index });
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-gray-400">要点描述 (bullet points)</p>
      {bullets.map((b, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 text-xs">•</span>
            <input className={cn(inputCls, 'flex-1')} value={b} onChange={(e) => update(i, e.target.value)} placeholder="描述具体工作内容或成果..." />
            <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400"><X className="h-3 w-3" /></button>
          </div>
          {b.trim() && (
            <div className="ml-4">
              <AIPolishButton rawText={b} fieldType="bullet" context="简历要点描述" targetRole={targetRole} onApply={(text) => update(i, text)} />
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700">
        <Plus className="h-3 w-3" />添加要点
      </button>
    </div>
  );
}
