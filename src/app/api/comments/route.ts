import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { Comment } from '@/lib/db';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');
const COMMENTS_DIR = path.join(BOOKMARKS_DIR, 'comments');

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(BOOKMARKS_DIR);
fs.ensureDirSync(COMMENTS_DIR);

// GET /api/comments - Get all comments or filter by bookmarkId
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const bookmarkId = url.searchParams.get('bookmarkId');
    const query = url.searchParams.get('query');
    
    const files = await fs.readdir(COMMENTS_DIR);
    const comments: Comment[] = [];
    
    for (const file of files) {
      if (file === '.gitkeep') continue;
      
      const filePath = path.join(COMMENTS_DIR, file);
      try {
        const comment = await fs.readJson(filePath) as Comment;
        
        // Ensure the ID is set from the filename
        const id = parseInt(path.basename(file, '.json'));
        if (isNaN(id)) continue;
        
        comment.id = id;
        
        // Filter by bookmarkId if provided
        if (bookmarkId && comment.bookmarkId !== parseInt(bookmarkId)) {
          continue;
        }
        
        // Filter by search query if provided
        if (query && !comment.text.toLowerCase().includes(query.toLowerCase())) {
          continue;
        }
        
        comments.push(comment);
      } catch (error) {
        console.error(`Error reading comment file ${file}:`, error);
      }
    }
    
    // Sort by timestamp (newest first)
    const sortedComments = comments.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json(sortedComments);
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json({ error: 'Failed to get comments' }, { status: 500 });
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const comment = await request.json() as Omit<Comment, 'id'>;
    
    // Validate required fields
    if (!comment.bookmarkId || !comment.text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Generate a unique ID
    const id = Date.now();
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    
    // Save the comment
    await fs.writeJson(filePath, {
      ...comment,
      id
    }, { spaces: 2 });
    
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
} 