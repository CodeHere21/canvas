import { useCallback, useEffect, useState } from 'react';
import { Collection } from '../outfits';
import { authFetch } from '../auth/authFetch';

// Lists the user's collections, plus create/delete.
export function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        authFetch('/api/collections')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load collections');
                return res.json();
            })
            .then((data: Collection[]) => setCollections(data))
            .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const create = useCallback(async (name: string) => {
        await authFetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        load();
    }, [load]);

    const remove = useCallback(async (id: number) => {
        await authFetch(`/api/collections/${id}`, { method: 'DELETE' });
        load();
    }, [load]);

    return { collections, loading, error, reload: load, create, remove };
}
