import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { Comment } from '@/lib/db';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');
const COMMENTS_DIR = path.join(BOOKMARKS_DIR, 'comments');

// GET /api/comments/[id] - Get a comment by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id: idString } = context.params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }
    
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(filePath))) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    const comment = await fs.readJson(filePath) as Comment;
    comment.id = id;
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error(`Error getting comment:`, error);
    return NextResponse.json({ error: 'Failed to get comment' }, { status: 500 });
  }
}

// PUT /api/comments/[id] - Update a comment
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id: idString } = context.params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }
    
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(filePath))) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    const existingComment = await fs.readJson(filePath) as Comment;
    const updates = await request.json() as Partial<Comment>;
    
    // Merge the existing comment with the updates
    const updatedComment = {
      ...existingComment,
      ...updates,
      id
    };
    
    // Save the updated comment
    await fs.writeJson(filePath, updatedComment, { spaces: 2 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating comment:`, error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id: idString } = context.params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }
    
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(filePath))) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // Delete the comment
    await fs.remove(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting comment:`, error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
} 