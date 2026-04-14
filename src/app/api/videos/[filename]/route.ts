import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Keamanan: Pastikan tidak ada path traversal (mencegah akses file sensitif)
    const safeFilename = path.basename(decodeURIComponent(filename));
    const filePath = path.join(process.cwd(), "public", "autoclip-results", safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const range = req.headers.get("range");

    // Mendukung fitur "Seeking" di video player menggunakan Range Headers
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      const head = {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": "video/mp4",
      };

      return new NextResponse(file as any, {
        status: 206,
        headers: head,
      });
    } else {
      const head = {
        "Content-Length": stats.size.toString(),
        "Content-Type": "video/mp4",
      };
      const file = fs.createReadStream(filePath);
      return new NextResponse(file as any, {
        status: 200,
        headers: head,
      });
    }
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
