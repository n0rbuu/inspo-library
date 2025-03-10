import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { MediaItem } from '@/lib/db';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const MEDIA_METADATA_DIR = path.join(MEDIA_DIR, 'metadata');

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

// GET /api/media/[id] - Get a media item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    
    const metadataPath = path.join(MEDIA_METADATA_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(metadataPath))) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    const metadata = await fs.readJson(metadataPath) as Omit<MediaItem, 'data'>;
    
    // Load the actual media data
    const data = await readMediaFile(id, metadata.type);
    
    if (!data) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }
    
    const mediaItem: MediaItem = {
      ...metadata,
      id,
      data
    };
    
    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error(`Error getting media item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to get media item' }, { status: 500 });
  }
}

// DELETE /api/media/[id] - Delete a media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    
    const metadataPath = path.join(MEDIA_METADATA_DIR, `${id}.json`);
    
    if (!(await fs.pathExists(metadataPath))) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    
    // Get the media type
    const metadata = await fs.readJson(metadataPath) as Omit<MediaItem, 'data'>;
    
    // Delete the media file
    const extension = metadata.type === 'image' ? '.image' : '.video';
    const filePath = path.join(MEDIA_DIR, `${id}${extension}`);
    
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.error(`Error deleting media file ${id}:`, error);
    }
    
    // Delete the metadata
    await fs.remove(metadataPath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting media item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
} 