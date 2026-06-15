// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

let _nid = 0;
function nanoid(): string {
  return `${Date.now().toString(36)}${(_nid++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ═══════════════════════════════════════════════════════
// Structured items
// ═══════════════════════════════════════════════════════

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa: string;
  courses: string;
  awards: string;
  bulletPoints: string[];
}

export function emptyEducationItem(): EducationItem {
  return { id: nanoid(), school: '', major: '', degree: '', startDate: '', endDate: '', gpa: '', courses: '', awards: '', bulletPoints: [] };
}

export interface ExperienceItem {
  id: string;
  organization: string;
  department: string;
  role: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export function emptyExperienceItem(): ExperienceItem {
  return { id: nanoid(), organization: '', department: '', role: '', startDate: '', endDate: '', bulletPoints: [] };
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export function emptyProjectItem(): ProjectItem {
  return { id: nanoid(), name: '', role: '', startDate: '', endDate: '', bulletPoints: [] };
}

export interface SkillItem {
  id: string;
  name: string;
}

export function emptySkillItem(): SkillItem {
  return { id: nanoid(), name: '' };
}

// ═══════════════════════════════════════════════════════
// Block styles (unchanged)
// ═══════════════════════════════════════════════════════

export interface BlockStyles {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
  lineHeight: number;
  itemSpacing: number;
  titleFontSize: number;
}

export const DEFAULT_BLOCK_STYLES: BlockStyles = {
  fontFamily: 'Inter',
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#1f2937',
  textAlign: 'left',
  paddingTop: 8,
  paddingBottom: 8,
  lineHeight: 1.6,
  itemSpacing: 8,
  titleFontSize: 17,
};

export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (无衬线)', category: 'sans-serif' },
  { value: 'Georgia', label: 'Georgia (衬线)', category: 'serif' },
  { value: 'Monaco', label: 'Monaco (等宽)', category: 'monospace' },
  { value: 'Microsoft YaHei', label: '微软雅黑', category: 'sans-serif' },
  { value: 'SimSun', label: '宋体', category: 'serif' },
];

export const FONT_SIZE_OPTIONS = [10, 11, 12, 13, 14, 16, 18, 20, 24];

export const COLOR_SWATCHES = [
  '#1f2937', '#374151', '#4b5563', '#6b7280',
  '#5c7cfa', '#2563eb', '#1d4ed8',
  '#059669', '#16a34a',
  '#dc2626', '#ea580c',
];

// ═══════════════════════════════════════════════════════
// Module types
// ═══════════════════════════════════════════════════════

export type ModuleType =
  | 'header'
  | 'education'
  | 'workExperience'
  | 'internshipExperience'
  | 'campusExperience'
  | 'projectExperience'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'custom';

interface BaseModule {
  id: string;
  type: ModuleType;
  title: string;
  styles: BlockStyles;
  order: number;
  isCollapsed: boolean;
}

export interface HeaderModule extends BaseModule { type: 'header'; content: string; photo?: string; }
export interface EducationModule extends BaseModule { type: 'education'; items: EducationItem[]; }
export interface WorkExperienceModule extends BaseModule { type: 'workExperience'; items: ExperienceItem[]; }
export interface InternshipExperienceModule extends BaseModule { type: 'internshipExperience'; items: ExperienceItem[]; }
export interface CampusExperienceModule extends BaseModule { type: 'campusExperience'; items: ExperienceItem[]; }
export interface ProjectExperienceModule extends BaseModule { type: 'projectExperience'; items: ProjectItem[]; }
export interface SkillsModule extends BaseModule { type: 'skills'; items: SkillItem[]; }
export interface CertificationsModule extends BaseModule { type: 'certifications'; items: SkillItem[]; }
export interface LanguagesModule extends BaseModule { type: 'languages'; items: SkillItem[]; }
export interface CustomModule extends BaseModule { type: 'custom'; content: string; }

export type ResumeModule =
  | HeaderModule | EducationModule
  | WorkExperienceModule | InternshipExperienceModule | CampusExperienceModule
  | ProjectExperienceModule
  | SkillsModule | CertificationsModule | LanguagesModule
  | CustomModule;

export const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  header: '头部信息',
  education: '教育背景',
  workExperience: '工作经历',
  internshipExperience: '实习经历',
  campusExperience: '学生组织经历',
  projectExperience: '项目经历',
  skills: '专业技能',
  certifications: '证书资质',
  languages: '语言能力',
  custom: '自定义模块',
};

export const MODULE_ICONS: Record<ModuleType, string> = {
  header: 'User2', education: 'GraduationCap',
  workExperience: 'Briefcase', internshipExperience: 'Briefcase', campusExperience: 'Briefcase',
  projectExperience: 'FolderGit2',
  skills: 'Code2', certifications: 'Award', languages: 'Languages', custom: 'Blocks',
};

/** Whether a module type uses grid layout (ExperienceHeader rows) */
export function isGridModule(type: ModuleType): boolean {
  return type === 'education' || type === 'workExperience' || type === 'internshipExperience'
    || type === 'campusExperience' || type === 'projectExperience';
}

/** Whether a module type uses bullet-point rendering */
export function isBulletModule(type: ModuleType): boolean {
  return isGridModule(type) || type === 'skills' || type === 'certifications' || type === 'languages' || type === 'custom';
}

export function createModule(type: ModuleType, order: number): ResumeModule {
  const id = nanoid();
  const base = { id, title: MODULE_TYPE_LABELS[type], styles: { ...DEFAULT_BLOCK_STYLES }, order, isCollapsed: false };
  switch (type) {
    case 'header': return { ...base, type: 'header', content: '', photo: '', styles: { ...DEFAULT_BLOCK_STYLES, fontSize: 18, paddingTop: 2, paddingBottom: 6, itemSpacing: 0 } };
    case 'education': return { ...base, type: 'education', items: [] };
    case 'workExperience': case 'internshipExperience': case 'campusExperience':
      return { ...base, type, items: [] } as any;
    case 'projectExperience': return { ...base, type: 'projectExperience', items: [] };
    case 'skills': case 'certifications': case 'languages':
      return { ...base, type, items: [] } as any;
    case 'custom': return { ...base, type: 'custom', content: '' };
  }
}

// ═══════════════════════════════════════════════════════
// Document + Actions
// ═══════════════════════════════════════════════════════

export interface ResumeDocument {
  modules: ResumeModule[];
  mode: 'pre-optimize' | 'post-optimize';
  selectedModuleId: string | null;
  fileName: string | null;
}

export type EditorAction =
  | { type: 'LOAD_MODULES'; modules: ResumeModule[]; fileName?: string | null; mode?: 'pre-optimize' | 'post-optimize'; _internal?: boolean }
  | { type: 'SET_MODE'; mode: 'pre-optimize' | 'post-optimize' }
  | { type: 'UPDATE_MODULE_TITLE'; id: string; title: string }
  | { type: 'UPDATE_MODULE_STYLES'; id: string; styles: Partial<BlockStyles> }
  | { type: 'UPDATE_HEADER_CONTENT'; id: string; content: string }
  | { type: 'UPDATE_HEADER_PHOTO'; id: string; photo: string }
  | { type: 'UPDATE_CUSTOM_CONTENT'; id: string; content: string }
  | { type: 'ADD_EDUCATION_ITEM'; moduleId: string; item: EducationItem }
  | { type: 'UPDATE_EDUCATION_ITEM'; moduleId: string; item: EducationItem }
  | { type: 'REMOVE_EDUCATION_ITEM'; moduleId: string; itemId: string }
  | { type: 'ADD_EXPERIENCE_ITEM'; moduleId: string; item: ExperienceItem }
  | { type: 'UPDATE_EXPERIENCE_ITEM'; moduleId: string; item: ExperienceItem }
  | { type: 'REMOVE_EXPERIENCE_ITEM'; moduleId: string; itemId: string }
  | { type: 'ADD_PROJECT_ITEM'; moduleId: string; item: ProjectItem }
  | { type: 'UPDATE_PROJECT_ITEM'; moduleId: string; item: ProjectItem }
  | { type: 'REMOVE_PROJECT_ITEM'; moduleId: string; itemId: string }
  | { type: 'ADD_SKILL_ITEM'; moduleId: string; item: SkillItem }
  | { type: 'UPDATE_SKILL_ITEM'; moduleId: string; item: SkillItem }
  | { type: 'REMOVE_SKILL_ITEM'; moduleId: string; itemId: string }
  | { type: 'ADD_BULLET'; moduleId: string; itemId: string }
  | { type: 'UPDATE_BULLET'; moduleId: string; itemId: string; index: number; text: string }
  | { type: 'REMOVE_BULLET'; moduleId: string; itemId: string; index: number }
  | { type: 'REORDER_MODULES'; activeId: string; overId: string }
  | { type: 'ADD_MODULE'; moduleType: ModuleType; afterId?: string }
  | { type: 'REMOVE_MODULE'; id: string }
  | { type: 'SELECT_MODULE'; id: string | null }
  | { type: 'TOGGLE_COLLAPSE'; id: string }
  | { type: 'RESET' };

export interface EditorState {
  document: ResumeDocument;
  history: ResumeDocument[];
  historyIndex: number;
}

