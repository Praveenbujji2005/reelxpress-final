import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Max file sizes
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;  // 25MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const customFolder = formData.get('folder');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No valid file provided for upload.' },
        { status: 400 }
      );
    }

    const mimeType = file.type || '';
    const isVideo = mimeType.startsWith('video/') || (file.name && /\.(mp4|mov|webm|m4v)$/i.test(file.name));
    const isImage = mimeType.startsWith('image/') || (file.name && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name));

    // Size check
    const maxAllowed = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds limit (${Math.round(maxAllowed / (1024 * 1024))}MB).`,
        },
        { status: 400 }
      );
    }

    // Determine target subfolder under public/uploads
    let targetSubfolder = 'images';
    if (isVideo || customFolder === 'videos' || customFolder === 'hero') {
      targetSubfolder = 'videos';
    } else if (customFolder && typeof customFolder === 'string' && /^[a-zA-Z0-9_-]+$/.test(customFolder)) {
      targetSubfolder = customFolder;
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', targetSubfolder);
    await mkdir(uploadsDir, { recursive: true });

    // Sanitize filename
    const originalName = file.name || (isVideo ? 'video.mp4' : 'image.jpg');
    const ext = path.extname(originalName) || (isVideo ? '.mp4' : '.jpg');
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}_${baseName}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    // Convert file to ArrayBuffer then Buffer and write to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${targetSubfolder}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err) {
    console.error('[API /api/upload] Upload error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'File upload failed.' },
      { status: 500 }
    );
  }
}
