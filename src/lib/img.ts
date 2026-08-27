// Rewrite a Cloudinary image URL to request a resized, auto-optimized version.
// Grids were loading full-resolution phone photos (multiple MB each), which is
// slow on mobile. Cloudinary can resize + pick the best format/quality on the fly
// via URL params inserted after "/image/upload/". Non-Cloudinary URLs (older or
// locally-served images) are returned unchanged.
//
//   w_<width>  cap the width (retina-friendly; pick ~2x the CSS size)
//   c_limit    only downscale, never upscale
//   q_auto     let Cloudinary choose the quality (big savings)
//   f_auto     serve WebP/AVIF where supported (big savings)
export function imgThumb(url: string | undefined | null, width: number): string {
    if (!url) return '';
    const marker = '/image/upload/';
    const idx = url.indexOf(marker);
    if (idx === -1 || !url.includes('res.cloudinary.com')) return url;

    const insertAt = idx + marker.length;
    const rest = url.slice(insertAt);
    // Idempotent: don't stack transformations if one is already present.
    if (rest.startsWith('w_') && rest.includes('q_auto')) return url;

    return url.slice(0, insertAt) + `w_${width},c_limit,q_auto,f_auto/` + rest;
}
