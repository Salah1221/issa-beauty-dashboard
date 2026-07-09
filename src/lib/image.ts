// Request an appropriately-sized thumbnail from ImageKit instead of the stored
// master (products are stored up to 1600px, banners up to 2000px). ImageKit
// applies the `tr` query transform on top of the upload, `f-auto` serves
// WebP/AVIF when supported. blob:/data:/relative URLs pass through unchanged.
//
// `width` is the intended pixel width — pass ~2x the CSS width for retina.
export function ikThumb(src: string | null | undefined, width: number): string {
  if (!src) return "";
  if (!/^https?:\/\//i.test(src)) return src;
  const tr = `tr=w-${Math.round(width)},c-at_max,q-80,f-auto`;
  return src.includes("?") ? `${src}&${tr}` : `${src}?${tr}`;
}
