import DOMPurify from "dompurify";

/**
 * Sanitizes rich-text HTML produced by the contenteditable editor
 * (and any other user-supplied HTML) to prevent stored XSS.
 *
 * DOMPurify runs in the browser; this module must only be imported
 * from client components.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    return dirty;
  }
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover", "style"],
  });
}
