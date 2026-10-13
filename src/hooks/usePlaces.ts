import { useQuery } from '@tanstack/react-query';
import { loadPlaces } from '@/lib/cities';

/** Every Belgian locality, fetched once per visit (~50 kB) when first needed. */
export function usePlaces(enabled = true) {
  return useQuery({
    queryKey: ['places'],
    queryFn: loadPlaces,
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  });
}
