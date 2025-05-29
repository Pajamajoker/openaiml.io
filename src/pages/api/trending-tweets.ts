import type { APIRoute } from 'astro';
import { fetchTrendingTweetIds } from '@/data/trendingTweets';
import { fetchTweetData } from '@/utils/twitter';

export const GET: APIRoute = async () => {
  try {
    console.log('Fetching trending tweet IDs...');
    const trendingTweetIds = await fetchTrendingTweetIds();
    console.log('Received tweet IDs:', trendingTweetIds);
    
    if (trendingTweetIds.length === 0) {
      console.log('No tweet IDs found');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    console.log('Fetching tweet data...');
    const trendingTweets = await Promise.all(
      trendingTweetIds.map((id: string) => {
        const username = id.includes('/') ? id.split('/')[0] : '';
        const tweetId = id.includes('/') ? id.split('/')[1] : id;
        console.log(`Processing tweet: ${tweetId} from user: ${username}`);
        return fetchTweetData(tweetId, username);
      })
    );

    // Filter out any null tweets
    const validTweets = trendingTweets.filter((tweet): tweet is NonNullable<typeof tweet> => tweet !== null);
    console.log('Valid tweets:', validTweets);

    return new Response(JSON.stringify(validTweets), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in trending-tweets API:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tweets' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}; 