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
        throw new Error('Failed to fetch hospitals');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  });
}
