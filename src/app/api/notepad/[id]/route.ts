import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const db = getDb();
    
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const note = stmt.get(id);
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    return NextResponse.json({ error: 'Failed to get note' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { content } = await request.json();
    
    const db = getDb();
    const now = Date.now();
    
    const stmt = db.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?');
    const result = stmt.run(content, now, id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, updated_at: now });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
