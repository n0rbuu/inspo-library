import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { MediaItem } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const MEDIA_METADATA_DIR = path.join(MEDIA_DIR, 'metadata');

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(MEDIA_DIR);
fs.ensureDirSync(MEDIA_METADATA_DIR);

// Helper function to save a base64 encoded media file
async function saveMediaFile(id: number, base64Data: string, type: 'image' | 'video'): Promise<void> {
  // Extract the actual base64 data (remove the data:image/png;base64, part)
  const base64Content = base64Data.split(';base64,').pop() || '';
  
  // Determine file extension based on the data
  let extension = type === 'image' ? '.image' : '.video';
  
  // Save the file
  const filePath = path.join(MEDIA_DIR, `${id}${extension}`);
  await fs.writeFile(filePath, base64Content, { encoding: 'base64' });
}

// Helper function to read a media file
async function readMediaFile(id: number, type: 'image' | 'video'): Promise<string | null> {
  try {
    const extension = type === 'image' ? '.image' : '.video';
    const filePath = path.join(MEDIA_DIR, `${id}${extension}`);
    
    if (await fs.pathExists(filePath)) {
      const data = await fs.readFile(filePath, { encoding: 'base64' });
      
      // Determine the MIME type
      let mimeType = type === 'image' ? 'image/jpeg' : 'video/mp4';
      
      return `data:${mimeType};base64,${data}`;
    }
    return null;
  } catch (error) {
    console.error(`Error reading media file ${id}:`, error);
    return null;
  }
}

// GET /api/media - Get all media items or filter by bookmarkId
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const bookmarkId = url.searchParams.get('bookmarkId');
    const random = url.searchParams.get('random');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const files = await fs.readdir(MEDIA_METADATA_DIR);
    let mediaItems: MediaItem[] = [];
    
    for (const file of files) {
      if (file === '.gitkeep') continue;
      
      const metadataPath = path.join(MEDIA_METADATA_DIR, file);
      try {
        const metadata = await fs.readJson(metadataPath) as Omit<MediaItem, 'data'>;
        
        // Filter by bookmarkId if provided
        if (bookmarkId && metadata.bookmarkId !== parseInt(bookmarkId)) {
          continue;
        }
        
        // Get the ID from the filename
        const id = parseInt(path.basename(file, '.json'));
        if (isNaN(id)) continue;
        
        // Load the actual media data
        const data = await readMediaFile(id, metadata.type);
        
        if (data) {
          mediaItems.push({
            ...metadata,
            id,
            data
          });
        }
      } catch (error) {
        console.error(`Error processing media file ${file}:`, error);
      }
    }
    
    // Randomize if requested
    if (random === 'true') {
      mediaItems = mediaItems.sort(() => 0.5 - Math.random());
    }
    
    // Apply limit
    if (limit > 0 && mediaItems.length > limit) {
      mediaItems = mediaItems.slice(0, limit);
    }
    
    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error('Error getting media items:', error);
    return NextResponse.json({ error: 'Failed to get media items' }, { status: 500 });
  }
}

// POST /api/media - Create a new media item
export async function POST(request: NextRequest) {
  try {
    const mediaItem = await request.json() as Omit<MediaItem, 'id'>;
    
    // Validate required fields
    if (!mediaItem.bookmarkId || !mediaItem.type || !mediaItem.data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Generate a unique ID
    const id = Date.now();
    
    // Save the media file
    await saveMediaFile(id, mediaItem.data, mediaItem.type);
    
    // Create a metadata object without the actual data
    const metadata: Omit<MediaItem, 'data'> = {
      id,
      bookmarkId: mediaItem.bookmarkId,
      type: mediaItem.type,
      timestamp: mediaItem.timestamp,
      caption: mediaItem.caption
    };
    
    // Save the metadata
    const metadataPath = path.join(MEDIA_METADATA_DIR, `${id}.json`);
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating media item:', error);
    return NextResponse.json({ error: 'Failed to create media item' }, { status: 500 });
  }
} 