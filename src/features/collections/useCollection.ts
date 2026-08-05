import { useCallback, useEffect, useState } from 'react';
import { CollectionDetail } from '../outfits';
import { authFetch } from '../auth/authFetch';

// Loads a single collection with its outfits, plus remove-outfit.
export function useCollection(id: string | undefined) {
    const [collection, setCollection] = useState<CollectionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        authFetch(`/api/collections/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load collection');
                return res.json();
            })
            .then((data: CollectionDetail) => setCollection(data))
            .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const removeOutfit = useCallback(async (outfitId: number) => {
        if (!id) return;
        await authFetch(`/api/collections/${id}/outfits/${outfitId}`, { method: 'DELETE' });
        load();
    }, [id, load]);

    return { collection, loading, error, reload: load, removeOutfit };
}
