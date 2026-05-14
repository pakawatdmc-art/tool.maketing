/**
 * Encode/decode note content into a URL-safe string for sharing.
 * The note data is stored entirely in the URL hash (#), so it never
 * touches the server. Links expire after 7 days.
 */

const EXPIRY_DAYS = 7;

interface SharePayload {
  /** Note content */
  c: string;
  /** Expiry timestamp (ms) */
  e: number;
}

/**
 * Encode note content into a URL-safe base64 string.
 * Handles Unicode (Thai, emoji, etc.) properly.
 */
export function encodeNote(content: string): string {
  const payload: SharePayload = {
    c: content,
    e: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };

  const json = JSON.stringify(payload);

  // TextEncoder handles Unicode properly
  const bytes = new TextEncoder().encode(json);

  // Convert to base64
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decode a shared note from a URL-safe base64 string.
 * Returns null if the data is invalid or expired.
 */
export function decodeNote(encoded: string): { content: string; expired: boolean; expiresAt: number } | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4) {
      base64 += "=";
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const json = new TextDecoder().decode(bytes);
    const payload: SharePayload = JSON.parse(json);

    if (!payload.c || !payload.e) return null;

    const expired = Date.now() > payload.e;

    return {
      content: payload.c,
      expired,
      expiresAt: payload.e,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a full share URL for a note.
 */
export function generateShareUrl(content: string, baseUrl: string): string {
  const encoded = encodeNote(content);
  return `${baseUrl}/notepad/share#${encoded}`;
}
