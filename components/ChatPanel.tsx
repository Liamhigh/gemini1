
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getAIResponse } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    setMessages([{
        id: 'initial',
        role: 'model',
        text: "Welcome to Verum Omnis Legal Triage. I am an AI assistant, not a lawyer, and this does not constitute legal advice. Please describe your situation, and I will provide empathetic guidance. This session is secure and stateless."
    }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiText = await getAIResponse(input);
      const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'system', text: "Error: Could not get a response. Please check your connection or API key." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl shadow-lg shadow-blue-500/10 h-[70vh] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-200 p-4 border-b border-gray-700/50">AI Legal Triage</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-[#376bff] text-white' : 
                msg.role === 'model' ? 'bg-gray-700 text-gray-300' : 
                'bg-red-800 text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-lg p-3 rounded-lg bg-gray-700 text-gray-300">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50">
        <div className="flex items-center bg-gray-800 rounded-lg">
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your legal situation here..."
            className="w-full bg-transparent p-3 text-sm text-gray-300 focus:outline-none resize-none"
            rows={2}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            id="askBtn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 text-gray-400 hover:text-[#376bff] disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
