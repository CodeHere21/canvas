import { useCallback, useEffect, useState } from 'react';
import { Outfit } from './types';
import { authFetch } from '../auth/authFetch';

// Fetches all of the current user's outfits (the whole pool).
// Filtering by season/archetype/name is done client-side by callers.
export function useOutfits() {
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        authFetch('/api/outfits-management')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load outfits');
                return res.json();
            })
            .then((data: Outfit[]) => setOutfits(data))
            .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { outfits, loading, error, reload: load };
}
