import { useState } from 'react';
import { OutfitGrid, OutfitModal, useOutfits, Outfit } from '../features/outfits';
import { Randomizer } from '../features/randomizer';

export default function Home() {
    const { outfits, loading, error } = useOutfits();
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">My Outfits</h1>
            <OutfitGrid outfits={outfits} onSelect={setSelectedOutfit} />
            <Randomizer onPickClick={setSelectedOutfit} />
            <OutfitModal outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} />
        </div>
    );
}
