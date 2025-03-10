"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { MediaGrid } from "@/components/media/media-grid";
import { BookmarkGrid } from "@/components/bookmarks/bookmark-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RepositoryFactory } from "@/lib/repositories";
import { Bookmark, MediaItem } from "@/lib/db";
import { Search, PlusCircle, RefreshCw, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllUniqueTags } from "@/lib/utils/tag-utils";

export default function HomePage() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const tabParam = searchParams.get('tab') || 'inspiration';
  
  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  
  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(tagParam ? [tagParam] : []);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Load random media for inspiration
  const loadRandomMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const mediaRepository = RepositoryFactory.getMediaRepository();
      const randomItems = await mediaRepository.getRandomItems(12);
      setMediaItems(randomItems);
    } catch (error) {
      console.error("Error loading random media:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };
  
  // Load all bookmarks
  const loadBookmarks = async () => {
    setIsLoadingBookmarks(true);
    try {
      const bookmarkRepository = RepositoryFactory.getBookmarkRepository();
      const allBookmarks = await bookmarkRepository.getAll();
      
      // Sort by date added (newest first)
      const sortedBookmarks = allBookmarks.sort((a, b) => 
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      );
      
      setBookmarks(sortedBookmarks);
      setFilteredBookmarks(sortedBookmarks);
      setAllTags(getAllUniqueTags(sortedBookmarks));
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setIsLoadingBookmarks(false);
    }
  };
  
  // Initial data loading
  useEffect(() => {
    loadRandomMedia();
    loadBookmarks();
  }, []);
  
  // Filter bookmarks when search or tags change
  useEffect(() => {
    // Filter bookmarks based on search query and selected tags
    let filtered = bookmarks;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (bookmark.url && bookmark.url.toLowerCase().includes(query))
      );
    }
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark => 
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
    }
    
    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, selectedTags]);
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Inspo Library</h1>
         
        </div>
        
        <Tabs defaultValue={tabParam} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inspiration" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Random Inspiration</h2>
              <Button onClick={loadRandomMedia} disabled={isLoadingMedia} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {isLoadingMedia ? (
              <div className="text-center py-12">Loading inspiration...</div>
            ) : (
              <MediaGrid mediaItems={mediaItems} />
            )}
            
            {!isLoadingMedia && mediaItems.length === 0 && (
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
          </TabsContent>
          
          <TabsContent value="library" className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {allTags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Filter by Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {isLoadingBookmarks ? (
              <div className="text-center py-12">Loading bookmarks...</div>
            ) : (
              <BookmarkGrid bookmarks={filteredBookmarks} />
            )}
            
            {!isLoadingBookmarks && filteredBookmarks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                {searchQuery || selectedTags.length > 0 ? 
                  "No bookmarks match your search" : 
                  "No bookmarks found"
                }
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
