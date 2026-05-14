import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    const db = getDb();
    const id = nanoid(10); // generate random short ID
    const now = Date.now();
    
    const stmt = db.prepare('INSERT INTO notes (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)');
    stmt.run(id, content || '', now, now);
    
    return NextResponse.json({ id, content, created_at: now, updated_at: now });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
