import { Outfit } from './types';

interface Props {
    outfits: Outfit[];
    onSelect: (outfit: Outfit) => void;
    // When provided, each card shows a delete button (used on a wardrobe item's page).
    onRemove?: (outfitId: number) => void;
    emptyMessage?: string;
}

// Read-only browse grid. Clicking a card selects the outfit (opens the zoom).
export default function OutfitGrid({ outfits, onSelect, onRemove, emptyMessage }: Props) {
    if (outfits.length === 0) {
        return (
            <p className="text-center text-gray-400 py-10">
                {emptyMessage ?? 'No outfits yet.'}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {outfits.map(outfit => (
                <div
                    key={outfit.id}
                    className="rounded-lg overflow-hidden shadow bg-white hover:shadow-lg transition"
                >
                    <button type="button" onClick={() => onSelect(outfit)} className="block w-full text-left">
                        <img
                            src={outfit.imageUrl}
                            alt={outfit.name}
                            className="w-full h-48 object-cover"
                        />
                    </button>
                    <div className="p-2 flex items-start justify-between gap-1">
                        <button type="button" onClick={() => onSelect(outfit)} className="text-left min-w-0">
                            <h3 className="font-semibold text-sm truncate">{outfit.name}</h3>
                            {outfit.seasons && outfit.seasons.length > 0 && (
                                <p className="text-xs text-gray-400 truncate">{outfit.seasons.join(' · ')}</p>
                            )}
                        </button>
                        {onRemove && (
                            <button
                                onClick={() => onRemove(outfit.id)}
                                className="text-xs text-gray-400 hover:text-red-600 flex-shrink-0"
                                title="Remove from this item"
                            >
                                🗑
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
