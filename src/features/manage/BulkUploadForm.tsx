import { FormEvent, useRef, useState } from 'react';
import { authFetch } from '../auth/authFetch';

interface Props {
    onUploaded: () => void;
}

// Upload many photos at once → each becomes an untagged outfit named after its file.
export default function BulkUploadForm({ onUploaded }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const files = inputRef.current?.files;
        if (!files || files.length === 0) {
            setError('Choose one or more photos');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fd = new FormData();
            Array.from(files).forEach(f => fd.append('files', f));
            const res = await authFetch('/api/outfits-management/bulk', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            if (inputRef.current) inputRef.current.value = '';
            setCount(0);
            onUploaded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
            <h3 className="font-semibold">Upload photos</h3>
            <p className="text-xs text-gray-500">Pick several at once — you can name and tag them below afterward.</p>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={e => setCount(e.target.files?.length ?? 0)}
                className="text-sm"
            />
            {count > 0 && <p className="text-xs text-gray-500">{count} file{count === 1 ? '' : 's'} selected</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
            >
                {loading ? 'Uploading…' : 'Upload'}
            </button>
        </form>
    );
}
