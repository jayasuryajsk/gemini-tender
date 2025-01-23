'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { ModelSelector } from '@/components/model-selector';
import { useWindowSize } from 'usehooks-ts';
import { useSidebar } from './ui/sidebar';
import { toast } from 'sonner';
import type { Attachment } from 'ai';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const router = useRouter();
  const { width } = useWindowSize();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    if (textareaRef.current) {
      if (message.trim() === '') {
        textareaRef.current.style.height = '80px';
      } else {
        textareaRef.current.style.height = '80px'; // Reset to initial height
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height =
          scrollHeight > 80 ? `${scrollHeight}px` : '80px';
      }
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (message.trim()) {
      const id = generateUUID();
      // Store the message in sessionStorage
      sessionStorage.setItem('initialMessage', message);
      sessionStorage.setItem('initialAttachments', JSON.stringify(attachments));
      // Navigate to the new chat page
      router.push(`/chat/${id}`);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      if (file.type === 'application/pdf') {
        // Use Gemini's file API for PDFs
        const response = await fetch('/api/files/gemini', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload PDF to Gemini');
        }

        const result = await response.json();
        return {
          url: result.fileUri,
          name: result.name,
          contentType: result.mimeType,
        };
      } else {
        // Use existing upload for other file types
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const { url, pathname, contentType } = data;

          return {
            url,
            name: pathname,
            contentType: contentType,
          };
        }
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const uploadedAttachments = await Promise.all(uploadPromises);
      const successfullyUploadedAttachments = uploadedAttachments.filter(
        (attachment): attachment is Attachment => attachment !== undefined,
      );

      setAttachments((prev) => [...prev, ...successfullyUploadedAttachments]);
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error handling files:', error);
      toast.error('Failed to process files, please try again!');
    } finally {
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
        <ModelSelector />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-32">
        <div className="w-full max-w-[750px] flex flex-col items-center space-y-10">
          <h1 className="text-[32px] font-semibold text-center font-sans">
            What can we bid on?
          </h1>

          {/* Message Input */}
          <div className="w-full">
            <div className="relative flex items-center bg-[#f3f4f6] rounded-2xl border border-input shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                className="flex-1 px-6 py-6 bg-transparent outline-none rounded-2xl text-foreground placeholder-muted-foreground resize-none overflow-hidden min-h-[80px]"
                style={{ minHeight: '80px' }}
              />
              <div className="flex items-center gap-4 pr-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  multiple
                />
                <button 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleSubmit}
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Display Attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1 text-xs bg-background rounded border"
                  >
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                    <button
                      onClick={() => {
                        setAttachments(attachments.filter((_, i) => i !== index));
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Suggestions */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <button
                onClick={() => {
                  setMessage("Find recent government tenders");
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#f3f4f6] rounded-lg border border-input hover:bg-background transition-colors text-foreground/80"
              >
                🔍 Find tenders
              </button>
              <button
                onClick={() => {
                  setMessage("Write a tender response");
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#f3f4f6] rounded-lg border border-input hover:bg-background transition-colors text-foreground/80"
              >
                ✍️ Write response
              </button>
              <button
                onClick={() => {
                  setMessage("Analyze tender requirements");
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#f3f4f6] rounded-lg border border-input hover:bg-background transition-colors text-foreground/80"
              >
                📋 Analyze requirements
              </button>
              <button
                onClick={() => {
                  setMessage("Calculate tender pricing");
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[#f3f4f6] rounded-lg border border-input hover:bg-background transition-colors text-foreground/80"
              >
                💰 Calculate pricing
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 flex items-center justify-center text-sm text-muted-foreground">
        <p>AI can make mistakes. Verify important information.</p>
        <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors">?</button>
      </footer>
    </div>
  );
}
