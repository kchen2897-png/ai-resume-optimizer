/**
 * Shared header content parser.
 * Extracts name and contacts from header module content.
 * Used by both ResumePreview.tsx and resume-pdf-html.ts.
 */

export interface ParsedHeader {
  name: string;
  contacts: string[];
}

export function parseHeader(content: string): ParsedHeader {
  if (!content.trim()) return { name: "", contacts: [] };

  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "";
  const rawContacts: string[] = [];
  const labelRe = /(电话|手机|邮箱|城市|地点|Email|Tel|Phone|Base|毕业院校|学历|民族|政治|出生)/;

  for (const line of lines) {
    const hasLabel = labelRe.test(line);
    const isContact =
      hasLabel ||
      line.includes("@") ||
      /^1\d{10}$/.test(line) ||
      /\+?\d[\d\s-]{6,}/.test(line);

    if (!name && !isContact && line.length <= 20) {
      name = line;
    } else if (isContact) {
      rawContacts.push(line);
    } else if (!name) {
      name = line;
    } else {
      rawContacts.push(line);
    }
  }

  // Remove name prefix from contact lines if duplicated
  const contacts = name
    ? rawContacts
        .map((c) => {
          if (c === name) return "";
          if (c.startsWith(name + " ") || c.startsWith(name + "|")) {
            return c.slice(name.length).replace(/^\s*\|\s*/, "");
          }
          return c;
        })
        .filter(Boolean)
    : rawContacts;

  return { name, contacts };
}

/**
 * HTML-safe escaping for text content.
 */
export function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * HTML-safe escaping for attribute values.
 */
export function escAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
