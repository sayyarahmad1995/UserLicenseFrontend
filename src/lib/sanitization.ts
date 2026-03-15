/**
 * Input Sanitization and Security Utilities
 * Prevents XSS, injection attacks, and sanitizes user input
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 */
export function sanitizeInput(
  input: string | null | undefined,
  options: {
    trim?: boolean;
    lowercase?: boolean;
    maxLength?: number;
    allowSpecialChars?: boolean;
  } = {}
): string {
  if (!input) return '';

  let result = input;

  // Trim whitespace
  if (options.trim !== false) {
    result = result.trim();
  }

  // Convert to lowercase if specified
  if (options.lowercase) {
    result = result.toLowerCase();
  }

  // Remove dangerous characters by default (unless explicitly allowing them)
  if (!options.allowSpecialChars) {
    // Allow basic alphanumeric, spaces, hyphens, underscores, and common punctuation
    result = result.replace(/[^\w\s\-._@+]/g, '');
  }

  // Enforce max length
  if (options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  return result;
}

/**
 * Sanitizes email addresses
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  return sanitizeInput(email.toLowerCase(), {
    trim: true,
    maxLength: 254, // RFC 5321
  }).replace(/[^a-z0-9@._+-]/g, '');
}

/**
 * Sanitizes URLs
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Prevents and detects SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  const sqlKeywords = [
    'union',
    'select',
    'insert',
    'update',
    'delete',
    'drop',
    'create',
    'alter',
    'exec',
    'execute',
    'script',
    'javascript',
    'onerror',
    'onclick',
  ];

  const lowerInput = input.toLowerCase();

  // Check for suspicious SQL keywords
  if (sqlKeywords.some((keyword) => lowerInput.includes(keyword))) {
    return true;
  }

  // Check for suspicious characters combinations
  const suspiciousPatterns = [
    /('[\s]*;)|('[\s]+or)/gi, // ' OR, ' ;
    /(--[\s]*$)|(\/\*)/gi, // SQL comments
    /xp_[\w]+/gi, // Extended stored procedures
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Prevents XSS by escaping and validating HTML
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  // First escape the HTML
  let sanitized = escapeHtml(html);

  // Remove any remaining script tags
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  return sanitized;
}

/**
 * Removes all HTML tags from a string
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes file names to prevent directory traversal and injection
 */
export function sanitizeFileName(
  fileName: string | null | undefined
): string {
  if (!fileName) return 'file';

  // Remove path separators and special characters
  let sanitized = fileName
    .replace(/\.\./g, '') // Remove ..
    .replace(/[\/\\]/g, '') // Remove slashes
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/[\x00-\x1f]/g, '') // Remove control characters
    .trim();

  // Ensure it's not empty
  return sanitized || 'file';
}

/**
 * Validates and sanitizes JSON input
 */
export function sanitizeJson(jsonString: string | null | undefined): any {
  if (!jsonString) return null;

  try {
    const parsed = JSON.parse(jsonString);

    // Ensure it's an object or array
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Creates a strongly typed sanitizer for specific input types
 */
export class InputSanitizer {
  static username(input: string | null | undefined): string {
    return sanitizeInput(input, {
      trim: true,
      allowSpecialChars: false,
      maxLength: 50,
    }).replace(/[^a-z0-9._-]/gi, '');
  }

  static password(input: string | null | undefined): string {
    // Don't sanitize passwords - they can contain any characters
    return input || '';
  }

  static fullName(input: string | null | undefined): string {
    return sanitizeInput(input, {
      trim: true,
      maxLength: 100,
      allowSpecialChars: true,
    }).replace(/[<>]/g, ''); // Remove potential HTML
  }

  static description(input: string | null | undefined, maxLength: number = 1000): string {
    return sanitizeInput(input, {
      trim: true,
      maxLength,
      allowSpecialChars: true,
    });
  }

  static phoneNumber(input: string | null | undefined): string {
    if (!input) return '';

    // Keep only digits, spaces, hyphens, parentheses, and +
    return input.replace(/[^\d\s\-()+ ]/g, '');
  }

  static ipAddress(input: string | null | undefined): string {
    if (!input) return '';

    // Keep only digits and dots
    return input.replace(/[^\d.]/g, '');
  }

  static uuid(input: string | null | undefined): string {
    if (!input) return '';

    // Keep only hex characters and hyphens
    return input.replace(/[^a-f0-9\-]/gi, '');
  }
}

/**
 * CSRF Token management
 */
export class CsrfTokenManager {
  private static readonly STORAGE_KEY = '_csrf_token';

  static getToken(): string | null {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Fallback to localStorage
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  static clearToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static addToHeaders(headers: Record<string, string>): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers['x-csrf-token'] = token;
    }
    return headers;
  }
}

/**
 * Content Security Policy helper
 */
export const contentSecurityPolicyHeaders = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https:'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};
