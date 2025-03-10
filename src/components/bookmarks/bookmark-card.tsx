import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <Link href={`/bookmarks/${bookmark.id}`} className="hover:underline">
            {bookmark.title}
          </Link>
          {bookmark.url && (
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{format(bookmark.dateAdded, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {bookmark.tags.map((tag) => (
            <Link key={tag} href={`/?tab=library&tag=${encodeURIComponent(tag)}`} passHref>
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/bookmarks/${bookmark.id}`} className="text-sm text-primary hover:underline">
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
} 