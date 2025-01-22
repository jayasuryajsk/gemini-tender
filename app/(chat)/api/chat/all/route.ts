import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { chat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await db.delete(chat).where(eq(chat.userId, session.user.id as string));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all chats:', error);
    return NextResponse.json(
      { error: 'Failed to delete all chats' },
      { status: 500 }
    );
  }
} 
