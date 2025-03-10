/**
 * Converts a file to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Handles pasting media from clipboard
 */
export const handlePaste = async (e: ClipboardEvent): Promise<{ type: 'image' | 'video', data: string } | null> => {
  if (!e.clipboardData) return null;
  
  const items = e.clipboardData.items;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Handle images
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (!file) continue;
      
      const base64 = await fileToBase64(file);
      return { type: 'image', data: base64 };
    }
    
    // Handle videos
    if (item.type.indexOf('video') !== -1) {
      const file = item.getAsFile();
      if (!file) continue;
      
      const base64 = await fileToBase64(file);
      return { type: 'video', data: base64 };
    }
  }
  
  return null;
};

/**
 * Handles file drop events
 */
export const handleDrop = async (e: DragEvent): Promise<{ type: 'image' | 'video', data: string }[]> => {
  e.preventDefault();
  
  const results: { type: 'image' | 'video', data: string }[] = [];
  
  if (!e.dataTransfer) return results;
  
  const files = e.dataTransfer.files;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (file.type.indexOf('image') !== -1) {
      const base64 = await fileToBase64(file);
      results.push({ type: 'image', data: base64 });
    } else if (file.type.indexOf('video') !== -1) {
      const base64 = await fileToBase64(file);
      results.push({ type: 'video', data: base64 });
    }
  }
  
  return results;
}; 