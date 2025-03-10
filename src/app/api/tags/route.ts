import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { Bookmark } from '@/lib/db';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');

// GET /api/tags - Get all unique tags
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    const files = await fs.readdir(BOOKMARKS_DIR);
    const tagSet = new Set<string>();
    
    for (const file of files) {
      if (file === '.gitkeep' || file === 'comments') continue;
      
      const filePath = path.join(BOOKMARKS_DIR, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) continue;
      
      try {
        const bookmark = await fs.readJson(filePath) as Bookmark;
        
        bookmark.tags.forEach(tag => {
          // Filter by query if provided
          if (!query || tag.toLowerCase().includes(query.toLowerCase())) {
            tagSet.add(tag);
          }
        });
      } catch (error) {
        console.error(`Error reading bookmark file ${file}:`, error);
      }
    }
    
    // Convert to array and sort
    const tags = Array.from(tagSet).sort();
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    return NextResponse.json({ error: 'Failed to get tags' }, { status: 500 });
  }
} 