import { useState } from 'react';
import { Outfit, Collection } from './types';
import { authFetch } from '../auth/authFetch';
import { imgThumb } from '../../lib/img';

interface WardrobeItemLite {
    id: number;
    name: string;
    imageUrl: string;
}

interface Props {
    outfit: Outfit | null;
    onClose: () => void;
    // Provided only when opened from within a collection → shows "Remove from collection".
    onRemoveFromCollection?: (outfitId: number) => void;
    // Provided only when opened from a wardrobe item's page → shows "Remove from this item".
    onRemoveFromItem?: (outfitId: number) => void;
    // Hide the "Add to collection" action (e.g. on a wardrobe item's page).
    hideCollections?: boolean;
    // Provided from Pinterest → shows a "Randomize" button that swaps to a new outfit.
    onRandomize?: () => void;
    // Provided from Pinterest → shows a trash button that permanently deletes the outfit.
    onDelete?: (outfitId: number) => void | Promise<void>;
    // When true, shows "Add to a wardrobe item" (links this outfit as that item's idea).
    enableItemLink?: boolean;
}

type Mode = 'none' | 'collection' | 'item';

// Zoomed outfit view. Depending on context it can add to a collection, link to a
// wardrobe item, re-randomize, or delete.
export default function OutfitModal({
    outfit,
    onClose,
    onRemoveFromCollection,
    onRemoveFromItem,
    hideCollections,
    onRandomize,
    onDelete,
    enableItemLink,
}: Props) {
    const [mode, setMode] = useState<Mode>('none');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [items, setItems] = useState<WardrobeItemLite[]>([]);
    const [newName, setNewName] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!outfit) return null;

    const openCollectionPicker = async () => {
        setMode('collection');
        setStatus(null);
        try {
            const res = await authFetch('/api/collections');
            if (res.ok) setCollections(await res.json());
        } catch {
            /* non-fatal */
        }
    };

    const openItemPicker = async () => {
        setMode('item');
        setStatus(null);
        try {
            const res = await authFetch('/api/clothing-items');
            if (res.ok) setItems(await res.json());
        } catch {
            /* non-fatal */
        }
    };

    const addToCollection = async (collectionId: number, label: string) => {
        setBusy(true);
        try {
            const res = await authFetch(`/api/collections/${collectionId}/outfits/${outfit.id}`, { method: 'POST' });
            if (!res.ok) throw new Error();
            setStatus(`Added to “${label}”`);
            setMode('none');
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
            await addToCollection(created.id, created.name);
        } catch {
            setStatus('Could not create collection');
            setBusy(false);
        }
    };

    const linkToItem = async (itemId: number, label: string) => {
        setBusy(true);
        try {
            const res = await authFetch(`/api/clothing-items/${itemId}/outfits/${outfit.id}`, { method: 'POST' });
            if (!res.ok) throw new Error();
            setStatus(`Added to “${label}”`);
            setMode('none');
        } catch {
            setStatus('Could not link — try again');
        } finally {
            setBusy(false);
        }
    };

    const doDelete = async () => {
        if (!onDelete) return;
        setBusy(true);
        try {
            await onDelete(outfit.id); // parent closes the modal + refreshes
        } finally {
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
                {onDelete && (
                    <button
                        onClick={() => { setConfirmDelete(true); setMode('none'); }}
                        className="absolute top-2 left-2 bg-white/80 rounded-full w-8 h-8 shadow z-10 hover:bg-red-50"
                        aria-label="Delete outfit"
                        title="Delete permanently"
                    >
                        🗑
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 text-black font-bold shadow z-10"
                    aria-label="Close"
                >
                    ✕
                </button>

                <img src={imgThumb(outfit.imageUrl, 1000)} alt={outfit.name} className="w-full max-h-[70vh] object-contain bg-gray-50" />

                <div className="p-5">
                    <h2 className="text-xl font-bold mb-3 text-center">{outfit.name}</h2>

                    {status && <p className="text-center text-sm text-purple-700 mb-3">{status}</p>}

                    {confirmDelete ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-center text-gray-700">Delete this outfit permanently? This removes it everywhere.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    disabled={busy}
                                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={doDelete}
                                    disabled={busy}
                                    className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                                >
                                    {busy ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ) : mode === 'none' ? (
                        <div className="flex flex-col gap-2">
                            {!hideCollections && (
                                <button
                                    onClick={openCollectionPicker}
                                    className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
                                >
                                    + Add to collection
                                </button>
                            )}
                            {enableItemLink && (
                                <button
                                    onClick={openItemPicker}
                                    className="bg-purple-100 text-purple-700 px-5 py-2 rounded-lg hover:bg-purple-200 transition"
                                >
                                    + Add to a wardrobe item
                                </button>
                            )}
                            {onRandomize && (
                                <button
                                    onClick={onRandomize}
                                    className="border border-purple-300 text-purple-700 px-5 py-2 rounded-lg hover:bg-purple-50 transition"
                                >
                                    🎲 Randomize
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
                    ) : mode === 'collection' ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-500">Choose a collection</p>
                            <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                                {collections.map(c => (
                                    <button
                                        key={c.id}
                                        disabled={busy}
                                        onClick={() => addToCollection(c.id, c.name)}
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
                            <button onClick={() => setMode('none')} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-500">Add as an outfit idea for…</p>
                            <div className="max-h-52 overflow-y-auto flex flex-col gap-1">
                                {items.map(it => (
                                    <button
                                        key={it.id}
                                        disabled={busy}
                                        onClick={() => linkToItem(it.id, it.name)}
                                        className="flex items-center gap-3 text-left px-2 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50"
                                    >
                                        <img src={imgThumb(it.imageUrl, 100)} alt={it.name} loading="lazy" className="w-9 h-9 object-cover rounded flex-shrink-0" />
                                        <span className="truncate">{it.name}</span>
                                    </button>
                                ))}
                                {items.length === 0 && (
                                    <p className="text-xs text-gray-400">No wardrobe items yet — add some in the Wardrobe tab.</p>
                                )}
                            </div>
                            <button onClick={() => setMode('none')} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
