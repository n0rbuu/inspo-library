"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { MediaGrid } from "@/components/media/media-grid";
import { Button } from "@/components/ui/button";
import { RepositoryFactory } from "@/lib/repositories";
import { MediaItem } from "@/lib/db";
import { RefreshCw } from "lucide-react";

export default function HomePage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadRandomMedia = async () => {
    setIsLoading(true);
    try {
      const mediaRepository = RepositoryFactory.getMediaRepository();
      const randomItems = await mediaRepository.getRandomItems(12);
      setMediaItems(randomItems);
    } catch (error) {
      console.error("Error loading random media:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadRandomMedia();
  }, []);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Design Inspiration</h1>
          <Button onClick={loadRandomMedia} disabled={isLoading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">Loading inspiration...</div>
        ) : (
          <MediaGrid mediaItems={mediaItems} />
        )}
        
        {!isLoading && mediaItems.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-xl font-semibold">No inspiration yet</h2>
            <p className="text-muted-foreground">
              Start by adding some bookmarks and media to build your inspiration library.
            </p>
            <Button asChild>
              <a href="/bookmarks/new">Add Your First Bookmark</a>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
