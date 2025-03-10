import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RepositoryFactory } from "@/lib/repositories";
import { toast } from "sonner";

interface CommentFormProps {
  bookmarkId: number;
  onSuccess?: () => void;
}

export function CommentForm({ bookmarkId, onSuccess }: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Comment text is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const commentRepository = RepositoryFactory.getCommentRepository();
      
      await commentRepository.add({
        bookmarkId,
        text,
        timestamp: new Date(),
      });
      
      toast.success("Comment added successfully");
      
      // Reset form
      setText("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Comment</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment about how you might use this inspiration..."
            className="resize-none"
            rows={4}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 