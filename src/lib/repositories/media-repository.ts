import { db, type MediaItem } from '@/lib/db';

export class MediaRepository {
  async getAll(): Promise<MediaItem[]> {
    return await db.mediaItems.toArray();
  }

  async getById(id: number): Promise<MediaItem | undefined> {
    return await db.mediaItems.get(id);
  }

  async getByBookmarkId(bookmarkId: number): Promise<MediaItem[]> {
    return await db.mediaItems
      .where({ bookmarkId })
      .toArray();
  }

  async getRandomItems(limit: number = 10): Promise<MediaItem[]> {
    const allItems = await this.getAll();
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  async add(mediaItem: Omit<MediaItem, 'id'>): Promise<number> {
    return await db.mediaItems.add(mediaItem);
  }

  async update(id: number, mediaItem: Partial<MediaItem>): Promise<number> {
    return await db.mediaItems.update(id, mediaItem);
  }

  async delete(id: number): Promise<void> {
    await db.mediaItems.delete(id);
  }

  async deleteByBookmarkId(bookmarkId: number): Promise<void> {
    await db.mediaItems.where({ bookmarkId }).delete();
  }
} 