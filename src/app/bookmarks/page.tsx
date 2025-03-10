"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { BookmarkGrid } from "@/components/bookmarks/bookmark-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RepositoryFactory } from "@/lib/repositories";
import { Bookmark } from "@/lib/db";
import { Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllUniqueTags } from "@/lib/utils/tag-utils";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const loadBookmarks = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadBookmarks();
  }, []);
  
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
          <h1 className="text-3xl font-bold">Bookmarks</h1>
          <Link href="/bookmarks/new" passHref>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </Link>
        </div>
        
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
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">Loading bookmarks...</div>
        ) : (
          <BookmarkGrid bookmarks={filteredBookmarks} />
        )}
      </div>
    </MainLayout>
  );
} 