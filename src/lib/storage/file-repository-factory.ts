import { FileBookmarkRepository } from './file-bookmark-repository';
import { FileMediaRepository } from './file-media-repository';
import { FileCommentRepository } from './file-comment-repository';

/**
 * Factory for file-based repositories
 */
export class FileRepositoryFactory {
  private static bookmarkRepository: FileBookmarkRepository;
  private static mediaRepository: FileMediaRepository;
  private static commentRepository: FileCommentRepository;
  
  /**
   * Get the bookmark repository
   */
  static getBookmarkRepository(): FileBookmarkRepository {
    if (!this.bookmarkRepository) {
      this.bookmarkRepository = new FileBookmarkRepository();
    }
    return this.bookmarkRepository;
  }
  
  /**
   * Get the media repository
   */
  static getMediaRepository(): FileMediaRepository {
    if (!this.mediaRepository) {
      this.mediaRepository = new FileMediaRepository();
    }
    return this.mediaRepository;
  }
  
  /**
   * Get the comment repository
   */
  static getCommentRepository(): FileCommentRepository {
    if (!this.commentRepository) {
      this.commentRepository = new FileCommentRepository();
    }
    return this.commentRepository;
  }
}

// Export individual repositories for direct access
export { FileBookmarkRepository } from './file-bookmark-repository';
export { FileMediaRepository } from './file-media-repository';
export { FileCommentRepository } from './file-comment-repository'; 