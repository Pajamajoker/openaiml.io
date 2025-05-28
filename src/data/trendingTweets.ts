export interface Tweet {
  tweetId: string;
  author: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  authorImage?: string;
  media?: Array<{
    type: string;
    url: string;
  }>;
}

// Function to fetch tweet IDs from the custom API
async function fetchTrendingTweetIds(): Promise<string[]> {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxWWV1ZXFxNat0ePrBFonW-KvY95RiCnoJrpc32JH3VwhfoK6adVoZ1FeF7RlKkC-4etw/exec');
    
    if (!response.ok) {
      console.warn('Failed to fetch trending tweet IDs:', response.status);
      return [];
    }

    const tweetIds = await response.json();
    
    // Validate that we got an array of strings
    if (!Array.isArray(tweetIds)) {
      console.warn('Invalid response format from trending tweets API');
      return [];
    }

    return tweetIds;
  } catch (error) {
    console.error('Error fetching trending tweet IDs:', error);
    return [];
  }
}

// Export the function to be used in index.astro
export { fetchTrendingTweetIds }; 