import { useState } from 'react';
import { Outfit, Collection } from './types';
import { authFetch } from '../auth/authFetch';

interface Props {
    outfit: Outfit | null;
    onClose: () => void;
    // Provided only when opened from within a collection → shows "Remove from collection".
    onRemoveFromCollection?: (outfitId: number) => void;
    // Provided only when opened from a wardrobe item's page → shows "Remove from this item".
    onRemoveFromItem?: (outfitId: number) => void;
    // Hide the "Add to collection" action (e.g. on a wardrobe item's page).
    hideCollections?: boolean;
}

// View-only zoom of an outfit, plus (optionally) an "Add to collection" action.
// Opening it records nothing.
export default function OutfitModal({ outfit, onClose, onRemoveFromCollection, onRemoveFromItem, hideCollections }: Props) {
    const [picking, setPicking] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [newName, setNewName] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (!outfit) return null;

    const openPicker = async () => {
        setPicking(true);
        setStatus(null);
        try {
            const res = await authFetch('/api/collections');
            if (res.ok) setCollections(await res.json());
        } catch {
            /* non-fatal */
        }
    };

    const addTo = async (collectionId: number, label: string) => {
        setBusy(true);
        try {
            const res = await authFetch(`/api/collections/${collectionId}/outfits/${outfit.id}`, { method: 'POST' });
            if (!res.ok) throw new Error();
            setStatus(`Added to “${label}”`);
            setPicking(false);
        } catch {
            setStatus('Could not add — try again');
        } finally {
            setBusy(false);
        }
    };

    const createAndAdd = async () => {
        const name = newName.trim();
        if (!name) return;
        setBusy(true);
        try {
            const res = await authFetch('/api/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error();
            const created: Collection = await res.json();
            setNewName('');
            await addTo(created.id, created.name);
        } catch {
            setStatus('Could not create collection');
            setBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 text-black font-bold shadow z-10"
                    aria-label="Close"
                >
                    ✕
                </button>

                <img src={outfit.imageUrl} alt={outfit.name} className="w-full max-h-[70vh] object-contain bg-gray-50" />

                <div className="p-5">
                    <h2 className="text-xl font-bold mb-3 text-center">{outfit.name}</h2>

                    {status && <p className="text-center text-sm text-purple-700 mb-3">{status}</p>}

                    {!picking ? (
                        <div className="flex flex-col gap-2">
                            {!hideCollections && (
                                <button
                                    onClick={openPicker}
                                    className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
                                >
                                    + Add to collection
                                </button>
                            )}
                            {onRemoveFromCollection && (
                                <button
                                    onClick={() => onRemoveFromCollection(outfit.id)}
                                    className="text-sm text-gray-500 hover:text-red-600"
                                >
                                    Remove from this collection
                                </button>
                            )}
                            {onRemoveFromItem && (
                                <button
                                    onClick={() => onRemoveFromItem(outfit.id)}
                                    className="text-sm text-gray-500 hover:text-red-600"
                                >
                                    Remove from this item
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-500">Choose a collection</p>
                            <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                                {collections.map(c => (
                                    <button
                                        key={c.id}
                                        disabled={busy}
                                        onClick={() => addTo(c.id, c.name)}
                                        className="text-left px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50"
                                    >
                                        {c.name} <span className="text-gray-400">({c.outfitCount})</span>
                                    </button>
                                ))}
                                {collections.length === 0 && (
                                    <p className="text-xs text-gray-400">No collections yet — create one below.</p>
                                )}
                            </div>
                            <div className="flex gap-2 mt-1">
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="New collection name"
                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                />
                                <button
                                    onClick={createAndAdd}
                                    disabled={busy || !newName.trim()}
                                    className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>
                            <button onClick={() => setPicking(false)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
