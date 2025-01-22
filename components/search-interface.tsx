'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { generateUUID } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MessageIcon } from './icons';

export function SearchInterface() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const chatId = generateUUID();
      // Store the search query to be used as the first message
      sessionStorage.setItem(`chat-${chatId}-initial-query`, searchInput.trim());
      router.push(`/chat/${chatId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-6">
          <MessageIcon size={48} />
        </div>
        <h1 className="text-4xl font-bold mb-4">How can I help you today?</h1>
        <p className="text-muted-foreground">Ask me anything or start a conversation</p>
      </motion.div>

      <motion.form 
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-2xl"
      >
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type your question here..."
            className="w-full px-6 py-4 text-lg rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={!searchInput.trim()}
          >
            Ask
          </button>
        </div>
      </motion.form>
    </div>
  );
}
