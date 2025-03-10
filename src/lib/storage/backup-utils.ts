import fs from 'fs-extra';
import path from 'path';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { FileRepositoryFactory } from './file-repository-factory';
import { BOOKMARKS_DIR, MEDIA_DIR } from './file-storage';

/**
 * Creates a backup of all data as a zip file
 */
export async function createBackup(): Promise<Blob> {
  const zip = new JSZip();
  
  // Add bookmarks directory
  await addDirectoryToZip(zip, BOOKMARKS_DIR, 'bookmarks');
  
  // Add media directory
  await addDirectoryToZip(zip, MEDIA_DIR, 'media');
  
  // Generate the zip file
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Adds a directory to a zip file
 */
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

/**
 * Downloads a backup of all data
 */
export async function downloadBackup(): Promise<void> {
  try {
    const backup = await createBackup();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveAs(backup, `inspo-library-backup-${timestamp}.zip`);
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
}

/**
 * Restores data from a backup file
 */
export async function restoreFromBackup(backupFile: File): Promise<void> {
  try {
    // Read the zip file
    const zipData = await readFileAsArrayBuffer(backupFile);
    const zip = await JSZip.loadAsync(zipData);
    
    // Clear existing data
    await fs.emptyDir(BOOKMARKS_DIR);
    await fs.emptyDir(MEDIA_DIR);
    
    // Restore .gitkeep files
    await fs.writeFile(path.join(BOOKMARKS_DIR, '.gitkeep'), '');
    await fs.writeFile(path.join(MEDIA_DIR, '.gitkeep'), '');
    
    // Extract files
    const zipEntries = Object.entries(zip.files) as [string, JSZip.JSZipObject][];
    for (const [relativePath, zipEntry] of zipEntries) {
      if (zipEntry.dir) {
        // Create directory
        const dirPath = path.join(process.cwd(), 'data', relativePath);
        await fs.ensureDir(dirPath);
      } else {
        // Extract file
        const content = await zipEntry.async('nodebuffer');
        const filePath = path.join(process.cwd(), 'data', relativePath);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content);
      }
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw new Error('Failed to restore from backup');
  }
}

/**
 * Reads a file as an ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
} 