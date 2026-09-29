import { useState } from 'react';
import { authFetch } from '../features/auth/authFetch';
import { BulkUploadForm } from '../features/manage';
import { OutfitModal, useOutfits, Outfit, SEASONS, ARCHETYPES, ARCHETYPE_LABELS } from '../features/outfits';
import { imgThumb } from '../lib/img';

function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

function OutfitManageRow({
    outfit,
    onChanged,
    selectMode,
    selected,
    onToggleSelect,
    onZoom,
}: {
    outfit: Outfit;
    onChanged: () => void;
    selectMode: boolean;
    selected: boolean;
    onToggleSelect: (id: number) => void;
    onZoom: (outfit: Outfit) => void;
}) {
    const [name, setName] = useState(outfit.name);
    const [seasons, setSeasons] = useState<string[]>(outfit.seasons ?? []);
    const [archetypes, setArchetypes] = useState<string[]>(outfit.archetypes ?? []);
    const [ownPhoto, setOwnPhoto] = useState<boolean>(outfit.ownPhoto ?? false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const save = async () => {
        setSaving(true);
        setSaved(false);
        await authFetch(`/api/outfits-management/${outfit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, seasons, archetypes, ownPhoto }),
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

    // In select mode the row becomes a big toggle: click anywhere to check/uncheck.
    const rowClick = selectMode ? () => onToggleSelect(outfit.id) : undefined;

    return (
        <div
            className={`flex gap-3 border-b py-3 ${selectMode ? 'cursor-pointer' : ''} ${selected ? 'bg-purple-50' : ''}`}
            onClick={rowClick}
        >
            {selectMode && (
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(outfit.id)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 w-5 h-5 flex-shrink-0 accent-purple-600"
                    aria-label={`Select ${outfit.name}`}
                />
            )}
            {selectMode ? (
                <img src={imgThumb(outfit.imageUrl, 200)} alt={outfit.name} loading="lazy" decoding="async" className="w-16 h-16 object-cover rounded flex-shrink-0" />
            ) : (
                <button
                    type="button"
                    onClick={() => onZoom(outfit)}
                    className="flex-shrink-0 rounded cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label={`Zoom in on ${outfit.name}`}
                    title="Click to zoom"
                >
                    <img src={imgThumb(outfit.imageUrl, 200)} alt={outfit.name} loading="lazy" decoding="async" className="w-16 h-16 object-cover rounded" />
                </button>
            )}

            {selectMode ? (
                // Compact read-only view while selecting.
                <div className="flex-1 min-w-0 flex items-center">
                    <span className="text-sm truncate">{outfit.name}</span>
                </div>
            ) : (
                <>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <input
                            value={name}
                            onChange={e => { setName(e.target.value); setSaved(false); }}
                            className="border rounded px-2 py-1 text-sm w-full"
                        />
                        <div className="flex flex-wrap gap-1">
                            {/* Which tab this shows up in: My Photos vs Pinterest. */}
                            <button
                                onClick={() => { setOwnPhoto(v => !v); setSaved(false); }}
                                className={chip(ownPhoto)}
                                title={ownPhoto ? 'Shows in My Photos' : 'Shows in Pinterest'}
                            >
                                {ownPhoto ? '📷 My photo' : 'Inspiration'}
                            </button>
                            <span className="w-px bg-gray-200 mx-1" />
                            {SEASONS.map(s => (
                                <button key={s} onClick={() => { setSeasons(prev => toggle(prev, s)); setSaved(false); }} className={chip(seasons.includes(s))}>{s}</button>
                            ))}
                            <span className="w-px bg-gray-200 mx-1" />
                            {ARCHETYPES.map(a => (
                                <button key={a} onClick={() => { setArchetypes(prev => toggle(prev, a)); setSaved(false); }} className={chip(archetypes.includes(a))}>{ARCHETYPE_LABELS[a]}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <button onClick={save} disabled={saving} className="text-xs bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50">
                            {saving ? '…' : saved ? 'Saved ✓' : 'Save'}
                        </button>
                        <button onClick={remove} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Manage() {
    const { outfits, loading, error, reload } = useOutfits();
    const [query, setQuery] = useState('');
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [zoomed, setZoomed] = useState<Outfit | null>(null);

    const shown = query.trim()
        ? outfits.filter(o => o.name.toLowerCase().includes(query.trim().toLowerCase()))
        : outfits;

    const toggleSelect = (id: number) =>
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const selectAllShown = () => setSelectedIds(new Set(shown.map(o => o.id)));
    const clearSelection = () => setSelectedIds(new Set());

    const exitSelectMode = () => { setSelectMode(false); clearSelection(); };

    const deleteSelected = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        if (!window.confirm(`Delete ${ids.length} outfit${ids.length === 1 ? '' : 's'} permanently? This can't be undone.`)) return;
        setDeleting(true);
        try {
            await authFetch('/api/outfits-management/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ids),
            });
            reload();
            exitSelectMode();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Manage</h1>

            <div className="mb-6">
                <BulkUploadForm onUploaded={reload} />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h3 className="font-semibold">Your outfits {outfits.length > 0 && <span className="text-gray-400 font-normal">({outfits.length})</span>}</h3>
                    <div className="flex items-center gap-2">
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search…"
                            className="border rounded px-3 py-1 text-sm"
                        />
                        {!selectMode ? (
                            <button onClick={() => setSelectMode(true)} className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
                                Select
                            </button>
                        ) : (
                            <button onClick={exitSelectMode} className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {selectMode && (
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{selectedIds.size}</span> selected
                            <button onClick={selectAllShown} className="ml-3 text-purple-700 hover:underline">Select all shown ({shown.length})</button>
                            {selectedIds.size > 0 && <button onClick={clearSelection} className="ml-3 text-gray-500 hover:underline">Clear</button>}
                        </div>
                        <button
                            onClick={deleteSelected}
                            disabled={selectedIds.size === 0 || deleting}
                            className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition disabled:opacity-40"
                        >
                            {deleting ? 'Deleting…' : `Delete selected (${selectedIds.size})`}
                        </button>
                    </div>
                )}

                {loading && <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>}
                {error && <p className="text-sm text-red-500 py-6 text-center">{error}</p>}
                {!loading && !error && shown.length === 0 && (
                    <p className="text-sm text-gray-400 py-6 text-center">
                        {outfits.length === 0 ? 'Nothing yet — upload some photos above.' : 'No matches.'}
                    </p>
                )}
                {!loading && !error && shown.map(o => (
                    <OutfitManageRow
                        key={o.id}
                        outfit={o}
                        onChanged={reload}
                        selectMode={selectMode}
                        selected={selectedIds.has(o.id)}
                        onToggleSelect={toggleSelect}
                        onZoom={setZoomed}
                    />
                ))}
            </div>

            {/* Same zoomed view as the Pinterest tab. Deliberately no onDelete:
                each row already has its own Delete, and two delete paths would
                be one too many. */}
            <OutfitModal
                key={zoomed?.id ?? 'none'}
                outfit={zoomed}
                onClose={() => setZoomed(null)}
            />
        </div>
    );
}
