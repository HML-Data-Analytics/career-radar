import { extractText as extractPdfText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB, matches the storage bucket limit

export function validateResumeFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Only PDF and DOCX files are supported.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large. Maximum size is 10 MB.";
  }
  return null;
}

export async function extractResumeText(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());

  let text: string;

  if (file.type === "application/pdf") {
    const pdf = await getDocumentProxy(buffer);
    const result = await extractPdfText(pdf, { mergePages: true });
    text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
  } else {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    text = result.value;
  }

  const normalized = text.replace(/\s+\n/g, "\n").trim();

  if (normalized.length < 50) {
    throw new Error(
      "Could not extract readable text from this file. It may be scanned/image-based, password-protected, or corrupted.",
    );
  }

  return normalized;
}
