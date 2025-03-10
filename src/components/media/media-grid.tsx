import { MediaItem } from "@/lib/db";
import { MediaItemCard } from "./media-item-card";
import Link from "next/link";

interface MediaGridProps {
  mediaItems: MediaItem[];
  linkToBookmark?: boolean;
}

export function MediaGrid({ mediaItems, linkToBookmark = true }: MediaGridProps) {
  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No media items found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaItems.map((mediaItem) => (
        <div key={mediaItem.id}>
          {linkToBookmark && mediaItem.id ? (
            <Link href={`/bookmarks/${mediaItem.bookmarkId}`} passHref>
              <MediaItemCard mediaItem={mediaItem} />
            </Link>
          ) : (
            <MediaItemCard mediaItem={mediaItem} />
          )}
        </div>
      ))}
    </div>
  );
} 