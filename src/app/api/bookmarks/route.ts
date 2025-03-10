import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { Bookmark } from '@/lib/db';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(BOOKMARKS_DIR);

// GET /api/bookmarks - Get all bookmarks
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const query = url.searchParams.get('query');
    
    const files = await fs.readdir(BOOKMARKS_DIR);
    const bookmarks: Bookmark[] = [];
    
    for (const file of files) {
      if (file === '.gitkeep' || file === 'comments') continue;
      
      const filePath = path.join(BOOKMARKS_DIR, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) continue;
      
      try {
        const bookmark = await fs.readJson(filePath) as Bookmark;
        
        // Ensure the ID is set from the filename
        const id = parseInt(path.basename(file, '.json'));
        if (!isNaN(id)) {
          bookmark.id = id;
          bookmarks.push(bookmark);
        }
      } catch (error) {
        console.error(`Error reading bookmark file ${file}:`, error);
      }
    }
    
    // Filter by tag if provided
    let filteredBookmarks = bookmarks;
    if (tag) {
      filteredBookmarks = bookmarks.filter(bookmark => 
        bookmark.tags.includes(tag)
      );
    }
    
    // Filter by search query if provided
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredBookmarks = filteredBookmarks.filter(bookmark => {
        const titleMatch = bookmark.title.toLowerCase().includes(lowerQuery);
        const tagMatch = bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        const urlMatch = bookmark.url ? bookmark.url.toLowerCase().includes(lowerQuery) : false;
        
        return titleMatch || tagMatch || urlMatch;
      });
    }
    
    return NextResponse.json(filteredBookmarks);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return NextResponse.json({ error: 'Failed to get bookmarks' }, { status: 500 });
  }
}

// POST /api/bookmarks - Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    const bookmark = await request.json() as Omit<Bookmark, 'id'>;
    
    // Generate a unique ID
    const id = Date.now();
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    
    // Save the bookmark
    await fs.writeJson(filePath, {
      ...bookmark,
      id
    }, { spaces: 2 });
    
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
} 