import React from 'react';
import { SuiLogo } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#0A0908]/80 backdrop-blur-sm border-b border-[#00bbf9]/30 sticky top-0 z-10 shadow-[0_4px_14px_rgba(0,187,249,0.08)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <SuiLogo className="h-8 w-8 text-[#00bbf9]" />
            <h1 className="text-xl font-bold text-white">
              <span className="text-neutral-400 font-normal">CyberKittens's</span> SuiAI
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};