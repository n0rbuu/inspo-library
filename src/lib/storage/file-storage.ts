import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Base paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKMARKS_DIR = path.join(DATA_DIR, 'bookmarks');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

// Ensure directories exist
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(BOOKMARKS_DIR);
fs.ensureDirSync(MEDIA_DIR);

/**
 * Saves a JSON object to a file
 */
export async function saveJsonToFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * Reads a JSON object from a file
 */
export async function readJsonFromFile<T>(filePath: string): Promise<T | null> {
  try {
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Saves a base64 encoded media file to disk
 * @returns The file path relative to the media directory
 */
export async function saveMediaFile(
  base64Data: string, 
  type: 'image' | 'video'
): Promise<string> {
  // Extract the actual base64 data (remove the data:image/png;base64, part)
  const base64Content = base64Data.split(';base64,').pop() || '';
  
  // Determine file extension based on the data
  let extension = '.jpg'; // Default
  if (base64Data.includes('data:image/png')) {
    extension = '.png';
  } else if (base64Data.includes('data:image/gif')) {
    extension = '.gif';
  } else if (base64Data.includes('data:video/')) {
    extension = '.mp4';
  }
  
  // Generate a unique filename
  const filename = `${uuidv4()}${extension}`;
  const filePath = path.join(MEDIA_DIR, filename);
  
  // Save the file
  await fs.writeFile(filePath, base64Content, { encoding: 'base64' });
  
  // Return the relative path
  return filename;
}

/**
 * Reads a media file from disk and returns it as base64
 */
export async function readMediaFile(filename: string): Promise<string | null> {
  try {
    const filePath = path.join(MEDIA_DIR, filename);
    if (await fs.pathExists(filePath)) {
      const data = await fs.readFile(filePath, { encoding: 'base64' });
      
      // Determine the MIME type based on extension
      const extension = path.extname(filename).toLowerCase();
      let mimeType = 'image/jpeg';
      
      if (extension === '.png') {
        mimeType = 'image/png';
      } else if (extension === '.gif') {
        mimeType = 'image/gif';
      } else if (['.mp4', '.webm', '.ogg'].includes(extension)) {
        mimeType = `video/${extension.substring(1)}`;
      }
      
      return `data:${mimeType};base64,${data}`;
    }
    return null;
  } catch (error) {
    console.error(`Error reading media file ${filename}:`, error);
    return null;
  }
}

/**
 * Deletes a file from disk
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
}

/**
 * Lists all files in a directory
 */
export async function listFiles(directory: string): Promise<string[]> {
  try {
    return await fs.readdir(directory);
  } catch (error) {
    console.error(`Error listing files in ${directory}:`, error);
    return [];
  }
}

// Export paths for use in repositories
export { BOOKMARKS_DIR, MEDIA_DIR }; 