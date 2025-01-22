'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { Document, Suggestion } from '@/lib/db/schema';
import { Editor } from '@/components/editor';
import { CodeEditor } from '@/components/code-editor';
import { ImageEditor } from '@/components/image-editor';

export default function DocumentPage() {
  const { id } = useParams();
  const { data: documents, isLoading, mutate } = useSWR<Array<Document>>(
    `/api/document?id=${id}`,
    fetcher
  );

  const { data: suggestions = [] } = useSWR<Array<Suggestion>>(
    id ? `/api/suggestions?documentId=${id}` : null,
    fetcher
  );

  const [content, setContent] = useState('');

  useEffect(() => {
    if (documents && documents.length > 0) {
      const latestDocument = documents[documents.length - 1];
      setContent(latestDocument.content || '');
    }
  }, [documents]);

  const saveContent = useCallback(async (updatedContent: string, debounce: boolean) => {
    if (!id || !documents) return;
    
    const currentDocument = documents[documents.length - 1];
    if (currentDocument && updatedContent !== currentDocument.content) {
      const response = await fetch(`/api/document?id=${id}`, {
        method: 'POST',
        body: JSON.stringify({
          title: currentDocument.title,
          content: updatedContent,
          kind: currentDocument.kind,
        }),
      });

      if (response.ok) {
        mutate();
      }
    }
  }, [id, documents, mutate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Document not found</div>
      </div>
    );
  }

  const document = documents[documents.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">{document.title}</h1>
        <div className="bg-card rounded-lg shadow-lg p-6">
          {document.kind === 'text' && (
            <Editor
              content={content}
              saveContent={saveContent}
              status="idle"
              isCurrentVersion={true}
              currentVersionIndex={documents.length - 1}
              suggestions={suggestions}
            />
          )}
          {document.kind === 'code' && (
            <CodeEditor
              content={content}
              saveContent={saveContent}
              status="idle"
              isCurrentVersion={true}
              currentVersionIndex={documents.length - 1}
              suggestions={suggestions}
            />
          )}
          {document.kind === 'image' && (
            <ImageEditor
              title={document.title}
              content={content}
              isCurrentVersion={true}
              currentVersionIndex={documents.length - 1}
              status="idle"
              isInline={false}
            />
          )}
        </div>
      </div>
    </div>
  )
} 
