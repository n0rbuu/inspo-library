import { Comment } from '@/lib/db';

/**
 * Client-side API service for comments
 */
export const CommentAPI = {
  /**
   * Get all comments
   */
  async getAll(): Promise<Comment[]> {
    const response = await fetch('/api/comments');
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },
  
  /**
   * Get a comment by ID
   */
  async getById(id: number): Promise<Comment> {
    const response = await fetch(`/api/comments/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comment with ID ${id}`);
    }
    return response.json();
  },
  
  /**
   * Get comments by bookmark ID
   */
  async getByBookmarkId(bookmarkId: number): Promise<Comment[]> {
    const response = await fetch(`/api/comments?bookmarkId=${bookmarkId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments for bookmark ${bookmarkId}`);
    }
    return response.json();
  },
  
  /**
   * Search comments
   */
  async search(query: string): Promise<Comment[]> {
    const response = await fetch(`/api/comments?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search comments');
    }
    return response.json();
  },
  
  /**
   * Add a new comment
   */
  async add(comment: Omit<Comment, 'id'>): Promise<number> {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    
    const data = await response.json();
    return data.id;
  },
  
  /**
   * Update a comment
   */
  async update(id: number, comment: Partial<Comment>): Promise<void> {
    const response = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update comment with ID ${id}`);
    }
  },
  
  /**
   * Delete a comment
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete comment with ID ${id}`);
    }
  },
  
  /**
   * Delete comments by bookmark ID
   */
  async deleteByBookmarkId(bookmarkId: number): Promise<void> {
    // This is handled by the bookmark delete API
    // but we'll keep this method for API consistency
    const comments = await this.getByBookmarkId(bookmarkId);
    
    for (const comment of comments) {
      if (comment.id) {
        await this.delete(comment.id);
      }
    }
  },
}; 