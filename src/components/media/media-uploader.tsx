import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RepositoryFactory } from "@/lib/repositories";
import { fileToBase64, handlePaste, handleDrop } from "@/lib/utils/media-utils";
import { toast } from "sonner";
import { Image as ImageIcon, Video, Upload, Clipboard } from "lucide-react";

interface MediaUploaderProps {
  bookmarkId: number;
  onSuccess?: () => void;
}

export function MediaUploader({ bookmarkId, onSuccess }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaData, setMediaData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  // Set up paste event listener
  useEffect(() => {
    const handlePasteEvent = async (e: ClipboardEvent) => {
      const result = await handlePaste(e);
      if (result) {
        setMediaType(result.type);
        setMediaData(result.data);
        setPreviewUrl(result.data);
        toast.success(`${result.type === 'image' ? 'Image' : 'Video'} pasted from clipboard`);
      }
    };
    
    document.addEventListener('paste', handlePasteEvent);
    
    return () => {
      document.removeEventListener('paste', handlePasteEvent);
    };
  }, []);
  
  // Set up drop event listeners
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropArea.classList.add("border-primary");
    };
    
    const handleDragLeave = () => {
      dropArea.classList.remove("border-primary");
    };
    
    const handleDropEvent = async (e: DragEvent) => {
      e.preventDefault();
      dropArea.classList.remove("border-primary");
      
      const results = await handleDrop(e);
      if (results.length > 0) {
        const firstResult = results[0];
        setMediaType(firstResult.type);
        setMediaData(firstResult.data);
        setPreviewUrl(firstResult.data);
        toast.success(`${firstResult.type === 'image' ? 'Image' : 'Video'} dropped`);
      }
    };
    
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDropEvent);
    
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDropEvent);
    };
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      setMediaType(type);
      setMediaData(base64);
      setPreviewUrl(base64);
      
      toast.success(`${type === 'image' ? 'Image' : 'Video'} selected`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file");
    }
  };
  
  const handleUpload = async () => {
    if (!mediaData || !mediaType) {
      toast.error("Please select or paste a media item first");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const mediaRepository = RepositoryFactory.getMediaRepository();
      
      await mediaRepository.add({
        bookmarkId,
        type: mediaType,
        data: mediaData,
        timestamp: new Date(),
        caption: caption || undefined,
      });
      
      toast.success("Media added successfully");
      
      // Reset form
      setCaption("");
      setPreviewUrl(null);
      setMediaType(null);
      setMediaData(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handlePasteClick = () => {
    toast.info("Press Ctrl+V or Cmd+V to paste from clipboard");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={dropAreaRef}
          className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
        >
          {previewUrl ? (
            <div className="max-h-80 overflow-hidden">
              {mediaType === 'image' ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-80 mx-auto object-contain" 
                />
              ) : (
                <video 
                  src={previewUrl} 
                  controls 
                  className="max-w-full max-h-80 mx-auto" 
                />
              )}
            </div>
          ) : (
            <div className="py-10">
              <div className="flex justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground mr-2" />
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">
                Drag and drop an image or video here, or click to select
              </p>
              <p className="text-muted-foreground text-sm">
                You can also paste from clipboard (Ctrl+V / Cmd+V)
              </p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select File
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePasteClick}
            className="flex-1"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Paste
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="caption">Caption (optional)</Label>
          <Input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption for this media"
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !mediaData}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Add Media"}
        </Button>
      </CardFooter>
    </Card>
  );
} 