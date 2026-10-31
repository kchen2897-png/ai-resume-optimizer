import { readFileSync } from 'fs';
import path from 'path';

// Embed the bundled font: setContent pages cannot reliably load file:// fonts,
// and serverless Chromium does not ship with system Chinese fonts.
let cjkFontData: string | undefined;
export function fontFaceCss(): string {
  cjkFontData ??= readFileSync(path.join(process.cwd(), 'public/fonts/NotoSansSC.ttf')).toString('base64');
  return `
  @font-face{
    font-family:"ResumeCJK";
    src:url("data:font/ttf;base64,${cjkFontData}") format("truetype");
    font-weight:100 900;
    font-style:normal;
    font-display:block;
  }`;
}

