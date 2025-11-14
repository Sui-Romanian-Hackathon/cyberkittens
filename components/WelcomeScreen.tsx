import React from 'react';
import { SuiLogo } from './Icons';

interface Tutorial {
    title: string;
    prompt: string;
}

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  prompts: string[];
  tutorials: Tutorial[];
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick, prompts, tutorials }) => {
  return (
    <div className="flex flex-col h-full text-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="my-auto">
        <SuiLogo className="h-20 w-20 text-[#00bbf9] mb-4 mx-auto" />
        <h1 className="text-4xl font-bold text-white mb-2">CyberKittens's SuiAI</h1>
        <p className="text-lg text-neutral-400 max-w-2xl mb-10 mx-auto">
          Your AI-powered partner for building on Sui.
          Let's refactor your code, plan your business, or learn the basics.
        </p>
        <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Interactive Tutorials</h2>
              <div className="grid grid-cols-1 gap-3">
                {tutorials.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onPromptClick(item.prompt)}
                    className="p-4 bg-[#1C1C1C] hover:bg-[#222] rounded-lg text-left transition-all duration-200 border border-neutral-800 hover:border-[#00bbf9]/50"
                  >
                    <p className="font-semibold text-[#00bbf9]">Start Tutorial</p>
                    <p className="text-neutral-300 text-sm">{item.title}</p>
                  </button>
                ))}
              </div>
          </div>
          <div>
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Or try an example</h2>
              <div className="grid grid-cols-1 gap-3">
              {prompts.map((prompt, index) => (
                  <button
                  key={index}
                  onClick={() => onPromptClick(prompt)}
                  className="p-4 bg-[#1C1C1C] hover:bg-[#222] rounded-lg text-left transition-all duration-200 border border-neutral-800 hover:border-[#00bbf9]/50"
                  >
                  <p className="text-neutral-300">{prompt}</p>
                  </button>
              ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};