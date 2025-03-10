import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Bookmark } from '@/lib/db';
import { 
  BOOKMARKS_DIR, 
  saveJsonToFile, 
  readJsonFromFile, 
  deleteFile, 
  listFiles 
} from './file-storage';

export class FileBookmarkRepository {
  /**
   * Get all bookmarks
   */
  async getAll(): Promise<Bookmark[]> {
    try {
      const files = await listFiles(BOOKMARKS_DIR);
      const bookmarks: Bookmark[] = [];
      
      for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(BOOKMARKS_DIR, file);
        const bookmark = await readJsonFromFile<Bookmark>(filePath);
        
        if (bookmark) {
          // Ensure the ID is set from the filename
          const id = parseInt(path.basename(file, '.json'));
          if (!isNaN(id)) {
            bookmark.id = id;
            bookmarks.push(bookmark);
          }
        }
      }
      
      return bookmarks;
    } catch (error) {
      console.error('Error getting all bookmarks:', error);
      return [];
    }
  }
  
  /**
   * Get a bookmark by ID
   */
  async getById(id: number): Promise<Bookmark | undefined> {
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    const bookmark = await readJsonFromFile<Bookmark>(filePath);
    
    if (bookmark) {
      bookmark.id = id;
      return bookmark;
    }
    
    return undefined;
  }
  
  /**
   * Get bookmarks by tags
   */
  async getByTags(tags: string[]): Promise<Bookmark[]> {
    if (!tags.length) return this.getAll();
    
    const allBookmarks = await this.getAll();
    
    return allBookmarks.filter(bookmark => {
      return tags.some(tag => bookmark.tags.includes(tag));
    });
  }
  
  /**
   * Search bookmarks
   */
  async search(query: string): Promise<Bookmark[]> {
    const lowerQuery = query.toLowerCase();
    const allBookmarks = await this.getAll();
    
    return allBookmarks.filter(bookmark => {
      const titleMatch = bookmark.title.toLowerCase().includes(lowerQuery);
      const tagMatch = bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const urlMatch = bookmark.url ? bookmark.url.toLowerCase().includes(lowerQuery) : false;
      
      return titleMatch || tagMatch || urlMatch;
    });
  }
  
  /**
   * Add a new bookmark
   */
  async add(bookmark: Omit<Bookmark, 'id'>): Promise<number> {
    // Generate a unique ID
    const id = Date.now();
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    
    // Save the bookmark
    await saveJsonToFile(filePath, {
      ...bookmark,
      id
    });
    
    return id;
  }
  
  /**
   * Update a bookmark
   */
  async update(id: number, bookmark: Partial<Bookmark>): Promise<number> {
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    const existingBookmark = await this.getById(id);
    
    if (!existingBookmark) {
      throw new Error(`Bookmark with ID ${id} not found`);
    }
    
    // Merge the existing bookmark with the updates
    const updatedBookmark = {
      ...existingBookmark,
      ...bookmark,
      id
    };
    
    // Save the updated bookmark
    await saveJsonToFile(filePath, updatedBookmark);
    
    return id;
  }
  
  /**
   * Delete a bookmark
   */
  async delete(id: number): Promise<void> {
    const filePath = path.join(BOOKMARKS_DIR, `${id}.json`);
    await deleteFile(filePath);
  }
} 