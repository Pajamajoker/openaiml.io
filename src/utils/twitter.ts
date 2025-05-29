import type { Tweet } from "@/data/trendingTweets";

interface OEmbedResponse {
  html: string;
  author_name: string;
  url: string;
  created_at?: string;
}

// Cache to store tweet data and prevent repeated scraping
const tweetCache = new Map<string, { tweet: Tweet; timestamp: string }>();

// Constants for request configuration
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

/**
 * Fetches tweet data using Twitter's oEmbed API
 */
async function fetchTweetData(tweetId: string, username?: string): Promise<Tweet | null> {
  // If no username is provided, try to extract it from the tweet ID
  if (!username) {
    console.warn('No username provided for tweet', tweetId);
    // Try to fetch the tweet without username first
    try {
      const url = `https://publish.twitter.com/oembed?url=https://twitter.com/i/status/${tweetId}&omit_script=true&dnt=true&theme=dark&hide_media=false&cards=true&widget_type=tweet`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': USER_AGENT
        }
      });

      if (response.ok) {
        const data = await response.json() as OEmbedResponse;
        return {
          tweetId,
          author: data.author_name,
          authorHandle: data.author_name.split(' ')[0].toLowerCase(), // Best guess at handle
          content: cleanHtmlContent(data.html),
          timestamp: data.created_at ? formatTimestamp(new Date(data.created_at)) : 'recent',
          likes: 0,
          retweets: 0,
          authorImage: '',
          media: []
        };
      }
    } catch (error) {
      console.error(`Error fetching tweet ${tweetId} without username:`, error);
    }
    return null;
  }

  try {
    // Check cache first
    const cacheKey = `${username}/${tweetId}`;
    const cachedData = tweetCache.get(cacheKey);
    
    if (cachedData && Date.now() - parseInt(cachedData.timestamp) < CACHE_DURATION) {
      console.log(`Using cached data for tweet ${tweetId}`);
      return cachedData.tweet;
    }

    // Fetch oEmbed data
    const oEmbedData = await fetchOEmbedData(tweetId, username);
    if (!oEmbedData) {
      return null;
    }

    const tweet: Tweet = {
      tweetId,
      author: oEmbedData.author_name,
      authorHandle: username,
      content: cleanHtmlContent(oEmbedData.html),
      timestamp: oEmbedData.created_at ? formatTimestamp(new Date(oEmbedData.created_at)) : 'recent',
      likes: 0,
      retweets: 0,
      authorImage: '',
      media: [] // oEmbed doesn't provide media
    };

    // Cache the tweet data with timestamp
    tweetCache.set(cacheKey, { tweet, timestamp: Date.now().toString() });
    
    return tweet;
  } catch (error) {
    console.error(`Error fetching tweet ${tweetId}:`, error);
    return null;
  }
}

/**
 * Fetches tweet data from Twitter's oEmbed API
 */
async function fetchOEmbedData(tweetId: string, username: string): Promise<OEmbedResponse | null> {
  try {
    const url = `https://publish.twitter.com/oembed?url=https://twitter.com/${username}/status/${tweetId}&omit_script=true&dnt=true&theme=dark&hide_media=false&cards=true&widget_type=tweet`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
      console.warn(`Failed to fetch oEmbed data: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as OEmbedResponse;
    return data;
  } catch (error) {
    console.error('Error fetching oEmbed data:', error);
    return null;
  }
}

/**
 * Cleans HTML content by removing tags and decoding entities
 */
function cleanHtmlContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Formats a date into a relative timestamp string
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y`;
  }
}

export { fetchTweetData }; 