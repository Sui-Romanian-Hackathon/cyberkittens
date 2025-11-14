import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendIcon, BrainIcon, WebIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  useDeepThink: boolean;
  setUseDeepThink: (value: boolean) => void;
  useWebSearch: boolean;
  setUseWebSearch: (value: boolean) => void;
  isAwaitingSuiVisionInput: boolean;
}

const ToggleButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    activeClass: string;
    activeShadow: string;
}> = ({ isActive, onClick, icon, label, activeClass, activeShadow }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full transition-all duration-300 ${isActive ? `${activeClass} ${activeShadow} text-white shadow-md` : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
    >
        {icon}
        {label}
    </button>
);


export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  useDeepThink,
  setUseDeepThink,
  useWebSearch,
  setUseWebSearch,
  isAwaitingSuiVisionInput,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Max height of ~6 lines (24 * 6 = 144px) before scrolling
      textarea.style.height = `${Math.min(scrollHeight, 144)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const placeholderText = isAwaitingSuiVisionInput 
    ? "Enter the Package ID or Transaction Hash..." 
    : "Ask about Sui, Move, or paste an error message...";

  return (
    <div className="bg-[#0A0908]/80 backdrop-blur-sm border-t border-[#E52687]/30 py-3 pb-4 sm:py-4">
      <div className="flex justify-center gap-4 mb-3">
        <ToggleButton
            isActive={useDeepThink}
            onClick={() => setUseDeepThink(!useDeepThink)}
            icon={<BrainIcon className="h-4 w-4" />}
            label="Think Deeply"
            activeClass="bg-[#E52687]"
            activeShadow="shadow-[0_0_10px_rgba(229,38,135,0.5)]"
        />
        <ToggleButton
            isActive={useWebSearch}
            onClick={() => setUseWebSearch(!useWebSearch)}
            icon={<WebIcon className="h-4 w-4" />}
            label="Search Web"
            activeClass="bg-[#00bbf9]"
            activeShadow="shadow-[0_0_10px_rgba(0,187,249,0.5)]"
        />
      </div>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            rows={1}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl resize-none py-3 pl-4 pr-12 text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-[#00bbf9] focus:border-[#00bbf9] transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 bg-gradient-to-br from-[#00bbf9] to-[#E52687] text-white hover:opacity-90 disabled:from-neutral-700 disabled:to-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
};