import { z } from "zod";

/**
 * Security utilities for the OctoSight frontend.
 * Focusing on basic XSS and SQL Injection prevention at the input layer.
 */

export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // 1. No aggressive trimming during typing (allows spaces)
  let sanitized = input;

  // 2. XSS Prevention: Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>?/gm, "");

  // 3. Basic SQLi mitigation: Strip common SQL meta-characters
  // Note: Backend MUST use parameterized queries (SQLAlchemy) as primary defense.
  sanitized = sanitized.replace(/['";\\]|\/\*|\*\//g, "");

  return sanitized;
};
