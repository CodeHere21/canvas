import { useMemo, useState } from 'react';
import { OutfitGrid, OutfitModal, useOutfits, Outfit } from '../features/outfits';

// Her own photos, kept apart from the saved inspiration that fills the Pinterest tab.
// Same shared pool as every other tab — the split is just the ownPhoto flag. Mark a
// photo as hers with the "My photo" toggle in Manage, or tick the box when uploading.
export default function MyPhotos() {
    const { outfits, loading, error } = useOutfits();
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Outfit | null>(null);

    const mine = useMemo(() => {
        const q = query.trim().toLowerCase();
        return outfits.filter(o => o.ownPhoto && (!q || o.name.toLowerCase().includes(q)));
    }, [outfits, query]);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">My Photos</h1>

            <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name…"
                className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 max-w-sm mb-6"
            />

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            {!loading && !error && (
                <OutfitGrid
                    outfits={mine}
                    onSelect={setSelected}
                    emptyMessage={
                        query.trim()
                            ? 'No photos match.'
                            : 'Nothing here yet — tick “These are my own photos” when uploading in Manage, or use the “My photo” toggle on an existing one.'
                    }
                />
            )}

            <OutfitModal
                key={selected?.id ?? 'none'}
                outfit={selected}
                onClose={() => setSelected(null)}
                enableItemLink
            />
        </div>
    );
}
