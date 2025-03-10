import { MediaItem } from '@/lib/db';

/**
 * Client-side API service for media items
 */
export const MediaAPI = {
  /**
   * Get all media items
   */
  async getAll(): Promise<MediaItem[]> {
    const response = await fetch('/api/media');
    if (!response.ok) {
      throw new Error('Failed to fetch media items');
    }
    return response.json();
  },
  
  /**
   * Get a media item by ID
   */
  async getById(id: number): Promise<MediaItem> {
    const response = await fetch(`/api/media/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch media item with ID ${id}`);
    }
    return response.json();
  },
  
  /**
   * Get media items by bookmark ID
   */
  async getByBookmarkId(bookmarkId: number): Promise<MediaItem[]> {
    const response = await fetch(`/api/media?bookmarkId=${bookmarkId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch media items for bookmark ${bookmarkId}`);
    }
    return response.json();
  },
  
  /**
   * Get random media items
   */
  async getRandomItems(limit: number = 10): Promise<MediaItem[]> {
    const response = await fetch(`/api/media?random=true&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch random media items');
    }
    return response.json();
  },
  
  /**
   * Add a new media item
   */
  async add(mediaItem: Omit<MediaItem, 'id'>): Promise<number> {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediaItem),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add media item');
    }
    
    const data = await response.json();
    return data.id;
  },
  
  /**
   * Delete a media item
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete media item with ID ${id}`);
    }
  },
  
  /**
   * Delete media items by bookmark ID
   */
  async deleteByBookmarkId(bookmarkId: number): Promise<void> {
    // This is handled by the bookmark delete API
    // but we'll keep this method for API consistency
    const mediaItems = await this.getByBookmarkId(bookmarkId);
    
    for (const item of mediaItems) {
      if (item.id) {
        await this.delete(item.id);
      }
    }
  },
}; 