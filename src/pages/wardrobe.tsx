import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClothingItems } from '../features/wardrobe';
import { imgThumb } from '../lib/img';

export default function Wardrobe() {
    const navigate = useNavigate();
    const { items, loading, error, remove, bulkUpload } = useClothingItems();
    const [query, setQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? items.filter(i => i.name.toLowerCase().includes(q)) : items;
    }, [items, query]);

    const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        await bulkUpload(files);
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-1">My Wardrobe</h1>
            <p className="text-sm text-gray-500 mb-6">Your clothing pieces. Tap one to build outfit ideas around it.</p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:items-center">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search items…"
                    className="border rounded-lg px-4 py-2 text-sm max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <label className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-purple-700 transition self-start">
                    {uploading ? 'Uploading…' : '+ Add items'}
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
                </label>
            </div>

            {loading && <p className="text-center text-gray-400 py-10">Loading…</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            {!loading && !error && items.length === 0 && (
                <p className="text-center text-gray-400 py-10">No items yet — add some with “+ Add items”.</p>
            )}
            {!loading && !error && items.length > 0 && filtered.length === 0 && (
                <p className="text-center text-gray-400 py-10">No items match “{query}”.</p>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filtered.map(item => (
                        <div key={item.id} className="rounded-lg overflow-hidden shadow bg-white">
                            <button type="button" onClick={() => navigate(`/wardrobe/${item.id}`)} className="block w-full">
                                <img src={imgThumb(item.imageUrl, 500)} alt={item.name} loading="lazy" decoding="async" className="w-full h-40 object-cover" />
                            </button>
                            <div className="p-2 flex items-center justify-between gap-1">
                                <button onClick={() => navigate(`/wardrobe/${item.id}`)} className="text-left min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                </button>
                                <button
                                    onClick={() => remove(item.id)}
                                    className="text-xs text-gray-400 hover:text-red-600 flex-shrink-0"
                                    title="Delete item"
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
