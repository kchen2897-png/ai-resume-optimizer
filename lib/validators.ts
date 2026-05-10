import { OptimizeRequest } from "./types";

export function validateRequest(body: OptimizeRequest): string | null {
  const { resumeText, targetRole } = body;

  if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
    return "简历内容不能为空";
  }

  const trimmed = resumeText.trim();

  if (trimmed.length < 50) {
    return `简历内容至少需要 50 个字，当前 ${trimmed.length} 个字`;
  }

  if (trimmed.length > 12000) {
    return `简历内容不能超过 12000 字，当前 ${trimmed.length} 个字`;
  }

  if (!targetRole || typeof targetRole !== "string" || !targetRole.trim()) {
    return "目标岗位不能为空";
  }

  return null;
}
