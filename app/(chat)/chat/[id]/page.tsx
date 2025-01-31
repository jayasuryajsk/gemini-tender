import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function ChatPage({ 
  params,
  searchParams 
}: { 
  params: { id: string },
  searchParams: { message?: string }
}) {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  const initialMessages = searchParams.message ? [{
    id: '1',
    role: 'user',
    content: searchParams.message,
  }] : [];

  return (
    <>
      <Chat
        key={params.id}
        id={params.id}
        initialMessages={initialMessages}
        selectedModelId={selectedModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={params.id} />
    </>
  );
}
