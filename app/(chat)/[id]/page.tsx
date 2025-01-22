import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { DataStreamHandler } from '@/components/data-stream-handler';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  // We'll use this ID from the URL params instead of generating a new one
  const { id } = params;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
