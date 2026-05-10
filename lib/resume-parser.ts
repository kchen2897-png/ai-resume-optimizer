import type { ResumeModule, ModuleType, EducationItem, ExperienceItem, ProjectItem } from './editor-types';
import { createModule, emptyEducationItem, emptyExperienceItem, emptyProjectItem } from './editor-types';

const DATE_RE = /(\d{4}[.\-/年]\d{1,2}[.\-/月]?\s*[-–—至到]\s*(至今|现在|\d{4}[.\-/年]\d{1,2}[.\-/月]?))/;

function detectDate(line: string): { date: string; rest: string } | null {
  const m = line.match(DATE_RE);
  if (!m || line.length > 200) return null;
  return { date: m[0].trim(), rest: line.replace(m[0], '').replace(/\s+/g, ' ').trim() };
}

function guessType(line: string): ModuleType | null {
  const t = line.replace(/[#【\[\]（）()\s]/g, '');
  if (/^(姓名|电话|手机|邮箱|性别|年龄|籍贯|地址|微信|LinkedIn|个人网站)/.test(line)) return 'header';
  if (/教育/.test(t) || /学历/.test(t) || /学习经历/.test(t)) return 'education';
  if (/工作经历/.test(t) || /职业经历/.test(t) || /从业经历/.test(t)) return 'workExperience';
  if (/实习/.test(t)) return 'internshipExperience';
  if (/学生组织/.test(t) || /校园/.test(t) || /社团/.test(t)) return 'campusExperience';
  if (/项目/.test(t) || /作品/.test(t)) return 'projectExperience';
  if (/技能/.test(t) || /技术栈/.test(t) || /擅长/.test(t) || /专业.*能力/.test(t)) return 'skills';
  if (/证书/.test(t) || /资质/.test(t) || /认证/.test(t)) return 'certifications';
  if (/获奖/.test(t) || /荣誉/.test(t)) return 'certifications';
  if (/语言/.test(t) || /外语/.test(t) || /英语/.test(t)) return 'languages';
  return null;
}

export function parseResumeToModules(rawText: string): ResumeModule[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\n/).map((l) => l.trim());
  const modules: ResumeModule[] = [];
  let current: ResumeModule | null = null;
  let currentItems: (EducationItem | ExperienceItem | ProjectItem)[] = [];
  let pendingBullets: string[] = [];
  let order = 0;

  function flushModule() {
    if (!current) return;
    const t = current.type;
    if (t === 'education' && currentItems.length > 0) {
      (current as any).items = currentItems;
    } else if ((t === 'workExperience' || t === 'internshipExperience' || t === 'campusExperience') && currentItems.length > 0) {
      (current as any).items = currentItems;
    } else if (t === 'projectExperience' && currentItems.length > 0) {
      (current as any).items = currentItems;
    } else if ((t === 'skills' || t === 'certifications' || t === 'languages') && pendingBullets.length > 0) {
      // Split comma-separated text into individual skill items
      const names = pendingBullets.join(' ').split(/[,，、\s]+/).filter(Boolean);
      (current as any).items = names.map((name: string) => ({ id: Math.random().toString(36).slice(2, 10), name }));
    } else if (t === 'custom' && pendingBullets.length > 0) {
      (current as any).content = pendingBullets.join('\n');
    }
    modules.push(current);
    currentItems = [];
    pendingBullets = [];
    current = null;
  }

  // Collect header lines (first few lines without section headers or dates)
  let headerLines: string[] = [];
  let i = 0;
  while (i < Math.min(lines.length, 5)) {
    const line = lines[i];
    if (line && line.length < 80 && !line.match(DATE_RE) && !guessType(line)) {
      headerLines.push(line);
      i++;
    } else { break; }
  }
  if (headerLines.length > 0) {
    const h = createModule('header', order++);
    (h as any).content = headerLines.join('\n');
    modules.push(h);
  }

  // Process remaining lines
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const guessed = guessType(line);

    if (guessed) {
      flushModule();
      if (guessed === 'header') {
        const h = createModule('header', order++);
        (h as any).content = line.replace(/^[#【\[\]（）()\s]+/, '').trim();
        modules.push(h);
      } else {
        current = createModule(guessed, order++);
        current.title = line.replace(/[#【\[\]（）()\s]+/g, ' ').trim().slice(0, 20) || current.title;
      }
      continue;
    }

    // Date line → new item
    const dateInfo = detectDate(line);
    const isExpType = current && (current.type === 'workExperience' || current.type === 'internshipExperience' || current.type === 'campusExperience');

    if (dateInfo && current && (current.type === 'education' || isExpType || current.type === 'projectExperience')) {
      if (currentItems.length > 0 && pendingBullets.length > 0) {
        (currentItems[currentItems.length - 1] as any).bulletPoints = pendingBullets;
        pendingBullets = [];
      }

      const parts = dateInfo.rest.split(/\s+/);
      const dates = dateInfo.date.split(/[-–—至到]/).map((d) => d.trim());

      if (current.type === 'education') {
        const item = emptyEducationItem();
        item.school = parts[0] || '';
        item.major = parts[1] || '';
        item.degree = parts[2] || '';
        item.startDate = dates[0] || '';
        item.endDate = dates[1] || '';
        currentItems.push(item);
      } else if (isExpType) {
        const item = emptyExperienceItem();
        item.organization = parts[0] || '';
        item.department = parts[1] || '';
        item.role = parts.slice(2).join(' ') || '';
        item.startDate = dates[0] || '';
        item.endDate = dates[1] || '';
        currentItems.push(item);
      } else if (current.type === 'projectExperience') {
        const item = emptyProjectItem();
        item.name = parts[0] || '';
        item.role = parts.slice(1).join(' ') || '';
        item.startDate = dates[0] || '';
        item.endDate = dates[1] || '';
        currentItems.push(item);
      }
      continue;
    }

    // Bullet / continuation
    const clean = line.replace(/^[-•·]\s*/, '');
    if (current) pendingBullets.push(clean);
  }

  // Attach last bullets
  if (current && currentItems.length > 0 && pendingBullets.length > 0) {
    const lastItem = currentItems[currentItems.length - 1] as any;
    if (lastItem) lastItem.bulletPoints = pendingBullets;
    pendingBullets = [];
  }
  flushModule();

  if (modules.length === 0) {
    const c = createModule('custom', 0);
    (c as any).content = rawText.trim();
    modules.push(c);
  }
  return modules;
}
