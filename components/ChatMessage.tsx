import React from 'react';
import type { Message } from '../types';
import { UserIcon, BotIcon, CopyIcon, LinkIcon } from './Icons';

// Simple Markdown to JSX renderer
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 space-y-4">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const codeBlock = part.replace(/```.*\n/, '').replace(/```$/, '');
          const langMatch = part.match(/```(\w+)/);
          const lang = langMatch ? langMatch[1] : '';
          
          return (
            <div key={index} className="relative bg-black/50 rounded-lg my-2 shadow-lg border border-neutral-800">
              <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-900/70 rounded-t-lg text-xs">
                <span className="font-sans text-neutral-400">{lang || 'code'}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(codeBlock)}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors focus:outline-none"
                >
                  <CopyIcon className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm"><code className={`language-${lang}`}>{codeBlock}</code></pre>
            </div>
          );
        } else {
          // Simple bold, italic, and inline code
          let processedPart = part
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-black/50 text-[#E52687] rounded px-1 py-0.5 text-sm font-mono">$1</code>');
          return <p key={index} dangerouslySetInnerHTML={{ __html: processedPart.replace(/\n/g, '<br/>') }} />;
        }
      })}
    </div>
  );
};


export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-[#00bbf9] to-[#E52687] flex items-center justify-center shadow-md">
          <BotIcon className="h-5 w-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-2xl w-full p-4 rounded-xl shadow-md ${isUser ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-white' : 'bg-[#1C1C1C] text-neutral-300'}`}>
        <div className="whitespace-pre-wrap">
          {isUser ? <p>{message.text}</p> : <MarkdownRenderer text={message.text} />}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-neutral-700/50">
            <h4 className="text-xs font-semibold text-neutral-400 mb-2">Sources:</h4>
            <ul className="space-y-1.5">
              {message.sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-[#00bbf9] hover:text-[#00a2d9] hover:underline transition-colors"
                  >
                    <LinkIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{source.title || source.uri}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center shadow-md">
          <UserIcon className="h-5 w-5 text-neutral-300" />
        </div>
      )}
    </div>
  );
};