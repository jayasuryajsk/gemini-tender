import { GoogleAIFileManager } from '@google/generative-ai/server';
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = join(process.cwd(), 'tmp');
    const tempPath = join(tempDir, `${randomUUID()}-${file.name}`);

    // Ensure tmp directory exists
    await mkdir(tempDir, { recursive: true });
    await writeFile(tempPath, buffer);

    try {
      // Upload to Gemini
      const uploadResult = await fileManager.uploadFile(tempPath, {
        displayName: file.name,
        mimeType: file.type,
      });

      return Response.json({
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
        name: uploadResult.file.name,
      });
    } finally {
      // Clean up temporary file
      await unlink(tempPath).catch(console.error);
    }
  } catch (error) {
    console.error('Error uploading to Gemini:', error);
    return Response.json(
      { error: 'Failed to upload file to Gemini' },
      { status: 500 }
    );
  }
} 