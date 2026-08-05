import { Outfit } from './types';

interface Props {
    outfits: Outfit[];
    onSelect: (outfit: Outfit) => void;
    emptyMessage?: string;
}

// Read-only browse grid. Clicking a card selects the outfit (opens the winner popup).
export default function OutfitGrid({ outfits, onSelect, emptyMessage }: Props) {
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
                <button
                    key={outfit.id}
                    type="button"
                    className="text-left rounded-lg overflow-hidden shadow bg-white cursor-pointer hover:shadow-lg transition"
                    onClick={() => onSelect(outfit)}
                >
                    <img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-2">
                        <h3 className="font-semibold text-sm truncate">{outfit.name}</h3>
                        {outfit.seasons && outfit.seasons.length > 0 && (
                            <p className="text-xs text-gray-400 truncate">{outfit.seasons.join(' · ')}</p>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
