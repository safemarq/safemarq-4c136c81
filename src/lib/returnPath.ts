/** True for tabs, newlines and the other control characters. */
const hasControl = (s: string): boolean => [...s].some((c) => c.charCodeAt(0) < 0x20 || c.charCodeAt(0) === 0x7f);

/**
 * Where to go after signing in: only paths on this site, never "//evil.com" or
 * "/auth" itself (no open redirect, no loop). Backslashes, spaces and control
 * characters are refused too: browsers drop tabs and newlines from URLs, so
 * "/\t/evil.com" would become "//evil.com".
 */
export function safeReturn(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/auth')) return '/';
  if (value.includes('\\') || /\s/.test(value) || hasControl(value)) return '/';
  return value.slice(0, 200);
}
