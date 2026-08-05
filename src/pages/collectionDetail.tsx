import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '../features/collections';
import { OutfitGrid, OutfitModal, Outfit } from '../features/outfits';

export default function CollectionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { collection, loading, error, removeOutfit } = useCollection(id);
    const [selected, setSelected] = useState<Outfit | null>(null);

    const handleRemove = async (outfitId: number) => {
        await removeOutfit(outfitId);
        setSelected(null);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <button onClick={() => navigate('/collections')} className="text-sm text-gray-500 hover:text-purple-600 mb-4">
                ← Back to collections
            </button>

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}

            {!loading && !error && collection && (
                <>
                    <h1 className="text-2xl font-bold mb-4">{collection.name}</h1>
                    <OutfitGrid
                        outfits={collection.outfits}
                        onSelect={setSelected}
                        emptyMessage="This collection is empty. Add outfits to it from any image."
                    />
                </>
            )}

            <OutfitModal
                outfit={selected}
                onClose={() => setSelected(null)}
                onRemoveFromCollection={handleRemove}
            />
        </div>
    );
}
