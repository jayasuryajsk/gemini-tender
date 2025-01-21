import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const isGeminiModel = (apiIdentifier: string) => {
  return apiIdentifier.startsWith('gemini-');
};

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: googleAI(apiIdentifier),
    middleware: customMiddleware,
  });
};

// Use Gemini for image generation when it becomes available
export const imageGenerationModel = null;
