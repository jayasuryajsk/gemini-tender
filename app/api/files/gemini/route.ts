import { GoogleAIFileManager } from '@google/generative-ai/server';
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return Response.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ 
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Create a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = join(process.cwd(), 'tmp');
    const tempPath = join(tempDir, `${randomUUID()}-${file.name}`);

    try {
      // Ensure tmp directory exists
      await mkdir(tempDir, { recursive: true });
      await writeFile(tempPath, buffer);

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
    } catch (uploadError) {
      console.error('Error during file upload:', uploadError);
      return Response.json({ 
        error: 'Failed to upload file to Gemini service' 
      }, { status: 500 });
    } finally {
      // Clean up temporary file
      await unlink(tempPath).catch(error => {
        console.error('Error cleaning up temporary file:', error);
      });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return Response.json(
      { error: 'Failed to process file upload request' },
      { status: 500 }
    );
  }
} 