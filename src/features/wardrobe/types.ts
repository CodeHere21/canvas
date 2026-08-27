// A physical clothing item in the user's wardrobe (photo + name). Lives only in
// the Wardrobe tab; its outfit ideas are ordinary outfits linked to it.
export interface ClothingItem {
    id: number;
    name: string;
    imageUrl: string;
    createdAt?: string;
}
