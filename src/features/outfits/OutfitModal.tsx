import { Outfit } from './types';

interface Props {
    outfit: Outfit | null;
    onClose: () => void;
}

export default function OutfitModal({ outfit, onClose }: Props) {
    if (!outfit) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 text-black font-bold shadow"
                >
                    X
                </button>
                <img
                    src={outfit.imagePath}
                    alt={outfit.name}
                    className="max-h-[80vh] max-w-[90vw] rounded-lg"
                />
            </div>
        </div>
    );
}
