import { useCallback, useState } from 'react';
import { authFetch } from '../auth/authFetch';

// Shared bulk-upload flow with name-duplicate handling, used by both Manage
// (outfits) and Wardrobe (clothing items). The server creates everything whose
// name is new and reports any name that already exists; we then ask the user to
// Skip (keep what they have) or Overwrite (replace the existing entry's photo).

type Kind = 'outfits' | 'items';

const ENDPOINTS: Record<Kind, { bulk: string; replace: (id: number) => string }> = {
    outfits: {
        bulk: '/api/outfits-management/bulk',
        replace: (id) => `/api/outfits-management/${id}/replace-photo`,
    },
    items: {
        bulk: '/api/clothing-items/bulk',
        replace: (id) => `/api/clothing-items/${id}/replace-photo`,
    },
};

function stripExt(filename: string): string {
    const dot = filename.lastIndexOf('.');
    return dot > 0 ? filename.slice(0, dot) : filename;
}

export interface Duplicate {
    name: string;
    existingId: number | null; // null = duplicated within this same selection
}

interface Pending {
    dupes: Duplicate[];
    fileByName: Map<string, File>;
}

export function useBulkUpload(kind: Kind, onChanged: () => void) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState<Pending | null>(null);

    const start = useCallback(async (files: FileList | File[]) => {
        const arr = Array.from(files);
        if (arr.length === 0) return;
        setBusy(true);
        setError(null);
        try {
            const fd = new FormData();
            arr.forEach((f) => fd.append('files', f));
            const res = await authFetch(ENDPOINTS[kind].bulk, { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const result = (await res.json()) as { duplicates?: Duplicate[] };
            onChanged(); // the non-duplicate files are now saved
            const dupes = result.duplicates ?? [];
            if (dupes.length > 0) {
                const fileByName = new Map<string, File>();
                arr.forEach((f) => fileByName.set(stripExt(f.name).toLowerCase(), f));
                setPending({ dupes, fileByName });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setBusy(false);
        }
    }, [kind, onChanged]);

    // Apply the user's choices: overwrite the chosen duplicates (re-upload the file to
    // replace the existing entry's photo); skipped ones need no action.
    const applyDecisions = useCallback(async (overwriteNames: Set<string>) => {
        if (!pending) return;
        setBusy(true);
        setError(null);
        try {
            for (const d of pending.dupes) {
                if (d.existingId == null || !overwriteNames.has(d.name)) continue;
                const file = pending.fileByName.get(d.name.toLowerCase());
                if (!file) continue;
                const fd = new FormData();
                fd.append('file', file);
                await authFetch(ENDPOINTS[kind].replace(d.existingId), { method: 'POST', body: fd });
            }
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not overwrite');
        } finally {
            setBusy(false);
            setPending(null);
        }
    }, [pending, kind, onChanged]);

    const dismiss = useCallback(() => setPending(null), []);

    return { start, busy, error, pending, applyDecisions, dismiss };
}

// The warning dialog. Rendered when `pending` is set. Copy/labels are overridable so
// the item page can frame it as "use existing / replace photo" rather than skip/overwrite.
export function DuplicateDialog({
    dupes,
    busy,
    onApply,
    onCancel,
    title = 'Possible duplicates',
    description,
    skipLabel = 'Skip',
    overwriteLabel = 'Overwrite',
    cancelLabel = 'Skip all',
}: {
    dupes: Duplicate[];
    busy: boolean;
    onApply: (overwriteNames: Set<string>) => void;
    onCancel: () => void;
    title?: string;
    description?: string;
    skipLabel?: string;
    overwriteLabel?: string;
    cancelLabel?: string;
}) {
    // Per-name choice: true = overwrite, false = skip (default skip).
    const [overwrite, setOverwrite] = useState<Record<string, boolean>>({});

    const set = (name: string, val: boolean) => setOverwrite((o) => ({ ...o, [name]: val }));
    const chosen = () => new Set(dupes.filter((d) => overwrite[d.name]).map((d) => d.name));

    const defaultDescription = `${dupes.length} photo${dupes.length === 1 ? '' : 's'} have a name you already have. The rest were uploaded. Choose what to do with each — default is to skip.`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{description ?? defaultDescription}</p>
                </div>

                <div className="p-4 overflow-y-auto flex flex-col gap-2">
                    {dupes.map((d) => {
                        const canOverwrite = d.existingId != null;
                        const isOverwrite = !!overwrite[d.name];
                        return (
                            <div key={d.name} className="border rounded-lg p-3">
                                <p className="font-medium text-sm truncate mb-2" title={d.name}>{d.name}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => set(d.name, false)}
                                        className={`flex-1 text-sm py-1.5 rounded border transition ${!isOverwrite ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300'}`}
                                    >
                                        {skipLabel}
                                    </button>
                                    <button
                                        disabled={!canOverwrite}
                                        onClick={() => set(d.name, true)}
                                        className={`flex-1 text-sm py-1.5 rounded border transition disabled:opacity-40 disabled:cursor-not-allowed ${isOverwrite ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300'}`}
                                        title={canOverwrite ? 'Replace the existing photo' : 'This name was selected twice in this batch'}
                                    >
                                        {overwriteLabel}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t flex items-center justify-between gap-2">
                    <button onClick={onCancel} disabled={busy} className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50">
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => onApply(chosen())}
                        disabled={busy}
                        className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        {busy ? 'Working…' : 'Done'}
                    </button>
                </div>
            </div>
        </div>
    );
}
