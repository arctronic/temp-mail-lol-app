import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Server } from 'lucide-react';
import { cn } from '@/lib/utils';

type TotalRequestsType = {
  total_requests: number;
  mongo_status: string;
  message?: string;
};

interface TotalRequestsProps {
  compact?: boolean;
  className?: string;
}

export const TotalRequests = ({ compact = false, className }: TotalRequestsProps) => {
  const [stats, setStats] = useState<TotalRequestsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTotalRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/total-requests`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch total requests: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching total requests:', error);
        setError('Unable to load total requests statistics');
      } finally {
        setLoading(false);
      }
    };

    getTotalRequests();
  }, []);

  if (loading) {
    return compact ? null : (
      <Card className="p-3 glass flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading request statistics...</p>
      </Card>
    );
  }

  if (error || !stats) {
    return compact ? null : (
      <Card className="p-3 glass flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Statistics unavailable</p>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Server className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs text-muted-foreground">
          <span className="font-medium">{stats.total_requests.toLocaleString()}</span> requests
        </span>
      </div>
    );
  }

  return (
    <Card className="p-3 sm:p-4 glass">
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4 text-primary" />
        <span className="text-xs sm:text-sm">
          <span className="font-medium">{stats.total_requests.toLocaleString()}</span> total requests served
        </span>
      </div>
    </Card>
  );
}; 