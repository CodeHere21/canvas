import { useState } from 'react';
import { Outfit } from './types';

interface Props {
    outfits: Outfit[];
    onSelect: (outfit: Outfit) => void;
    onNameUpdate: (id: number, newName: string) => void;
}

export default function OutfitGrid({ outfits, onSelect, onNameUpdate }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const startEdit = (outfit: Outfit, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(outfit.id);
        setEditingName(outfit.name);
    };

    const saveEdit = async (id: number, e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`/api/outfits/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editingName }),
        });
        onNameUpdate(id, editingName);
        setEditingId(null);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {outfits.map(outfit => (
                <div
                    key={outfit.id}
                    className="rounded-lg overflow-hidden shadow cursor-pointer"
                    onClick={() => onSelect(outfit)}
                >
                    <img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-40 object-contain"
                    />
                    <div className="p-2">
                        {editingId === outfit.id ? (
                            <form onSubmit={(e) => saveEdit(outfit.id, e)} onClick={e => e.stopPropagation()}>
                                <input
                                    autoFocus
                                    value={editingName}
                                    onChange={e => setEditingName(e.target.value)}
                                    className="w-full text-sm border rounded px-1 py-0.5 mb-1"
                                />
                                <div className="flex gap-1">
                                    <button type="submit" className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="text-xs bg-gray-200 px-2 py-0.5 rounded">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between gap-1">
                                <h2 className="font-semibold text-sm truncate">{outfit.name}</h2>
                                <button
                                    onClick={(e) => startEdit(outfit, e)}
                                    className="text-gray-400 hover:text-purple-600 text-xs flex-shrink-0"
                                    title="Rename"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500">{outfit.category}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
