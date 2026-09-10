import { FormEvent, useRef, useState } from 'react';
import { useBulkUpload, DuplicateDialog } from '../upload/bulkUpload';

interface Props {
    onUploaded: () => void;
}

// Upload many photos at once → each becomes an untagged outfit named after its file.
// A file whose name matches an existing outfit is flagged so you can skip or overwrite.
export default function BulkUploadForm({ onUploaded }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [count, setCount] = useState(0);
    const [validation, setValidation] = useState<string | null>(null);
    const { start, busy, error, pending, applyDecisions, dismiss } = useBulkUpload('outfits', onUploaded);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const files = inputRef.current?.files;
        if (!files || files.length === 0) {
            setValidation('Choose one or more photos');
            return;
        }
        setValidation(null);
        await start(files);
        if (inputRef.current) inputRef.current.value = '';
        setCount(0);
    };

    return (
        <>
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
                {(validation || error) && <p className="text-red-500 text-sm">{validation ?? error}</p>}
                <button
                    type="submit"
                    disabled={busy}
                    className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
                >
                    {busy ? 'Uploading…' : 'Upload'}
                </button>
            </form>

            {pending && (
                <DuplicateDialog dupes={pending.dupes} busy={busy} onApply={applyDecisions} onCancel={dismiss} />
            )}
        </>
    );
}
