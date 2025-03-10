"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { BookmarkForm } from "@/components/bookmarks/bookmark-form";
import { MediaGrid } from "@/components/media/media-grid";
import { MediaUploader } from "@/components/media/media-uploader";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RepositoryFactory } from "@/lib/repositories";
import { Bookmark, MediaItem } from "@/lib/db";
import { toast } from "sonner";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface BookmarkPageProps {
  params: {
    id: string;
  };
}

export default function BookmarkPage({ params }: BookmarkPageProps) {
  const router = useRouter();
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Parse the ID in useEffect to avoid synchronous access issues
  useEffect(() => {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      toast.error("Invalid bookmark ID");
      router.push("/bookmarks");
      return;
    }
    setBookmarkId(id);
  }, [params.id, router]);
  
  const loadBookmark = async () => {
    if (bookmarkId === null) return;
    
    setIsLoading(true);
    try {
      const bookmarkRepository = RepositoryFactory.getBookmarkRepository();
      const mediaRepository = RepositoryFactory.getMediaRepository();
      
      const bookmarkData = await bookmarkRepository.getById(bookmarkId);
      if (!bookmarkData) {
        toast.error("Bookmark not found");
        router.push("/bookmarks");
        return;
      }
      
      setBookmark(bookmarkData);
      
      const media = await mediaRepository.getByBookmarkId(bookmarkId);
      setMediaItems(media);
    } catch (error) {
      console.error("Error loading bookmark:", error);
      toast.error("Failed to load bookmark");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load bookmark when bookmarkId is set
  useEffect(() => {
    if (bookmarkId !== null) {
      loadBookmark();
    }
  }, [bookmarkId]);
  
  const handleDelete = async () => {
    if (!bookmark || bookmarkId === null) return;
    
    if (!confirm("Are you sure you want to delete this bookmark? This will also delete all associated media and comments.")) {
      return;
    }
    
    try {
      const bookmarkRepository = RepositoryFactory.getBookmarkRepository();
      await bookmarkRepository.delete(bookmarkId);
      
      toast.success("Bookmark deleted successfully");
      router.push("/bookmarks");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("Failed to delete bookmark");
    }
  };
  
  const handleRefresh = () => {
    loadBookmark();
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (isLoading || bookmarkId === null) {
    return (
      <MainLayout>
        <div className="text-center py-12">Loading bookmark...</div>
      </MainLayout>
    );
  }
  
  if (!bookmark) {
    return (
      <MainLayout>
        <div className="text-center py-12">Bookmark not found</div>
      </MainLayout>
    );
  }
  
  if (isEditing) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Bookmark</h1>
          <BookmarkForm 
            bookmark={bookmark} 
            onSuccess={() => {
              setIsEditing(false);
              loadBookmark();
            }} 
          />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{bookmark.title}</h1>
            {bookmark.url && (
              <a 
                href={bookmark.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center mt-2"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {bookmark.url}
              </a>
            )}
            <div className="flex flex-wrap gap-1 mt-3">
              {bookmark.tags.map(tag => (
                <Link key={tag} href={`/tags/${tag}`} passHref>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="media" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media">Media ({mediaItems.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="media" className="space-y-6">
            <MediaUploader bookmarkId={bookmarkId} onSuccess={handleRefresh} />
            
            <Card>
              <CardHeader>
                <CardTitle>Media Items</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaGrid mediaItems={mediaItems} linkToBookmark={false} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-6">
            <CommentForm bookmarkId={bookmarkId} onSuccess={handleRefresh} />
            <CommentList bookmarkId={bookmarkId} refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 