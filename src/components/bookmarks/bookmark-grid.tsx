import { Bookmark } from "@/lib/db";
import { BookmarkCard } from "./bookmark-card";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
}

export function BookmarkGrid({ bookmarks }: BookmarkGridProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No bookmarks found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
} 