import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { ZodiacSign } from '../services/zodiacData';

export function useZodiacData() {
  const [zodiacs, setZodiacs] = useState<ZodiacSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZodiacs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/zodiac/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch zodiacs');
        }
        const data = await response.json();
        if (data.status === 'success') {
          // ensure nakshatras is handled (already done in backend, but just in case)
          setZodiacs(data.data);
        } else {
          throw new Error(data.message || 'Error fetching data');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchZodiacs();
  }, []);

  return { zodiacs, loading, error };
}
