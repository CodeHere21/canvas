import { useCallback } from 'react';
import { Outfit } from '../outfits/types';

// Randomize used to be a plain Math.random() over the pool, which could land on the
// same outfit on consecutive days. This picker remembers recently-shown outfits in
// localStorage (so it survives closing the app) and avoids them until the pool is
// exhausted — so you won't get the same picture two mornings in a row.

const KEY = 'canvas.recentPicks';

function loadRecent(): number[] {
    try {
        const raw = localStorage.getItem(KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
    } catch {
        return [];
    }
}

function saveRecent(ids: number[]) {
    try {
        localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
        /* private mode / storage disabled — fine, just less memory of past picks */
    }
}

export function useRandomPicker(pool: Outfit[]) {
    return useCallback((): Outfit | null => {
        if (pool.length === 0) return null;
        if (pool.length === 1) return pool[0];

        let recent = loadRecent();
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
        saveRecent(recent);

        return pick;
    }, [pool]);
}
