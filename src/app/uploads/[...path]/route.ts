import { NextResponse, type NextRequest } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sajikan berkas hasil upload dari folder penyimpanan.
 *
 * Folder upload berada di luar `public/` supaya bisa di-mount sebagai volume
 * Docker yang terpisah dari image container. Berkas dilayani lewat route ini
 * dengan validasi path (tidak ada path traversal) dan cache jangka panjang
 * karena nama berkas mengandung UUID.
 */

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path ?? [];
  if (segments.length !== 1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileName = path.basename(segments[0]);
  const target = path.resolve(UPLOAD_DIR, fileName);
  const root = path.resolve(UPLOAD_DIR);

  // Cegah path traversal: hasil resolve harus tetap di dalam UPLOAD_DIR.
  if (!target.startsWith(root + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const info = await stat(target);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = await readFile(target);
    const ext = path.extname(fileName).toLowerCase();

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
