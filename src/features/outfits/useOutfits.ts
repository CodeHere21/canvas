import { useCallback, useEffect, useState } from 'react';
import { Outfit } from './types';
import { authFetch } from '../auth/authFetch';

// Shared in-memory cache of the whole outfit pool, so switching tabs
// (Pinterest / Archetypes / Manage / the item picker) renders instantly instead
// of refetching from scratch every time. On mount we show the cached data right
// away and quietly revalidate in the background; a mutation calls reload() to
// refresh. Cleared on login/logout via resetOutfitsCache().
let cache: Outfit[] | null = null;
const subscribers = new Set<(o: Outfit[]) => void>();

function publish(data: Outfit[]) {
    cache = data;
    subscribers.forEach(fn => fn(data));
}

async function fetchOutfits(): Promise<Outfit[]> {
    const res = await authFetch('/api/outfits-management');
    if (!res.ok) throw new Error('Failed to load outfits');
    return res.json();
}

// Call when the signed-in user changes so the next reader fetches fresh.
export function resetOutfitsCache() {
    cache = null;
}

export function useOutfits() {
    const [outfits, setOutfits] = useState<Outfit[]>(cache ?? []);
    // Only show the full-page spinner when we have nothing cached to show.
    const [loading, setLoading] = useState<boolean>(cache === null);
    const [error, setError] = useState<string | null>(null);

    const revalidate = useCallback(async (showSpinner: boolean) => {
        if (showSpinner) setLoading(true);
        setError(null);
        try {
            publish(await fetchOutfits());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const sub = (data: Outfit[]) => setOutfits(data);
        subscribers.add(sub);

        if (cache !== null) {
            setOutfits(cache);
            setLoading(false);
            revalidate(false); // instant from cache, refresh quietly
        } else {
            revalidate(true);  // first load: show spinner
        }

        return () => { subscribers.delete(sub); };
    }, [revalidate]);

    // After a mutation (add/delete/tag): refetch and update every reader.
    const reload = useCallback(() => revalidate(false), [revalidate]);

    return { outfits, loading, error, reload };
}
