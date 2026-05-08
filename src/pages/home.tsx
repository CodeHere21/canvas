import React, { useEffect, useState } from 'react';

interface Outfit {
    id: number;
    name: string;
    imagePath: string;
    category: string;
    description: string;
}

export default function Home() {
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [randomOutfit, setRandomOutfit] = useState<Outfit | null>(null);
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

    useEffect(() => {
        fetch('/api/outfits')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch outfits');
                return res.json();
            })
            .then(data => {
                setOutfits(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleRandomize = () => {
        const pick = outfits[Math.floor(Math.random() * outfits.length)];
        setRandomOutfit(pick);
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">My Outfits</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {outfits.map(outfit => (
                    <div key={outfit.id} className="rounded-lg overflow-hidden shadow cursor-pointer" onClick={() => setSelectedOutfit(outfit)}>
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

            <div className="text-center mb-6">
                <button
                    onClick={handleRandomize}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    Randomizer
                </button>
            </div>

            {randomOutfit && (
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">Today's Pick: {randomOutfit.name}</h2>
                    <img
                        src={randomOutfit.imagePath}
                        alt={randomOutfit.name}
                        className="h-32 object-cover rounded-lg shadow cursor-pointer"
                        onClick={() => setSelectedOutfit(randomOutfit)}
                    />
                </div>
            )}
            {selectedOutfit && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={() => setSelectedOutfit(null)}
                >
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedOutfit(null)}
                            className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 text-black font-bold shadow"
                        >
                            X
                        </button>
                        <img
                            src={selectedOutfit.imagePath}
                            alt={selectedOutfit.name}
                            className="max-h-[80vh] max-w-[90vw] rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
