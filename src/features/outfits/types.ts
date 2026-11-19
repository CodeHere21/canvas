// Enum values — must mirror the backend enums exactly.
export type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
// Archetypes; each shows a stylised label (see ARCHETYPE_LABELS).
export type Archetype = 'CREATOR' | 'RULER' | 'POSEIDON';

export const SEASONS: Season[] = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];
export const ARCHETYPES: Archetype[] = ['CREATOR', 'RULER', 'POSEIDON'];

// Display labels for the archetype buttons.
export const ARCHETYPE_LABELS: Record<Archetype, string> = {
    CREATOR: 'Ares',
    RULER: 'Hermes',
    POSEIDON: 'Poseidon',
};

// The single unit of the app: a photo of a look, with a name and tags.
export interface Outfit {
    id: number;
    name: string;
    imageUrl: string;
    seasons?: Season[];
    archetypes?: Archetype[];
    // true = a photo of her own; false/absent = saved inspiration. Splits the
    // My Photos tab from Pinterest.
    ownPhoto?: boolean;
    createdAt?: string;
}

// A named group of outfits (summary — for the collections list).
export interface Collection {
    id: number;
    name: string;
    outfitCount: number;
    coverImageUrl: string | null;
    createdAt?: string;
}

// A collection with its outfits (detail view).
export interface CollectionDetail extends Collection {
    outfits: Outfit[];
}
