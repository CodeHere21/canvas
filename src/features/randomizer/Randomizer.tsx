import { useState } from 'react';
import { Outfit } from '../outfits/types';

interface Props {
    pool: Outfit[];
    onPick: (outfit: Outfit) => void;
}

// Picks a random outfit from the currently filtered pool (client-side, no blackout).
export default function Randomizer({ pool, onPick }: Props) {
    const [error, setError] = useState<string | null>(null);

    const handleRandomize = () => {
        if (pool.length === 0) {
            setError('No outfits match — adjust your filters.');
            return;
        }
        setError(null);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        onPick(pick);
    };

    return (
        <div className="text-center mb-6">
            <button
                onClick={handleRandomize}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition"
            >
                🎲 Randomize
            </button>
            {error && <div className="text-red-500 mt-3">{error}</div>}
        </div>
    );
}
