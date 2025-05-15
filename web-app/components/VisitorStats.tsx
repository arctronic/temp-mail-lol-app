import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Eye } from 'lucide-react';

type VisitorStatsType = {
  total_unique_visitors: number;
  total_visits: number;
  latest_visit: string;
};

export const VisitorStats = () => {
  const [stats, setStats] = useState<VisitorStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Record this visit
    const recordVisit = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/visitor-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error recording visit:', error);
      }
    };

    // Get total visitor stats
    const getVisitorStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/total-visitors`);
        if (!response.ok) {
          throw new Error('Failed to fetch visitor statistics');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
        setError('Unable to load visitor statistics');
      } finally {
        setLoading(false);
      }
    };

    // Execute both operations
    recordVisit();
    getVisitorStats();
  }, []);

  if (loading) {
    return (
      <Card className="p-3 glass flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading visitor statistics...</p>
      </Card>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="p-3 sm:p-4 glass">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs sm:text-sm">
            <span className="font-medium">{stats.total_unique_visitors.toLocaleString()}</span> unique visitors
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-xs sm:text-sm">
            <span className="font-medium">{stats.total_visits.toLocaleString()}</span> total visits
          </span>
        </div>
      </div>
    </Card>
  );
}; 