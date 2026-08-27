import { useMemo, useState } from 'react';
import { OutfitGrid, OutfitModal, useOutfits, Outfit, Archetype, ARCHETYPES } from '../features/outfits';
import { authFetch } from '../features/auth/authFetch';

function label(value: string) {
    return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function Archetypes() {
    const { outfits, loading, error, reload } = useOutfits();
    const [archetype, setArchetype] = useState<Archetype | null>(null);
    const [selected, setSelected] = useState<Outfit | null>(null);

    const filtered = useMemo(
        () => (archetype ? outfits.filter(o => (o.archetypes ?? []).includes(archetype)) : outfits),
        [outfits, archetype]
    );

    // Delete on this tab = untag the currently-selected archetype (outfit stays in Pinterest).
    const removeArchetypeTag = async (outfitId: number) => {
        if (!archetype) return;
        const o = outfits.find(x => x.id === outfitId);
        if (!o) return;
        const nextArchetypes = (o.archetypes ?? []).filter(a => a !== archetype);
        await authFetch(`/api/outfits-management/${outfitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archetypes: nextArchetypes }),
        });
        reload();
    };

    const chip = (active: boolean) =>
        `px-4 py-2 rounded-full text-sm font-medium transition ${
            active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">By Archetype</h1>

            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setArchetype(null)} className={chip(archetype === null)}>All</button>
                {ARCHETYPES.map(a => (
                    <button key={a} onClick={() => setArchetype(a)} className={chip(archetype === a)}>{label(a)}</button>
                ))}
            </div>

            {archetype && (
                <p className="text-xs text-gray-400 mb-4">🗑 removes the “{label(archetype)}” tag — the outfit stays in Pinterest.</p>
            )}

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            {!loading && !error && (
                <OutfitGrid
                    outfits={filtered}
                    onSelect={setSelected}
                    onRemove={archetype ? removeArchetypeTag : undefined}
                    emptyMessage="No outfits tagged with this archetype yet."
                />
            )}

            <OutfitModal outfit={selected} onClose={() => setSelected(null)} />
        </div>
    );
}
