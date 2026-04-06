import { QueryClient } from '@tanstack/react-query';

// Create a singleton instance of the Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 1. Only retry once to avoid spamming a broken backend
      retry: 1,
      
      // 2. Data is considered "fresh" for 5 minutes. 
      // This prevents the app from re-fetching every time you click a link.
      staleTime: 5 * 60 * 1000, 
      
      // 3. Don't re-fetch data just because the user clicked back into the tab.
      // High-traffic dashboards feel snappier this way.
      refetchOnWindowFocus: false,
      
      // 4. If the internet drops, don't try to fetch again until it's back.
      refetchOnReconnect: true,
    },
    mutations: {
      // If a "Submit Leave" or "Clock In" fails, try one more time automatically.
      retry: 1,
    },
  },
});