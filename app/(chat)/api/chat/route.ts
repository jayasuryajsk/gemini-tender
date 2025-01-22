import {
  type Message,
  type Attachment,
  type UserContent,
  convertToCoreMessages,
  createDataStreamResponse,
  experimental_generateImage,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { customModel, imageGenerationModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

interface FileContent extends UserContent {
  type: 'file';
  attachments?: Array<Attachment>;
}

const handleAttachments = (attachments: Array<Attachment>) => {
  return attachments.map(attachment => {
    if (attachment.contentType === 'application/pdf' && attachment.url.startsWith('https://generativelanguage.googleapis.com')) {
      // This is a Gemini-hosted PDF
      return {
        fileData: {
          fileUri: attachment.url,
          mimeType: attachment.contentType
        }
      };
    }
    // For other attachments, use the existing format
    return {
      inlineData: {
        data: attachment.url,
        mimeType: attachment.contentType
      }
    };
  });
};

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
    attachments = [],
  }: { 
    id: string; 
    messages: Array<Message>; 
    modelId: string;
    attachments?: Array<Attachment>;
  } = await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  const userMessageId = generateUUID();

  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const processedAttachments = handleAttachments(attachments);
      
      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 5,
        maxTokens: 8192,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
