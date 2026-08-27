import { useCallback, useEffect, useState } from 'react';
import { ClothingItem } from './types';
import { authFetch } from '../auth/authFetch';

// The wardrobe grid: all of the user's clothing items, plus bulk upload + delete.
export function useClothingItems() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        authFetch('/api/clothing-items')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load wardrobe');
                return res.json();
            })
            .then((data: ClothingItem[]) => setItems(data))
            .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const remove = useCallback(async (id: number) => {
        await authFetch(`/api/clothing-items/${id}`, { method: 'DELETE' });
        load();
    }, [load]);

    const bulkUpload = useCallback(async (files: FileList) => {
        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('files', f));
        await authFetch('/api/clothing-items/bulk', { method: 'POST', body: fd });
        load();
    }, [load]);

    return { items, loading, error, reload: load, remove, bulkUpload };
}
