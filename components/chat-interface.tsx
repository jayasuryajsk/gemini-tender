'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { ModelSelector } from '@/components/model-selector';
import { useWindowSize } from 'usehooks-ts';
import { useSidebar } from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() !== '') {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (message.trim()) {
      const chatId = generateUUID();
      // Store the message to be used as the first message
      sessionStorage.setItem(`chat-${chatId}-initial-query`, message.trim());
      router.push(`/chat/${chatId}`);
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
                <button className="text-muted-foreground hover:text-foreground transition-colors">
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
