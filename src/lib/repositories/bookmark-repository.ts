import { db, type Bookmark } from '@/lib/db';

export class BookmarkRepository {
  async getAll(): Promise<Bookmark[]> {
    return await db.bookmarks.toArray();
  }

  async getById(id: number): Promise<Bookmark | undefined> {
    return await db.bookmarks.get(id);
  }

  async getByTags(tags: string[]): Promise<Bookmark[]> {
    if (!tags.length) return this.getAll();
    
    return await db.bookmarks
      .filter(bookmark => {
        return tags.some(tag => bookmark.tags.includes(tag));
      })
      .toArray();
  }

  async search(query: string): Promise<Bookmark[]> {
    const lowerQuery = query.toLowerCase();
    
    return await db.bookmarks
      .filter(bookmark => {
        const titleMatch = bookmark.title.toLowerCase().includes(lowerQuery);
        const tagMatch = bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        const urlMatch = bookmark.url ? bookmark.url.toLowerCase().includes(lowerQuery) : false;
        
        return titleMatch || tagMatch || urlMatch;
      })
      .toArray();
  }

  async add(bookmark: Omit<Bookmark, 'id'>): Promise<number> {
    return await db.bookmarks.add(bookmark);
  }

  async update(id: number, bookmark: Partial<Bookmark>): Promise<number> {
    return await db.bookmarks.update(id, bookmark);
  }

  async delete(id: number): Promise<void> {
    // Delete related media items and comments
    await db.mediaItems.where({ bookmarkId: id }).delete();
    await db.comments.where({ bookmarkId: id }).delete();
    
    // Delete the bookmark
    await db.bookmarks.delete(id);
  }
} 