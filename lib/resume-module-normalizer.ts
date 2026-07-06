import { DEFAULT_BLOCK_STYLES } from "@/lib/editor-types";
import type { ResumeModule } from "@/lib/editor-types";

let idCounter = 0;

function createId(): string {
  return `${Date.now().toString(36)}${(idCounter++).toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function hydrateModules(raw: unknown[]): ResumeModule[] {
  return raw.map((moduleValue, index) => {
    const moduleRecord = moduleValue as Record<string, any>;
    const items =
      moduleRecord.items?.map((item: Record<string, any>) => ({
        ...item,
        id: item.id || createId(),
        bulletPoints: (item.bulletPoints || []).map((bullet: unknown) =>
          typeof bullet === "string" ? bullet : (bullet as { text?: string })?.text || ""
        ),
      })) ?? [];

    const styles = { ...DEFAULT_BLOCK_STYLES, ...moduleRecord.styles };
    if (styles.titleFontSize == null) {
      styles.titleFontSize = styles.fontSize + 3;
    }

    if (moduleRecord.type === "header") {
      styles.fontSize = moduleRecord.styles?.fontSize ?? 18;
      styles.titleFontSize = moduleRecord.styles?.titleFontSize ?? styles.fontSize;
      styles.paddingTop = moduleRecord.styles?.paddingTop ?? 2;
      styles.paddingBottom = moduleRecord.styles?.paddingBottom ?? 6;
      styles.itemSpacing = moduleRecord.styles?.itemSpacing ?? 0;
    }

    return {
      ...moduleRecord,
      id: moduleRecord.id || createId(),
      order: index,
      styles,
      isCollapsed: false,
      items: items.length > 0 ? items : undefined,
    } as ResumeModule;
  });
}
