interface Props {
    onRandomize: () => void;
    disabled?: boolean;
    error?: string | null;
}

// The big Randomize button. Picking logic lives in useRandomPicker (owned by the page)
// so the outfit modal can trigger the same "next random" without closing.
export default function Randomizer({ onRandomize, disabled, error }: Props) {
    return (
        <div className="text-center mb-6">
            <button
                onClick={onRandomize}
                disabled={disabled}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
                🎲 Randomize
            </button>
            {error && <div className="text-red-500 mt-3">{error}</div>}
        </div>
    );
}
