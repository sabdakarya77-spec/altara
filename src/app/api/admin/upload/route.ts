import { NextResponse, type NextRequest } from "next/server";
import { getSessionHashFromCookies, isSessionValid } from "@/lib/auth";
import { processImage } from "@/lib/image";
import { ALLOWED_IMAGE_TYPES, saveFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upload gambar dari panel admin.
 *
 * Alur: validasi session → validasi tipe & ukuran → kompres/resize (sharp,
 * WebP) → simpan ke folder upload dengan nama aman (UUID) → kembalikan URL.
 *
 * Batas ukuran 10 MB sebelum diproses.
 */

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const hash = await getSessionHashFromCookies();
  if (!(await isSessionValid(hash))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form tidak valid" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas gambar wajib diunggah" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Ukuran berkas maksimal 10 MB" },
      { status: 413 }
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipe berkas tidak didukung: ${file.type || "tidak diketahui"}` },
      { status: 415 }
    );
  }

  try {
    const original = Buffer.from(await file.arrayBuffer());
    const processed = await processImage(original);
    const url = await saveFile(processed.buffer, processed.mimeType, file.name);
    return NextResponse.json({
      url,
      width: processed.width,
      height: processed.height,
      size: processed.buffer.length,
    });
  } catch (err) {
    console.error("[api/admin/upload] gagal:", (err as Error).message);
    return NextResponse.json(
      { error: "Gagal memproses gambar. Pastikan berkas adalah gambar yang valid." },
      { status: 500 }
    );
  }
}
