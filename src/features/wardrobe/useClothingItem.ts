import { useCallback, useEffect, useState } from 'react';
import { ClothingItem } from './types';
import { Outfit } from '../outfits';
import { authFetch } from '../auth/authFetch';

// A single wardrobe item + its outfit ideas (linked outfits), with mutations.
// The link/upload/remove endpoints return the updated ideas list.
export function useClothingItem(id: string | undefined) {
    const [item, setItem] = useState<ClothingItem | null>(null);
    const [ideas, setIdeas] = useState<Outfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        Promise.all([
            authFetch(`/api/clothing-items/${id}`).then(r => (r.ok ? r.json() : Promise.reject(new Error('Item not found')))),
            authFetch(`/api/clothing-items/${id}/outfits`).then(r => (r.ok ? r.json() : Promise.reject(new Error('Failed to load ideas')))),
        ])
            .then(([it, outs]: [ClothingItem, Outfit[]]) => { setItem(it); setIdeas(outs); })
            .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const rename = useCallback(async (name: string) => {
        if (!id) return;
        const res = await authFetch(`/api/clothing-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (res.ok) setItem(await res.json());
    }, [id]);

    const linkExisting = useCallback(async (outfitId: number) => {
        if (!id) return;
        const res = await authFetch(`/api/clothing-items/${id}/outfits/${outfitId}`, { method: 'POST' });
        if (res.ok) setIdeas(await res.json());
    }, [id]);

    const uploadNewIdea = useCallback(async (files: FileList | File[]) => {
        if (!id) return;
        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('files', f));
        const res = await authFetch(`/api/clothing-items/${id}/outfits`, { method: 'POST', body: fd });
        if (res.ok) setIdeas(await res.json());
    }, [id]);

    const removeIdea = useCallback(async (outfitId: number) => {
        if (!id) return;
        const res = await authFetch(`/api/clothing-items/${id}/outfits/${outfitId}`, { method: 'DELETE' });
        if (res.ok) setIdeas(await res.json());
    }, [id]);

    return { item, ideas, loading, error, reload: load, rename, linkExisting, uploadNewIdea, removeIdea };
}
