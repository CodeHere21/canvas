// Enum values — must mirror the backend enums exactly.
export type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
// Two active archetypes; each shows a stylised label (see ARCHETYPE_LABELS).
export type Archetype = 'EVERYMAN' | 'INNOCENT';

export const SEASONS: Season[] = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];
export const ARCHETYPES: Archetype[] = ['EVERYMAN', 'INNOCENT'];

// Display labels for the archetype buttons (the concept stays Everyman / Innocent).
export const ARCHETYPE_LABELS: Record<Archetype, string> = {
    EVERYMAN: 'Bgirl',
    INNOCENT: 'Naif',
};

// The single unit of the app: a photo of a look, with a name and tags.
export interface Outfit {
    id: number;
    name: string;
    imageUrl: string;
    seasons?: Season[];
    archetypes?: Archetype[];
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
