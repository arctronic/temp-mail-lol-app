
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useEmail } from "@/contexts/EmailContext";

export const EmailRefreshControl = () => {
  const { refetch } = useEmail();
  const [progress, setProgress] = useState(100);
  const [isRefetching, setIsRefetching] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isUserActive, setIsUserActive] = useState(true);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  const REFRESH_INTERVAL = 30; // 30 seconds

  const handleRefetch = async () => {
    if (!isUserActive) return;
    setIsRefetching(true);
    setProgress(0);
    setCountdown(REFRESH_INTERVAL);
    await refetch();
    setTimeout(() => {
      setIsRefetching(false);
      setProgress(100);
    }, 5000);
  };

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const updateLastActivity = () => {
      lastActivity = Date.now();
      setIsUserActive(true);
    };

    const checkActivity = () => {
      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT) {
        setIsUserActive(false);
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    inactivityTimer = setInterval(checkActivity, 60000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(inactivityTimer);
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let countdownId: NodeJS.Timeout | undefined;
    
    if (isRefetching) {
      intervalId = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 0.33; // Adjusted for 30 seconds
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);

      countdownId = setInterval(() => {
        setCountdown((prev) => prev > 0 ? prev - 1 : REFRESH_INTERVAL);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (countdownId) clearInterval(countdownId);
    };
  }, [isRefetching]);

  useEffect(() => {
    if (!isUserActive) return;

    const autoRefreshInterval = setInterval(() => {
      handleRefetch();
    }, REFRESH_INTERVAL * 1000);

    return () => clearInterval(autoRefreshInterval);
  }, [isUserActive]);

  return (
    <div className="space-y-2" role="region" aria-label="Email refresh control">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefetch}
          disabled={isRefetching || !isUserActive}
          aria-label={isRefetching ? "Refreshing inbox..." : "Refresh inbox"}
        >
          <RefreshCw 
            className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} 
            aria-hidden="true"
          />
          Refresh Inbox
        </Button>
        <span 
          className="text-xs sm:text-sm text-muted-foreground"
          aria-live="polite"
        >
          {!isUserActive 
            ? 'Auto-refresh paused (inactive)'
            : isRefetching 
              ? `Auto refreshing in ${countdown}s...`
              : 'Auto-refresh every 30s'}
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-1" 
        aria-label="Refresh progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      />
    </div>
  );
};
