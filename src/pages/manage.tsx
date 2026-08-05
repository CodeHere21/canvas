import { useState } from 'react';
import { authFetch } from '../features/auth/authFetch';
import { BulkUploadForm } from '../features/manage';
import { useOutfits, Outfit, SEASONS, ARCHETYPES } from '../features/outfits';

function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

function OutfitManageRow({ outfit, onChanged }: { outfit: Outfit; onChanged: () => void }) {
    const [name, setName] = useState(outfit.name);
    const [seasons, setSeasons] = useState<string[]>(outfit.seasons ?? []);
    const [archetypes, setArchetypes] = useState<string[]>(outfit.archetypes ?? []);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const save = async () => {
        setSaving(true);
        setSaved(false);
        await authFetch(`/api/outfits-management/${outfit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, seasons, archetypes }),
        });
        setSaving(false);
        setSaved(true);
        onChanged();
    };

    const remove = async () => {
        await authFetch(`/api/outfits-management/${outfit.id}`, { method: 'DELETE' });
        onChanged();
    };

    const chip = (active: boolean) =>
        `px-2 py-0.5 rounded-full text-xs font-medium transition ${
            active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <div className="flex gap-3 border-b py-3">
            <img src={outfit.imageUrl} alt={outfit.name} className="w-16 h-16 object-cover rounded flex-shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                    value={name}
                    onChange={e => { setName(e.target.value); setSaved(false); }}
                    className="border rounded px-2 py-1 text-sm w-full"
                />
                <div className="flex flex-wrap gap-1">
                    {SEASONS.map(s => (
                        <button key={s} onClick={() => { setSeasons(prev => toggle(prev, s)); setSaved(false); }} className={chip(seasons.includes(s))}>{s}</button>
                    ))}
                    <span className="w-px bg-gray-200 mx-1" />
                    {ARCHETYPES.map(a => (
                        <button key={a} onClick={() => { setArchetypes(prev => toggle(prev, a)); setSaved(false); }} className={chip(archetypes.includes(a))}>{a}</button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button onClick={save} disabled={saving} className="text-xs bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50">
                    {saving ? '…' : saved ? 'Saved ✓' : 'Save'}
                </button>
                <button onClick={remove} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
            </div>
        </div>
    );
}

export default function Manage() {
    const { outfits, loading, error, reload } = useOutfits();
    const [query, setQuery] = useState('');

    const shown = query.trim()
        ? outfits.filter(o => o.name.toLowerCase().includes(query.trim().toLowerCase()))
        : outfits;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Manage</h1>

            <div className="mb-6">
                <BulkUploadForm onUploaded={reload} />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3 gap-3">
                    <h3 className="font-semibold">Your outfits {outfits.length > 0 && <span className="text-gray-400 font-normal">({outfits.length})</span>}</h3>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search…"
                        className="border rounded px-3 py-1 text-sm"
                    />
                </div>

                {loading && <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>}
                {error && <p className="text-sm text-red-500 py-6 text-center">{error}</p>}
                {!loading && !error && shown.length === 0 && (
                    <p className="text-sm text-gray-400 py-6 text-center">
                        {outfits.length === 0 ? 'Nothing yet — upload some photos above.' : 'No matches.'}
                    </p>
                )}
                {!loading && !error && shown.map(o => (
                    <OutfitManageRow key={o.id} outfit={o} onChanged={reload} />
                ))}
            </div>
        </div>
    );
}
