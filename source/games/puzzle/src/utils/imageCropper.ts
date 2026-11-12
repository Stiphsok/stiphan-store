/**
 * Preprocesses an uploaded image to ensure a square aspect ratio (object-fit: cover)
 * so that sliding puzzle tiles are never distorted regardless of camera orientation.
 */
export function cropImageToSquare(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const targetSize = 800;
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Center crop calculation
      let srcX = 0;
      let srcY = 0;
      let srcW = w;
      let srcH = h;

      if (w > h) {
        srcW = h;
        srcX = (w - h) / 2;
      } else if (h > w) {
        srcH = w;
        srcY = (h - w) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetSize, targetSize);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
