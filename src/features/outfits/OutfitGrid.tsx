import { Outfit } from './types';

interface Props {
    outfits: Outfit[];
    onSelect: (outfit: Outfit) => void;
}

export default function OutfitGrid({ outfits, onSelect }: Props) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {outfits.map(outfit => (
                <div
                    key={outfit.id}
                    className="rounded-lg overflow-hidden shadow cursor-pointer"
                    onClick={() => onSelect(outfit)}
                >
                    <img
                        src={outfit.imagePath}
                        alt={outfit.name}
                        className="w-full h-40 object-contain"
                    />
                    <div className="p-2">
                        <h2 className="font-semibold text-sm">{outfit.name}</h2>
                        <p className="text-xs text-gray-500">{outfit.category}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
