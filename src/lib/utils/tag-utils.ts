/**
 * Parses a comma-separated string of tags into an array
 */
export const parseTagString = (tagString: string): string[] => {
  if (!tagString.trim()) return [];
  
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

/**
 * Converts an array of tags to a comma-separated string
 */
export const tagsToString = (tags: string[]): string => {
  return tags.join(', ');
};

/**
 * Gets all unique tags from a list of bookmarks
 */
export const getAllUniqueTags = (bookmarks: { tags: string[] }[]): string[] => {
  const tagSet = new Set<string>();
  
  bookmarks.forEach(bookmark => {
    bookmark.tags.forEach(tag => {
      tagSet.add(tag);
    });
  });
  
  return Array.from(tagSet).sort();
}; 