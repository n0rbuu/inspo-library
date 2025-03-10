import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import JSZip from 'jszip';
import { Readable } from 'stream';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

// Helper function to add a directory to a zip file
async function addDirectoryToZip(zip: JSZip, dirPath: string, zipPath: string): Promise<void> {
  const files = await fs.readdir(dirPath);
  
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filePath = path.join(dirPath, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      // Recursively add subdirectories
      await addDirectoryToZip(zip, filePath, `${zipPath}/${file}`);
    } else {
      // Add file to zip
      const content = await fs.readFile(filePath);
      zip.file(`${zipPath}/${file}`, content);
    }
  }
}

// GET /api/backup - Download a backup of all data
export async function GET() {
  try {
    const zip = new JSZip();
    
    // Add bookmarks directory
    await addDirectoryToZip(zip, BOOKMARKS_DIR, 'bookmarks');
    
    // Add media directory
    await addDirectoryToZip(zip, MEDIA_DIR, 'media');
    
    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="inspo-library-backup-${timestamp}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

// POST /api/backup - Restore from a backup
export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No backup file provided' }, { status: 400 });
    }
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the zip file
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Clear existing data
    await fs.emptyDir(BOOKMARKS_DIR);
    await fs.emptyDir(MEDIA_DIR);
    
    // Restore .gitkeep files
    await fs.writeFile(path.join(BOOKMARKS_DIR, '.gitkeep'), '');
    await fs.writeFile(path.join(MEDIA_DIR, '.gitkeep'), '');
    await fs.ensureDir(path.join(BOOKMARKS_DIR, 'comments'));
    await fs.writeFile(path.join(BOOKMARKS_DIR, 'comments', '.gitkeep'), '');
    await fs.ensureDir(path.join(MEDIA_DIR, 'metadata'));
    await fs.writeFile(path.join(MEDIA_DIR, 'metadata', '.gitkeep'), '');
    
    // Extract files
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) {
        // Create directory
        const dirPath = path.join(DATA_DIR, relativePath);
        await fs.ensureDir(dirPath);
      } else {
        // Extract file
        const content = await zipEntry.async('nodebuffer');
        const filePath = path.join(DATA_DIR, relativePath);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return NextResponse.json({ error: 'Failed to restore from backup' }, { status: 500 });
  }
} 