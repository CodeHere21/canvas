import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../features/collections';
import { imgThumb } from '../lib/img';

export default function Collections() {
    const navigate = useNavigate();
    const { collections, loading, error, create, remove } = useCollections();
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) return;
        setCreating(true);
        await create(name);
        setNewName('');
        setCreating(false);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Collections</h1>

            <div className="flex gap-2 mb-6 max-w-sm">
                <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="New collection name"
                    className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                    Create
                </button>
            </div>

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}

            {!loading && !error && collections.length === 0 && (
                <p className="text-center text-gray-400 py-10">No collections yet. Create one above, or add outfits to a collection from any image.</p>
            )}

            {!loading && !error && collections.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {collections.map(c => (
                        <div key={c.id} className="rounded-lg overflow-hidden shadow bg-white">
                            <button
                                type="button"
                                onClick={() => navigate(`/collections/${c.id}`)}
                                className="block w-full text-left"
                            >
                                {c.coverImageUrl ? (
                                    <img src={imgThumb(c.coverImageUrl, 500)} alt={c.name} loading="lazy" decoding="async" className="w-full h-40 object-cover" />
                                ) : (
                                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-3xl">📁</div>
                                )}
                            </button>
                            <div className="p-2 flex items-center justify-between gap-1">
                                <button onClick={() => navigate(`/collections/${c.id}`)} className="text-left min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                                    <p className="text-xs text-gray-400">{c.outfitCount} {c.outfitCount === 1 ? 'outfit' : 'outfits'}</p>
                                </button>
                                <button
                                    onClick={() => remove(c.id)}
                                    className="text-xs text-gray-400 hover:text-red-600 flex-shrink-0"
                                    title="Delete collection"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
