import { useCallback, useState } from 'react';
import type { MessageKey } from '@/i18n/types';
import { loadPlaces, type City } from '@/lib/cities';

/** "Near me": the browser position, turned into the nearest Belgian locality. */
export function useLocateCity(onCity: (city: City) => void) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) return setError('search.locateFailed');
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          onCity((await loadPlaces()).nearest(pos.coords.latitude, pos.coords.longitude));
        } catch {
          setError('common.errorNetwork');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setError(err.code === err.PERMISSION_DENIED ? 'search.locateDenied' : 'search.locateFailed');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60_000 },
    );
  }, [onCity]);

  return { locate, locating, error, clearError: () => setError(null) };
}
