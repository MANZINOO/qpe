/**
 * Ridimensiona e comprime un'immagine lato client.
 * Restituisce una Promise con il Blob compresso.
 *
 * @param {File} file - Il file immagine originale
 * @param {number} maxSize - Dimensione massima in px (default 400)
 * @param {number} quality - Qualità JPEG 0-1 (default 0.82)
 * @returns {Promise<Blob>}
 */
export function resizeImage(file, maxSize = 400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calcola le nuove dimensioni mantenendo il rapporto
      if (width > height) {
        if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
      } else {
        if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas to Blob fallito')),
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossibile caricare l\'immagine'));
    };

    img.src = url;
  });
}
