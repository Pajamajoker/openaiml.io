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

// Store tweet IDs with usernames in format "username/tweetId"
export const trendingTweetIds = [
  "karpathy/1921368644069765486", // Andrej Karpathy's tweet about joining OpenAI
  "sama/1926006829592543235",
  ]; 