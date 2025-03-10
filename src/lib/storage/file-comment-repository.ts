import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '@/lib/db';
import { 
  BOOKMARKS_DIR, 
  saveJsonToFile, 
  readJsonFromFile, 
  deleteFile, 
  listFiles 
} from './file-storage';

// Directory for comments
const COMMENTS_DIR = path.join(BOOKMARKS_DIR, 'comments');
// Ensure the directory exists
const fs = require('fs-extra');
fs.ensureDirSync(COMMENTS_DIR);

export class FileCommentRepository {
  /**
   * Get all comments
   */
  async getAll(): Promise<Comment[]> {
    try {
      const files = await listFiles(COMMENTS_DIR);
      const comments: Comment[] = [];
      
      for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(COMMENTS_DIR, file);
        const comment = await readJsonFromFile<Comment>(filePath);
        
        if (comment) {
          // Ensure the ID is set from the filename
          const id = parseInt(path.basename(file, '.json'));
          if (!isNaN(id)) {
            comment.id = id;
            comments.push(comment);
          }
        }
      }
      
      return comments;
    } catch (error) {
      console.error('Error getting all comments:', error);
      return [];
    }
  }
  
  /**
   * Get a comment by ID
   */
  async getById(id: number): Promise<Comment | undefined> {
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    const comment = await readJsonFromFile<Comment>(filePath);
    
    if (comment) {
      comment.id = id;
      return comment;
    }
    
    return undefined;
  }
  
  /**
   * Get comments by bookmark ID
   */
  async getByBookmarkId(bookmarkId: number): Promise<Comment[]> {
    const allComments = await this.getAll();
    return allComments.filter(comment => comment.bookmarkId === bookmarkId);
  }
  
  /**
   * Search comments
   */
  async search(query: string): Promise<Comment[]> {
    const lowerQuery = query.toLowerCase();
    const allComments = await this.getAll();
    
    return allComments.filter(comment => 
      comment.text.toLowerCase().includes(lowerQuery)
    );
  }
  
  /**
   * Add a new comment
   */
  async add(comment: Omit<Comment, 'id'>): Promise<number> {
    // Generate a unique ID
    const id = Date.now();
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    
    // Save the comment
    await saveJsonToFile(filePath, {
      ...comment,
      id
    });
    
    return id;
  }
  
  /**
   * Update a comment
   */
  async update(id: number, comment: Partial<Comment>): Promise<number> {
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    const existingComment = await this.getById(id);
    
    if (!existingComment) {
      throw new Error(`Comment with ID ${id} not found`);
    }
    
    // Merge the existing comment with the updates
    const updatedComment = {
      ...existingComment,
      ...comment,
      id
    };
    
    // Save the updated comment
    await saveJsonToFile(filePath, updatedComment);
    
    return id;
  }
  
  /**
   * Delete a comment
   */
  async delete(id: number): Promise<void> {
    const filePath = path.join(COMMENTS_DIR, `${id}.json`);
    await deleteFile(filePath);
  }
  
  /**
   * Delete comments by bookmark ID
   */
  async deleteByBookmarkId(bookmarkId: number): Promise<void> {
    const comments = await this.getByBookmarkId(bookmarkId);
    
    for (const comment of comments) {
      if (comment.id) {
        await this.delete(comment.id);
      }
    }
  }
} 