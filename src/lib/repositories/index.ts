import { BookmarkRepository } from './bookmark-repository';
import { MediaRepository } from './media-repository';
import { CommentRepository } from './comment-repository';
import { BookmarkAPI, MediaAPI, CommentAPI } from '@/lib/api';
import { MediaItem } from '@/lib/db';

// Create API-based repository implementations
class APIBookmarkRepository implements BookmarkRepository {
  async getAll() { return BookmarkAPI.getAll(); }
  async getById(id: number) { return BookmarkAPI.getById(id); }
  async getByTags(tags: string[]) { return BookmarkAPI.getByTags(tags); }
  async search(query: string) { return BookmarkAPI.search(query); }
  async add(bookmark: any) { return BookmarkAPI.add(bookmark); }
  async update(id: number, bookmark: any) { await BookmarkAPI.update(id, bookmark); return id; }
  async delete(id: number) { return BookmarkAPI.delete(id); }
}

class APIMediaRepository implements MediaRepository {
  async getAll() { return MediaAPI.getAll(); }
  async getById(id: number) { return MediaAPI.getById(id); }
  async getByBookmarkId(bookmarkId: number) { return MediaAPI.getByBookmarkId(bookmarkId); }
  async getRandomItems(limit: number = 10) { return MediaAPI.getRandomItems(limit); }
  async add(mediaItem: any) { return MediaAPI.add(mediaItem); }
  async update(id: number, mediaItem: Partial<MediaItem>): Promise<number> { 
    // This is a workaround since our API doesn't support updating media items
    // In a real implementation, we would call the API
    console.warn('Media item update not implemented in API');
    return id;
  }
  async delete(id: number) { return MediaAPI.delete(id); }
  async deleteByBookmarkId(bookmarkId: number) { return MediaAPI.deleteByBookmarkId(bookmarkId); }
}

class APICommentRepository implements CommentRepository {
  async getAll() { return CommentAPI.getAll(); }
  async getById(id: number) { return CommentAPI.getById(id); }
  async getByBookmarkId(bookmarkId: number) { return CommentAPI.getByBookmarkId(bookmarkId); }
  async search(query: string) { return CommentAPI.search(query); }
  async add(comment: any) { return CommentAPI.add(comment); }
  async update(id: number, comment: any) { await CommentAPI.update(id, comment); return id; }
  async delete(id: number) { return CommentAPI.delete(id); }
  async deleteByBookmarkId(bookmarkId: number) { return CommentAPI.deleteByBookmarkId(bookmarkId); }
}

// Repository factory to provide access to all repositories
export class RepositoryFactory {
  private static bookmarkRepository: BookmarkRepository;
  private static mediaRepository: MediaRepository;
  private static commentRepository: CommentRepository;

  static getBookmarkRepository(): BookmarkRepository {
    if (!this.bookmarkRepository) {
      this.bookmarkRepository = new APIBookmarkRepository();
    }
    return this.bookmarkRepository;
  }

  static getMediaRepository(): MediaRepository {
    if (!this.mediaRepository) {
      this.mediaRepository = new APIMediaRepository();
    }
    return this.mediaRepository;
  }

  static getCommentRepository(): CommentRepository {
    if (!this.commentRepository) {
      this.commentRepository = new APICommentRepository();
    }
    return this.commentRepository;
  }
}

// Keep the original exports for compatibility
export { BookmarkRepository } from './bookmark-repository';
export { MediaRepository } from './media-repository';
export { CommentRepository } from './comment-repository'; 