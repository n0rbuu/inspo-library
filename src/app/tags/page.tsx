"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RepositoryFactory } from "@/lib/repositories";
import { getAllUniqueTags } from "@/lib/utils/tag-utils";
import { Search, Tag } from "lucide-react";
import Link from "next/link";

export default function TagsPage() {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      try {
        const bookmarkRepository = RepositoryFactory.getBookmarkRepository();
        const bookmarks = await bookmarkRepository.getAll();
        const tags = getAllUniqueTags(bookmarks);
        
        setAllTags(tags);
        setFilteredTags(tags);
      } catch (error) {
        console.error("Error loading tags:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, []);
  
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(query)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(allTags);
    }
  }, [allTags, searchQuery]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tags</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">Loading tags...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Tags ({filteredTags.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTags.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {searchQuery ? "No tags match your search" : "No tags found"}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredTags.map(tag => (
                    <Link key={tag} href={`/tags/${tag}`} passHref>
                      <Card className="hover:bg-secondary/10 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-primary" />
                          <span>{tag}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
} 