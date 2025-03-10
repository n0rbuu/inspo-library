import Dexie, { type Table } from 'dexie';

// Define the types for our database tables
export interface Bookmark {
  id?: number;
  title: string;
  url?: string;
  dateAdded: Date;
  tags: string[];
}

export interface MediaItem {
  id?: number;
  bookmarkId: number;
  type: 'image' | 'video';
  data: string; // Base64 encoded data
  timestamp: Date;
  caption?: string;
}

export interface Comment {
  id?: number;
  bookmarkId: number;
  text: string;
  timestamp: Date;
}

// Define the database class
class InspoDatabase extends Dexie {
  bookmarks!: Table<Bookmark, number>;
  mediaItems!: Table<MediaItem, number>;
  comments!: Table<Comment, number>;

  constructor() {
    super('inspoLibrary');
    
    // Define the database schema
    this.version(1).stores({
      bookmarks: '++id, title, dateAdded, *tags',
      mediaItems: '++id, bookmarkId, type, timestamp',
      comments: '++id, bookmarkId, timestamp'
    });
  }
}

// Create and export a database instance
export const db = new InspoDatabase();

// Export a hook to use the database in components
export function useDatabase() {
  return db;
} 