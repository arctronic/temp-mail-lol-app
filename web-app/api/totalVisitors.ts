import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'), // 20 requests per 10 seconds
});

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get total visits
    const totalVisits = await redis.get('total_visits') || 0;
    
    // Get unique visitors count
    const uniqueVisitors = await redis.scard('unique_visitors') || 0;
    
    // Get most recent visit timestamp
    const latestVisit = await redis.get('last_visit') || new Date().toISOString();

    const stats = {
      total_unique_visitors: uniqueVisitors,
      total_visits: totalVisits,
      latest_visit: latestVisit
    };
    
    return new Response(
      JSON.stringify(stats),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Total visitors error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 