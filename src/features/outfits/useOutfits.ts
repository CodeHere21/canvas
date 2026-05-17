import { useEffect, useState } from 'react';
import { Outfit } from './types';

export function useOutfits() {
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return { outfits, loading, error };
}
