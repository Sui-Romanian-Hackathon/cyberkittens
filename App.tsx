import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { generateResponse } from './services/geminiService';
import type { Message } from './types';
import { EXAMPLE_PROMPTS, TUTORIAL_PROMPTS } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useDeepThink, setUseDeepThink] = useState<boolean>(false);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [isAwaitingSuiVisionInput, setIsAwaitingSuiVisionInput] = useState<boolean>(false);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: inputText,
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    if (isAwaitingSuiVisionInput) {
      setIsAwaitingSuiVisionInput(false);
    }

    try {
      const { text, sources } = await generateResponse(updatedMessages, useDeepThink, useWebSearch);
      
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: text,
        sources: sources,
      };
      
      const responseText = text.toLowerCase();
      const isAskingForId = (
        responseText.includes('package id') ||
        responseText.includes('transaction hash') ||
        responseText.includes('object id')
      ) && (
        responseText.includes('please provide') ||
        responseText.includes("what's the") ||
        responseText.includes('what is the') ||
        responseText.includes('enter the')
      );

      if (isAskingForId) {
        setIsAwaitingSuiVisionInput(true);
      }

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Failed to get response from Gemini:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'Sorry, I encountered an error while processing your request. Please check the console for details and try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, useDeepThink, useWebSearch, isAwaitingSuiVisionInput]);

  const selectExamplePrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-dvh bg-[#0A0908]">
      <Header />
      <main className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <WelcomeScreen 
            onPromptClick={selectExamplePrompt} 
            prompts={EXAMPLE_PROMPTS}
            tutorials={TUTORIAL_PROMPTS}
          />
        ) : (
          <ChatWindow messages={messages} isLoading={isLoading} />
        )}
      </main>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            useDeepThink={useDeepThink}
            setUseDeepThink={setUseDeepThink}
            useWebSearch={useWebSearch}
            setUseWebSearch={setUseWebSearch}
            isAwaitingSuiVisionInput={isAwaitingSuiVisionInput}
          />
      </div>
    </div>
  );
};

export default App;