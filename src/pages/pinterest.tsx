import { useMemo, useState } from 'react';
import { OutfitGrid, OutfitModal, useOutfits, Outfit, Season, Archetype, SEASONS, ARCHETYPES } from '../features/outfits';
import { Randomizer } from '../features/randomizer';

function label(value: string) {
    return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function Pinterest() {
    const { outfits, loading, error } = useOutfits();
    const [season, setSeason] = useState<Season | null>(null);
    const [archetype, setArchetype] = useState<Archetype | null>(null);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Outfit | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return outfits.filter(o =>
            (!season || (o.seasons ?? []).includes(season)) &&
            (!archetype || (o.archetypes ?? []).includes(archetype)) &&
            (!q || o.name.toLowerCase().includes(q))
        );
    }, [outfits, season, archetype, query]);

    const chip = (active: boolean) =>
        `px-3 py-1 rounded-full text-sm font-medium transition ${
            active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Pinterest</h1>

            <div className="flex flex-col gap-3 mb-6">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name…"
                    className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 max-w-sm"
                />
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-400 w-16">Season</span>
                    <button onClick={() => setSeason(null)} className={chip(season === null)}>All</button>
                    {SEASONS.map(s => (
                        <button key={s} onClick={() => setSeason(s)} className={chip(season === s)}>{label(s)}</button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-400 w-16">Archetype</span>
                    <button onClick={() => setArchetype(null)} className={chip(archetype === null)}>All</button>
                    {ARCHETYPES.map(a => (
                        <button key={a} onClick={() => setArchetype(a)} className={chip(archetype === a)}>{label(a)}</button>
                    ))}
                </div>
            </div>

            <Randomizer pool={filtered} onPick={setSelected} />

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            {!loading && !error && (
                <OutfitGrid
                    outfits={filtered}
                    onSelect={setSelected}
                    emptyMessage={outfits.length === 0 ? 'No outfits yet — add some in Manage.' : 'No outfits match these filters.'}
                />
            )}

            <OutfitModal outfit={selected} onClose={() => setSelected(null)} />
        </div>
    );
}
