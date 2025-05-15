import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { NextResponse } from 'next/server';

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

    // Get current time
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Create a unique visitor ID using IP + day (for privacy, only track by day not exact time)
    const visitorDay = `${ip}:${now.toISOString().slice(0, 10)}`;
    
    // Update visitor stats
    // 1. Increment total visit count
    const totalVisits = await redis.incr('total_visits');
    
    // 2. Add to unique visitors set if this IP hasn't been seen today
    const isNewDailyVisitor = await redis.sadd('daily_visitors', visitorDay);
    
    // 3. Add to all-time unique visitors
    await redis.sadd('unique_visitors', ip);
    const uniqueVisitors = await redis.scard('unique_visitors');
    
    // 4. Update last visit timestamp
    await redis.set(`last_visit:${ip}`, timestamp);
    await redis.set('last_visit', timestamp);
    
    // Get visitor history for this IP
    const firstVisit = await redis.get(`first_visit:${ip}`) || timestamp;
    if (!await redis.exists(`first_visit:${ip}`)) {
      await redis.set(`first_visit:${ip}`, timestamp);
    }
    
    // Track visit count for this specific IP
    const ipVisitCount = await redis.incr(`visits:${ip}`);
    
    return new Response(
      JSON.stringify({
        ip_address: ip,
        total_visits: ipVisitCount,
        first_visit: firstVisit,
        last_visit: timestamp
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Visitor stats error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 