"""Extract text from PDF using PyMuPDF. Called from Node.js via child_process."""
import sys
import json
import fitz  # PyMuPDF


def extract_text(pdf_path: str) -> dict:
    """Extract text from all pages of a PDF file."""
    try:
        doc = fitz.open(pdf_path)
        pages_text = []
        for i in range(doc.page_count):
            page = doc[i]
            text = page.get_text()
            if text.strip():
                pages_text.append(text.strip())

        full_text = "\n\n".join(pages_text)
        return {
            "success": True,
            "text": full_text,
            "charCount": len(full_text),
            "pageCount": doc.page_count,
            "pagesWithText": len(pages_text),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        json.dump({"success": False, "error": "Usage: extract_pdf.py <pdf_path>"}, sys.stdout)
        sys.exit(1)

    result = extract_text(sys.argv[1])
    # Force UTF-8 output to avoid GBK encoding errors on Windows
    sys.stdout.reconfigure(encoding='utf-8')
    json.dump(result, sys.stdout, ensure_ascii=False)
