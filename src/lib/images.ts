export function getOptimizedImageUrl(
  src?: string | null,
  options: { width?: number; quality?: number } = {}
) {
  if (!src) return '';

  const width = options.width ?? 900;
  const quality = options.quality ?? 75;

  try {
    const url = new URL(src);

    if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(quality));
      return url.toString();
    }

    if (url.pathname.includes('/storage/v1/object/public/')) {
      url.pathname = url.pathname.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
      url.searchParams.set('width', String(width));
      url.searchParams.set('quality', String(quality));
      url.searchParams.set('resize', 'cover');
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}
