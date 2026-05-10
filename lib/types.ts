export interface OptimizeRequest {
  resumeText: string;
  targetRole: string;
  industry: string;
  experienceLevel: string;
  jobType: string;
  optimizeLevel: string;
}

export interface Problem {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface Suggestion {
  title: string;
  description: string;
  example: string;
}

export interface ATSKeywords {
  mustHave: string[];
  niceToHave: string[];
  missingKeywords: string[];
}

export interface ProjectExperienceItem {
  title: string;
  before: string;
  after: string;
  whyBetter: string;
}

export interface MatchAnalysis {
  targetRoleFit: string;
  industryFit: string;
  experienceFit: string;
}

export interface OptimizeResult {
  score: number;
  summary: string;
  matchAnalysis: MatchAnalysis;
  problems: Problem[];
  suggestions: Suggestion[];
  atsKeywords: ATSKeywords;
  rewrittenResume: string;
  projectExperience: ProjectExperienceItem[];
  personalStrengths: string[];
  interviewHighlights: string[];
  nextSteps: string[];
}

// Module A: Comparison-based optimization
export interface TextChange {
  type: 'added' | 'modified' | 'reordered';
  original: string;
  optimized: string;
  reason: string;
}

export interface SectionComparison {
  sectionTitle: string;
  originalText: string;
  optimizedText: string;
  changeRationale: string;
  changes: TextChange[];
}

export interface ComparisonResult {
  score: number;
  summary: string;
  matchAnalysis: MatchAnalysis;
  problems: Problem[];
  suggestions: Suggestion[];
  atsKeywords: ATSKeywords;
  comparisons: SectionComparison[];
  personalStrengths: string[];
  interviewHighlights: string[];
  nextSteps: string[];
}

// Module B: Per-field polish
export interface PolishRequest {
  fieldType: 'bullet' | 'description' | 'content' | 'title';
  rawText: string;
  context?: string;
  targetRole?: string;
}

export interface PolishResult {
  polishedText: string;
  improvements: string[];
}

export interface ApiSuccessResponse {
  success: true;
  data: OptimizeResult | ComparisonResult;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
