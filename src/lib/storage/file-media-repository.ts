import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaItem } from '@/lib/db';
import { 
  MEDIA_DIR, 
  saveJsonToFile, 
  readJsonFromFile, 
  deleteFile, 
  listFiles,
  saveMediaFile,
  readMediaFile
} from './file-storage';

// Directory for media metadata
const MEDIA_METADATA_DIR = path.join(MEDIA_DIR, 'metadata');
// Ensure the directory exists
const fs = require('fs-extra');
fs.ensureDirSync(MEDIA_METADATA_DIR);

export class FileMediaRepository {
  /**
   * Get all media items
   */
  async getAll(): Promise<MediaItem[]> {
    try {
      const files = await listFiles(MEDIA_METADATA_DIR);
      const mediaItems: MediaItem[] = [];
      
      for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(MEDIA_METADATA_DIR, file);
        const metadata = await readJsonFromFile<Omit<MediaItem, 'data'>>(filePath);
        
        if (metadata) {
          // Get the ID from the filename
          const id = parseInt(path.basename(file, '.json'));
          if (isNaN(id)) continue;
          
          // Load the actual media data
          const data = await readMediaFile(metadata.type === 'image' 
            ? `${id}.image` 
            : `${id}.video`);
          
          if (data) {
            mediaItems.push({
              ...metadata,
              id,
              data
            });
          }
        }
      }
      
      return mediaItems;
    } catch (error) {
      console.error('Error getting all media items:', error);
      return [];
    }
  }
  
  /**
   * Get a media item by ID
   */
  async getById(id: number): Promise<MediaItem | undefined> {
    const metadataPath = path.join(MEDIA_METADATA_DIR, `${id}.json`);
    const metadata = await readJsonFromFile<Omit<MediaItem, 'data'>>(metadataPath);
    
    if (metadata) {
      // Load the actual media data
      const data = await readMediaFile(metadata.type === 'image' 
        ? `${id}.image` 
        : `${id}.video`);
      
      if (data) {
        return {
          ...metadata,
          id,
          data
        };
      }
    }
    
    return undefined;
  }
  
  /**
   * Get media items by bookmark ID
   */
  async getByBookmarkId(bookmarkId: number): Promise<MediaItem[]> {
    const allMedia = await this.getAll();
    return allMedia.filter(item => item.bookmarkId === bookmarkId);
  }
  
  /**
   * Get random media items
   */
  async getRandomItems(limit: number = 10): Promise<MediaItem[]> {
    const allItems = await this.getAll();
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
  
  /**
   * Add a new media item
   */
  async add(mediaItem: Omit<MediaItem, 'id'>): Promise<number> {
    // Generate a unique ID
    const id = Date.now();
    
    // Save the media file
    const filename = await saveMediaFile(mediaItem.data, mediaItem.type);
    
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
    await saveJsonToFile(metadataPath, metadata);
    
    return id;
  }
  
  /**
   * Update a media item
   */
  async update(id: number, mediaItem: Partial<MediaItem>): Promise<number> {
    const metadataPath = path.join(MEDIA_METADATA_DIR, `${id}.json`);
    const existingMetadata = await readJsonFromFile<Omit<MediaItem, 'data'>>(metadataPath);
    
    if (!existingMetadata) {
      throw new Error(`Media item with ID ${id} not found`);
    }
    
    // If there's new media data, save it
    if (mediaItem.data && mediaItem.type) {
      await saveMediaFile(mediaItem.data, mediaItem.type);
    }
    
    // Update the metadata
    const updatedMetadata: Omit<MediaItem, 'data'> = {
      ...existingMetadata,
      ...mediaItem,
      id
    };
    
    // Remove the data property from metadata
    delete (updatedMetadata as any).data;
    
    // Save the updated metadata
    await saveJsonToFile(metadataPath, updatedMetadata);
    
    return id;
  }
  
  /**
   * Delete a media item
   */
  async delete(id: number): Promise<void> {
    // Get the media item to determine its type
    const mediaItem = await this.getById(id);
    
    if (mediaItem) {
      // Delete the media file
      const mediaPath = path.join(MEDIA_DIR, mediaItem.type === 'image' 
        ? `${id}.image` 
        : `${id}.video`);
      await deleteFile(mediaPath);
      
      // Delete the metadata
      const metadataPath = path.join(MEDIA_METADATA_DIR, `${id}.json`);
      await deleteFile(metadataPath);
    }
  }
  
  /**
   * Delete media items by bookmark ID
   */
  async deleteByBookmarkId(bookmarkId: number): Promise<void> {
    const mediaItems = await this.getByBookmarkId(bookmarkId);
    
    for (const item of mediaItems) {
      if (item.id) {
        await this.delete(item.id);
      }
    }
  }
} 