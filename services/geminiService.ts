import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import type { Message, Source } from '../types';

export async function generateResponse(
  messages: Message[],
  useDeepThink: boolean,
  useWebSearch: boolean
): Promise<{ text: string; sources: Source[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const modelName = useDeepThink ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const config: any = {
        systemInstruction: SYSTEM_PROMPT,
    };

    if (useDeepThink) {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    if (useWebSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    // Convert our message format to what the Gemini API expects
    const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: config,
        });
        
        const text = response.text;
        
        let sources: Source[] = [];
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (groundingChunks) {
            sources = groundingChunks
                .map((chunk: any) => chunk.web)
                .filter((web: any) => web && web.uri && web.title)
                .map((web: any) => ({
                    uri: web.uri,
                    title: web.title,
                }));
        }

        return { text: text || "I am sorry, I could not generate a response.", sources };

    } catch (error) {
        console.error("Error generating response:", error);
        return { 
          text: "Sorry, I encountered an error. This could be due to a network issue, an invalid API key, or a problem with the model. Please check the browser console for more details.", 
          sources: [] 
        };
    }
}