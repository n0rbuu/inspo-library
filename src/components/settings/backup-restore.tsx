import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BackupAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Download, Upload, HardDrive } from 'lucide-react';

export function BackupRestore() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await BackupAPI.downloadBackup();
      toast.success('Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!confirm('This will replace all your current data. Are you sure you want to continue?')) {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setIsRestoring(true);
    try {
      await BackupAPI.restoreFromBackup(file);
      toast.success('Data restored successfully');
      
      // Reload the page to reflect the restored data
      window.location.reload();
    } catch (error) {
      console.error('Error restoring data:', error);
      toast.error('Failed to restore data');
    } finally {
      setIsRestoring(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardDrive className="h-5 w-5 mr-2" />
          Backup & Restore
        </CardTitle>
        <CardDescription>
          Backup your data to a file or restore from a previous backup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Your data is stored locally on your computer. Create regular backups to prevent data loss.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBackup}
          disabled={isBackingUp || isRestoring}
        >
          <Download className="h-4 w-4 mr-2" />
          {isBackingUp ? 'Creating Backup...' : 'Download Backup'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBackingUp || isRestoring}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isRestoring ? 'Restoring...' : 'Restore from Backup'}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleRestore}
          accept=".zip"
          className="hidden"
        />
      </CardFooter>
    </Card>
  );
} 