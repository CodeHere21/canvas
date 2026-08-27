import { ChangeEvent, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClothingItem } from '../features/wardrobe';
import { OutfitGrid, OutfitModal, useOutfits, Outfit } from '../features/outfits';

// Picker overlay: choose an existing Pinterest outfit to link to this item.
function PinterestPicker({
    excludeIds,
    onPick,
    onClose,
}: {
    excludeIds: number[];
    onPick: (outfitId: number) => void;
    onClose: () => void;
}) {
    const { outfits, loading } = useOutfits();
    const available = outfits.filter(o => !excludeIds.includes(o.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Add from Pinterest</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {loading && <p className="text-center text-gray-400 py-6">Loading…</p>}
                    {!loading && available.length === 0 && (
                        <p className="text-center text-gray-400 py-6">No more outfits to add.</p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {available.map(o => (
                            <button
                                key={o.id}
                                onClick={() => onPick(o.id)}
                                className="rounded-lg overflow-hidden shadow hover:ring-2 hover:ring-purple-500 transition"
                                title={o.name}
                            >
                                <img src={o.imageUrl} alt={o.name} className="w-full h-28 object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-3 border-t text-right">
                    <button onClick={onClose} className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">Done</button>
                </div>
            </div>
        </div>
    );
}

export default function ItemDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { item, ideas, loading, error, rename, linkExisting, uploadNewIdea, removeIdea } = useClothingItem(id);
    const [selected, setSelected] = useState<Outfit | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [picking, setPicking] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const startEditName = () => { setNameDraft(item?.name ?? ''); setEditingName(true); };
    const saveName = async () => {
        const n = nameDraft.trim();
        if (n) await rename(n);
        setEditingName(false);
    };

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setUploading(true);
        await uploadNewIdea(f);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleRemove = async (outfitId: number) => {
        await removeIdea(outfitId);
        setSelected(null);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <button onClick={() => navigate('/wardrobe')} className="text-sm text-gray-500 hover:text-purple-600 mb-4">
                ← Back to wardrobe
            </button>

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}

            {!loading && !error && item && (
                <>
                    <div className="flex items-center gap-4 mb-6">
                        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                        {editingName ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    autoFocus
                                    value={nameDraft}
                                    onChange={e => setNameDraft(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveName()}
                                    className="border rounded px-2 py-1 text-lg"
                                />
                                <button onClick={saveName} className="text-sm bg-purple-600 text-white px-3 py-1 rounded">Save</button>
                                <button onClick={() => setEditingName(false)} className="text-sm text-gray-400">Cancel</button>
                            </div>
                        ) : (
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {item.name}
                                <button onClick={startEditName} className="text-gray-400 hover:text-purple-600 text-sm" title="Rename">✏️</button>
                            </h1>
                        )}
                    </div>

                    <h2 className="font-semibold mb-3">Outfit ideas</h2>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <label className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-purple-700 transition">
                            {uploading ? 'Uploading…' : '+ Upload photo'}
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                        </label>
                        <button onClick={() => setPicking(true)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">
                            + Add from Pinterest
                        </button>
                    </div>

                    <OutfitGrid
                        outfits={ideas}
                        onSelect={setSelected}
                        onRemove={removeIdea}
                        emptyMessage="No outfit ideas yet — upload a photo or add one from Pinterest."
                    />
                </>
            )}

            <OutfitModal
                outfit={selected}
                onClose={() => setSelected(null)}
                onRemoveFromItem={handleRemove}
                hideCollections
            />

            {picking && (
                <PinterestPicker
                    excludeIds={ideas.map(o => o.id)}
                    onPick={linkExisting}
                    onClose={() => setPicking(false)}
                />
            )}
        </div>
    );
}
