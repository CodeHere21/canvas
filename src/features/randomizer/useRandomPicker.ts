import { useCallback } from 'react';
import { Outfit } from '../outfits/types';

// Randomize used to be a plain Math.random() over the pool, which could land on the
// same outfit on consecutive days. This picker remembers recently-shown outfits in
// localStorage (so it survives closing the app) and avoids them until the pool is
// exhausted — so you won't get the same picture two mornings in a row.

const KEY = 'canvas.recentPicks';

function loadRecent(key: string): number[] {
    try {
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
    } catch {
        return [];
    }
}

function saveRecent(key: string, ids: number[]) {
    try {
        localStorage.setItem(key, JSON.stringify(ids));
    } catch {
        /* private mode / storage disabled — fine, just less memory of past picks */
    }
}

// storageKey separates pools that shouldn't share a history — My Photos and the
// inspiration pool are disjoint, and the smaller one would otherwise clip the larger
// one's window every time you shuffled.
export function useRandomPicker(pool: Outfit[], storageKey: string = KEY) {
    return useCallback((): Outfit | null => {
        if (pool.length === 0) return null;
        if (pool.length === 1) return pool[0];

        let recent = loadRecent(storageKey);
        let candidates = pool.filter((o) => !recent.includes(o.id));
        if (candidates.length === 0) {
            // Seen everything in the recent window — start a fresh cycle.
            recent = [];
            candidates = pool;
        }

        const pick = candidates[Math.floor(Math.random() * candidates.length)];

        // Keep the remembered window smaller than the pool so there's always a choice.
        const windowSize = Math.min(pool.length - 1, 40);
        recent = [pick.id, ...recent.filter((id) => id !== pick.id)].slice(0, windowSize);
        saveRecent(storageKey, recent);

        return pick;
    }, [pool, storageKey]);
}
