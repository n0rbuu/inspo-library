import { Card, CardContent } from "@/components/ui/card";
import { MediaItem } from "@/lib/db";
import Image from "next/image";
import { format } from "date-fns";

interface MediaItemCardProps {
  mediaItem: MediaItem;
  onClick?: () => void;
}

export function MediaItemCard({ mediaItem, onClick }: MediaItemCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-0 relative">
        {mediaItem.type === 'image' ? (
          <div className="aspect-square relative">
            <Image
              src={mediaItem.data}
              alt={mediaItem.caption || "Image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video relative">
            <video
              src={mediaItem.data}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {mediaItem.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
            {mediaItem.caption}
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {format(mediaItem.timestamp, 'MMM d, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
} 