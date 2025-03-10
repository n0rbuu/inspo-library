import { Bookmark } from '@/lib/db';

/**
 * Client-side API service for bookmarks
 */
export const BookmarkAPI = {
  /**
   * Get all bookmarks
   */
  async getAll(): Promise<Bookmark[]> {
    const response = await fetch('/api/bookmarks');
    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }
    return response.json();
  },
  
  /**
   * Get a bookmark by ID
   */
  async getById(id: number): Promise<Bookmark> {
    const response = await fetch(`/api/bookmarks/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookmark with ID ${id}`);
    }
    return response.json();
  },
  
  /**
   * Get bookmarks by tags
   */
  async getByTags(tags: string[]): Promise<Bookmark[]> {
    if (!tags.length) return this.getAll();
    
    const tag = tags[0]; // API currently supports filtering by a single tag
    const response = await fetch(`/api/bookmarks?tag=${encodeURIComponent(tag)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks by tag');
    }
    return response.json();
  },
  
  /**
   * Search bookmarks
   */
  async search(query: string): Promise<Bookmark[]> {
    const response = await fetch(`/api/bookmarks?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search bookmarks');
    }
    return response.json();
  },
  
  /**
   * Add a new bookmark
   */
  async add(bookmark: Omit<Bookmark, 'id'>): Promise<number> {
    const response = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmark),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add bookmark');
    }
    
    const data = await response.json();
    return data.id;
  },
  
  /**
   * Update a bookmark
   */
  async update(id: number, bookmark: Partial<Bookmark>): Promise<void> {
    const response = await fetch(`/api/bookmarks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmark),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update bookmark with ID ${id}`);
    }
  },
  
  /**
   * Delete a bookmark
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`/api/bookmarks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete bookmark with ID ${id}`);
    }
  },
}; 