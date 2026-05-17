import { useState } from 'react';
import { Outfit } from '../outfits/types';

interface Props {
    onPickClick: (outfit: Outfit) => void;
}

export default function Randomizer({ onPickClick }: Props) {
    const [randomOutfit, setRandomOutfit] = useState<Outfit | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRandomize = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/outfits/random');
            if (!res.ok) throw new Error('Failed to fetch random outfit');
            const pick: Outfit = await res.json();
            setRandomOutfit(pick);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center mb-6">
                <button
                    onClick={handleRandomize}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                    {loading ? 'Picking...' : 'Randomizer'}
                </button>
            </div>

            {error && <div className="text-center text-red-500 mb-4">{error}</div>}

            {randomOutfit && (
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">Today's Pick: {randomOutfit.name}</h2>
                    <img
                        src={randomOutfit.imagePath}
                        alt={randomOutfit.name}
                        className="h-32 object-cover rounded-lg shadow cursor-pointer"
                        onClick={() => onPickClick(randomOutfit)}
                    />
                </div>
            )}
        </>
    );
}
