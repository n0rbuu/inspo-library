import { db, type Comment } from '@/lib/db';

export class CommentRepository {
  async getAll(): Promise<Comment[]> {
    return await db.comments.toArray();
  }

  async getById(id: number): Promise<Comment | undefined> {
    return await db.comments.get(id);
  }

  async getByBookmarkId(bookmarkId: number): Promise<Comment[]> {
    return await db.comments
      .where({ bookmarkId })
      .toArray();
  }

  async search(query: string): Promise<Comment[]> {
    const lowerQuery = query.toLowerCase();
    
    return await db.comments
      .filter(comment => comment.text.toLowerCase().includes(lowerQuery))
      .toArray();
  }

  async add(comment: Omit<Comment, 'id'>): Promise<number> {
    return await db.comments.add(comment);
  }

  async update(id: number, comment: Partial<Comment>): Promise<number> {
    return await db.comments.update(id, comment);
  }

  async delete(id: number): Promise<void> {
    await db.comments.delete(id);
  }

  async deleteByBookmarkId(bookmarkId: number): Promise<void> {
    await db.comments.where({ bookmarkId }).delete();
  }
} 