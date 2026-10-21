import sharp from "sharp";

/**
 * Optimasi gambar server-side.
 *
 * Aset situs memakai lebar maksimum 1920px (hero) dan ~1400px untuk konten.
 * Gambar dari admin bisa jauh lebih besar, jadi dikompres sebelum disimpan:
 * - resize maksimal ke `MAX_WIDTH`
 * - encoder WebP (ukuran ~30% lebih kecil dari JPEG pada kualitas sama)
 * - kualitas 82 (cukup untuk web, cache-friendly)
 */

export const MAX_WIDTH = 1920;
export const WEBP_QUALITY = 82;

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  width: number | null;
  height: number | null;
};

/**
 * Proses buffer gambar: resize + kompres ke WebP.
 * Bila input bukan gambar valid, error dilempar agar pemanggil bisa menolak.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const image = sharp(input, { failOn: "none" }).rotate(); // hormati EXIF orientation

  const meta = await image.metadata();

  const resized = image.resize({
    width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH),
    withoutEnlargement: true,
  });

  const { data, info } = await resized
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    mimeType: "image/webp",
    width: info.width,
    height: info.height,
  };
}
