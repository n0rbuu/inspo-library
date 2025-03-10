"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { BookmarkGrid } from "@/components/bookmarks/bookmark-grid";
import { Button } from "@/components/ui/button";
import { RepositoryFactory } from "@/lib/repositories";
import { Bookmark } from "@/lib/db";
import { toast } from "sonner";
import { ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

interface TagPageProps {
  params: {
    tag: string;
  };
}

export default function TagPage({ params }: TagPageProps) {
  const router = useRouter();
  const tag = decodeURIComponent(params.tag);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadBookmarksByTag = async () => {
      setIsLoading(true);
      try {
        const bookmarkRepository = RepositoryFactory.getBookmarkRepository();
        const taggedBookmarks = await bookmarkRepository.getByTags([tag]);
        
        // Sort by date added (newest first)
        const sortedBookmarks = taggedBookmarks.sort((a, b) => 
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        
        setBookmarks(sortedBookmarks);
      } catch (error) {
        console.error("Error loading bookmarks by tag:", error);
        toast.error("Failed to load bookmarks");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookmarksByTag();
  }, [tag]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <Tag className="h-6 w-6 mr-2" />
            {tag}
          </h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">Loading bookmarks...</div>
        ) : (
          <>
            <p className="text-muted-foreground">
              Found {bookmarks.length} bookmark{bookmarks.length === 1 ? '' : 's'} with tag "{tag}"
            </p>
            <BookmarkGrid bookmarks={bookmarks} />
            
            {bookmarks.length === 0 && (
              <div className="text-center py-6">
                <Link href="/bookmarks" passHref>
                  <Button variant="outline">
                    View All Bookmarks
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
} 