import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { Bookmark } from '@/lib/db';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');
const COMMENTS_DIR = path.join(BOOKMARKS_DIR, 'comments');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const MEDIA_METADATA_DIR = path.join(MEDIA_DIR, 'metadata');

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(BOOKMARKS_DIR);
fs.ensureDirSync(COMMENTS_DIR);
fs.ensureDirSync(MEDIA_DIR);
fs.ensureDirSync(MEDIA_METADATA_DIR);

// GET /api/bookmarks/[id] - Get a bookmark by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id: idString } = context.params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
    }
    
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(filePath))) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }
    
    const bookmark = await fs.readJson(filePath) as Bookmark;
    bookmark.id = id;
    
    return NextResponse.json(bookmark);
  } catch (error) {
    console.error(`Error getting bookmark:`, error);
    return NextResponse.json({ error: 'Failed to get bookmark' }, { status: 500 });
  }
}

// PUT /api/bookmarks/[id] - Update a bookmark
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id: idString } = context.params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
    }
    
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(filePath))) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }
    
    const existingBookmark = await fs.readJson(filePath) as Bookmark;
    const updates = await request.json() as Partial<Bookmark>;
    
    // Merge the existing bookmark with the updates
    const updatedBookmark = {
      ...existingBookmark,
      ...updates,
      id
    };
    
    // Save the updated bookmark
    await fs.writeJson(filePath, updatedBookmark, { spaces: 2 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating bookmark:`, error);
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}

// DELETE /api/bookmarks/[id] - Delete a bookmark
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id: idString } = context.params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
    }
    
    const bookmarkPath = path.join(BOOKMARKS_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(bookmarkPath))) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }
    
    // Delete associated media items
    const mediaFiles = await fs.readdir(MEDIA_METADATA_DIR);
    for (const file of mediaFiles) {
      if (file === '.gitkeep') continue;
      
      const metadataPath = path.join(MEDIA_METADATA_DIR, file);
      try {
        const metadata = await fs.readJson(metadataPath);
        if (metadata.bookmarkId === id) {
          // Delete the media file
          const mediaId = parseInt(path.basename(file, '.json'));
          if (!isNaN(mediaId)) {
            // Try to delete both image and video files (one will fail, but that's ok)
            try { await fs.remove(path.join(MEDIA_DIR, `${mediaId}.image`)); } catch {}
            try { await fs.remove(path.join(MEDIA_DIR, `${mediaId}.video`)); } catch {}
            // Delete the metadata
            await fs.remove(metadataPath);
          }
        }
      } catch (error) {
        console.error(`Error processing media file ${file}:`, error);
      }
    }
    
    // Delete associated comments
    const commentFiles = await fs.readdir(COMMENTS_DIR);
    for (const file of commentFiles) {
      if (file === '.gitkeep') continue;
      
      const commentPath = path.join(COMMENTS_DIR, file);
      try {
        const comment = await fs.readJson(commentPath);
        if (comment.bookmarkId === id) {
          await fs.remove(commentPath);
        }
      } catch (error) {
        console.error(`Error processing comment file ${file}:`, error);
      }
    }
    
    // Delete the bookmark
    await fs.remove(bookmarkPath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting bookmark:`, error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
} 