import { useQuery } from '@tanstack/react-query';

export type Hospital = {
  id: string;
  name: string;
  local_health_district: string;
};

// Query Keys
export const hospitalKeys = {
  all: ['hospitals'] as const,
  list: () => [...hospitalKeys.all, 'list'] as const,
};

// Fetch hospitals
export function useHospitals() {
  return useQuery({
    queryKey: hospitalKeys.list(),
    queryFn: async (): Promise<Hospital[]> => {
      const response = await fetch('/api/hospitals');

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required to fetch hospitals');
        }
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();

      // Handle error response format
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });
}
