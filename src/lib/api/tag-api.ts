/**
 * Client-side API service for tags
 */
export const TagAPI = {
  /**
   * Get all unique tags
   */
  async getAll(): Promise<string[]> {
    const response = await fetch('/api/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    return response.json();
  },
  
  /**
   * Search tags
   */
  async search(query: string): Promise<string[]> {
    const response = await fetch(`/api/tags?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search tags');
    }
    return response.json();
  },
}; 