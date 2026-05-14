/**
 * Client-side note storage using localStorage.
 * Each note has a unique ID and content stored locally in the browser.
 */

export interface Note {
  id: string;
  content: string;
  created_at: number;
  updated_at: number;
}

const STORAGE_KEY = "2fa_tools_notes";

function generateId(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

function getAllNotes(): Record<string, Note> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllNotes(notes: Record<string, Note>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function createNote(content: string): Note {
  const notes = getAllNotes();
  const id = generateId();
  const now = Date.now();
  const note: Note = { id, content, created_at: now, updated_at: now };
  notes[id] = note;
  saveAllNotes(notes);
  return note;
}

export function getNote(id: string): Note | null {
  const notes = getAllNotes();
  return notes[id] || null;
}

export function updateNote(id: string, content: string): Note | null {
  const notes = getAllNotes();
  if (!notes[id]) return null;
  notes[id].content = content;
  notes[id].updated_at = Date.now();
  saveAllNotes(notes);
  return notes[id];
}

export function deleteNote(id: string): boolean {
  const notes = getAllNotes();
  if (!notes[id]) return false;
  delete notes[id];
  saveAllNotes(notes);
  return true;
}

export function listNotes(): Note[] {
  const notes = getAllNotes();
  return Object.values(notes).sort((a, b) => b.updated_at - a.updated_at);
}
