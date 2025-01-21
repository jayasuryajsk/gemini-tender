import { GoogleAIFileManager } from '@google/generative-ai/server';

export const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

export async function uploadFileToGemini(
  file: File,
  displayName: string,
  mimeType: string,
) {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create temporary file path
    const tempPath = `/tmp/${file.name}`;
    await require('fs').promises.writeFile(tempPath, buffer);

    const uploadResult = await fileManager.uploadFile(tempPath, {
      displayName,
      mimeType,
    });

    // Clean up temporary file
    await require('fs').promises.unlink(tempPath);

    return {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
      name: uploadResult.file.name,
    };
  } catch (error) {
    console.error('Error uploading file to Gemini:', error);
    throw error;
  }
}

export async function deleteGeminiFile(fileName: string) {
  try {
    await fileManager.deleteFile(fileName);
  } catch (error) {
    console.error('Error deleting file from Gemini:', error);
    throw error;
  }
} 
