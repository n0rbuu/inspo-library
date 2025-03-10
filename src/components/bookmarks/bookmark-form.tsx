import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark } from "@/lib/db";
import { RepositoryFactory } from "@/lib/repositories";
import { parseTagString } from "@/lib/utils/tag-utils";
import { toast } from "sonner";

interface BookmarkFormProps {
  bookmark?: Bookmark;
  onSuccess?: () => void;
}

export function BookmarkForm({ bookmark, onSuccess }: BookmarkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(bookmark?.title || "");
  const [url, setUrl] = useState(bookmark?.url || "");
  const [tags, setTags] = useState(bookmark?.tags.join(", ") || "");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Title is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const bookmarkRepository = RepositoryFactory.getBookmarkRepository();
      const parsedTags = parseTagString(tags);
      
      if (bookmark?.id) {
        // Update existing bookmark
        await bookmarkRepository.update(bookmark.id, {
          title,
          url: url || undefined,
          tags: parsedTags,
        });
        
        toast.success("Bookmark updated successfully");
      } else {
        // Create new bookmark
        const newBookmarkId = await bookmarkRepository.add({
          title,
          url: url || undefined,
          dateAdded: new Date(),
          tags: parsedTags,
        });
        
        toast.success("Bookmark created successfully");
        
        // Navigate to the home page with the library tab selected
        router.push(`/?tab=library`);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast.error("Failed to save bookmark");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{bookmark ? "Edit Bookmark" : "Add New Bookmark"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter bookmark title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Textarea
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="design, react, shadcn"
              className="resize-none"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : bookmark ? "Update Bookmark" : "Create Bookmark"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 