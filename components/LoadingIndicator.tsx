import React from 'react';
import { BotIcon } from './Icons';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-[#00bbf9] to-[#E52687] flex items-center justify-center shadow-md">
        <BotIcon className="h-5 w-5 text-white" />
      </div>
      <div className="max-w-2xl p-4 rounded-xl shadow-md bg-[#1C1C1C] text-neutral-300">
        <div className="flex items-center space-x-2">
          <span className="text-sm">SuiAI is thinking</span>
          <div className="flex space-x-1">
            <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
            <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
            <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
};