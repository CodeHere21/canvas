import { useCallback, useEffect, useState } from 'react';
import { ClothingItem } from './types';
import { Outfit } from '../outfits';
import { authFetch } from '../auth/authFetch';
import { Duplicate } from '../upload/bulkUpload';

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

    // Upload new photos as ideas. Returns any name-duplicates (already exist as outfits)
    // so the caller can offer link-existing / overwrite.
    const uploadNewIdea = useCallback(async (files: FileList | File[]): Promise<Duplicate[]> => {
        if (!id) return [];
        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('files', f));
        const res = await authFetch(`/api/clothing-items/${id}/outfits`, { method: 'POST', body: fd });
        if (!res.ok) return [];
        const result = await res.json() as { created: Outfit[]; duplicates?: Duplicate[] };
        setIdeas(result.created);
        return result.duplicates ?? [];
    }, [id]);

    // Overwrite an existing outfit's photo with a new upload (used when a duplicate idea
    // upload is resolved as "replace photo"). Link it to the item afterwards via linkExisting.
    const replaceIdeaPhoto = useCallback(async (existingId: number, file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        await authFetch(`/api/outfits-management/${existingId}/replace-photo`, { method: 'POST', body: fd });
    }, []);

    const removeIdea = useCallback(async (outfitId: number) => {
        if (!id) return;
        const res = await authFetch(`/api/clothing-items/${id}/outfits/${outfitId}`, { method: 'DELETE' });
        if (res.ok) setIdeas(await res.json());
    }, [id]);

    return { item, ideas, loading, error, reload: load, rename, linkExisting, uploadNewIdea, replaceIdeaPhoto, removeIdea };
}
