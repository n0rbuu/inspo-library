import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comment } from "@/lib/db";
import { RepositoryFactory } from "@/lib/repositories";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface CommentListProps {
  bookmarkId: number;
  refreshTrigger?: number;
}

export function CommentList({ bookmarkId, refreshTrigger = 0 }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const commentRepository = RepositoryFactory.getCommentRepository();
        const bookmarkComments = await commentRepository.getByBookmarkId(bookmarkId);
        
        // Sort comments by timestamp (newest first)
        const sortedComments = bookmarkComments.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setComments(sortedComments);
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadComments();
  }, [bookmarkId, refreshTrigger]);
  
  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }
  
  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No comments yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">
              {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
            </div>
            <div className="whitespace-pre-wrap">{comment.text}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 