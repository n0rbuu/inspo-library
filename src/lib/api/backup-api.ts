/**
 * Client-side API service for backup and restore
 */
export const BackupAPI = {
  /**
   * Download a backup of all data
   */
  async downloadBackup(): Promise<void> {
    // Use a direct link to trigger the download
    window.location.href = '/api/backup';
  },
  
  /**
   * Restore from a backup file
   */
  async restoreFromBackup(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/backup', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to restore from backup');
    }
  },
}; 