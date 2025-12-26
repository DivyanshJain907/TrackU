import { useState, useEffect, useRef } from "react";

interface StatsData {
  users: {
    total: number;
    approved: number;
    pending: number;
  };
  teamMembers: number;
  clubs: number;
  attendance: {
    total: number;
    present: number;
    absent: number;
    excused: number;
    rate: string;
  };
}

interface UseStatsReturn {
  data: StatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isFromCache: boolean;
}

const CACHE_KEY = "admin_stats_client";
const REVALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

class StatsCache {
  private cache: StatsData | null = null;
  private timestamp: number = 0;
  private TTL: number = 5 * 60 * 1000; // 5 minutes
  private revalidationTimer: NodeJS.Timeout | null = null;
  private subscribers: Set<() => void> = new Set();

  set(data: StatsData) {
    this.cache = data;
    this.timestamp = Date.now();
    this.notifySubscribers();
  }

  get(): StatsData | null {
    if (!this.cache || Date.now() - this.timestamp > this.TTL) {
      this.cache = null;
      return null;
    }
    return this.cache;
  }

  isExpired(): boolean {
    return !this.cache || Date.now() - this.timestamp > this.TTL;
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb());
  }

  scheduleRevalidation(revalidateFn: () => void) {
    if (this.revalidationTimer) {
      clearTimeout(this.revalidationTimer);
    }
    this.revalidationTimer = setTimeout(() => {
      revalidateFn();
    }, REVALIDATION_INTERVAL);
  }

  clearTimer() {
    if (this.revalidationTimer) {
      clearTimeout(this.revalidationTimer);
    }
  }
}

const statsCache = new StatsCache();

export function useStats(token: string | null): UseStatsReturn {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isMountedRef = useRef(true);

  const fetchStats = async (fromCache = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const statsData = await response.json();

      if (isMountedRef.current) {
        setData(statsData);
        statsCache.set(statsData);
        setIsFromCache(fromCache);
        setLoading(false);

        // Schedule background revalidation
        statsCache.scheduleRevalidation(() => {
          fetchStats(false);
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setLoading(false);
      }
    }
  };

  const refetch = () => {
    setLoading(true);
    fetchStats(false);
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Try to get from cache first
    const cachedData = statsCache.get();
    if (cachedData) {
      setData(cachedData);
      setIsFromCache(true);
      setLoading(false);

      // Still revalidate in the background
      fetchStats(true);
    } else {
      // No cache, fetch fresh data
      fetchStats(false);
    }

    // Subscribe to cache updates
    const unsubscribe = statsCache.subscribe(() => {
      const updated = statsCache.get();
      if (updated && isMountedRef.current) {
        setData(updated);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      statsCache.clearTimer();
    };
  }, [token]);

  return { data, loading, error, refetch, isFromCache };
}
