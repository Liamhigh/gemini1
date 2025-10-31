import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SealedPackage } from '../types';
import { sealTranscriptToPdf } from '../services/pdfService';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { PaperClipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface ChatPanelProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (input: string, file: File | null) => void;
    onSealPackage: (pkg: SealedPackage) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onSendMessage, onSealPackage }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam) {
        setMode(modeParam.toUpperCase());
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(input, attachedFile);
    setInput('');
    setAttachedFile(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSealTranscript = async () => {
    if (messages.length === 0) return;
    try {
        const { pdfBytes, sha512 } = await sealTranscriptToPdf(messages, []);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const now = new Date();
        const newPackage: SealedPackage = {
            name: `VERUM_OMNIS_TRANSCRIPT_${now.toISOString().replace(/[:.]/g, '-')}.pdf`,
            sha512: sha512,
            blobUrl: URL.createObjectURL(blob),
            createdAt: now.toISOString(),
        };
        onSealPackage(newPackage);
    } catch (error) {
        console.error("Failed to seal transcript:", error);
    }
  };


  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-200">
          {mode && <span className="text-xs text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full">{mode} MODE</span>}
        </h2>
        <button
            onClick={handleSealTranscript}
            className="flex items-center text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-md transition-colors"
        >
            <DocumentDuplicateIcon className="w-4 h-4 mr-2"/>
            Seal Transcript to PDF
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-[#376bff] text-white' : 
                msg.role === 'model' ? 'bg-gray-700 text-gray-300' : 
                'bg-red-800 text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.attachment && (
                <div className="mt-2 border-t border-blue-400/50 pt-2 text-xs">
                  <p className="font-semibold text-blue-100 flex items-center">
                    <PaperClipIcon className="w-3 h-3 mr-1.5 inline-block"/>
                    Attached: {msg.attachment.name}
                  </p>
                </div>
              )}
              {msg.rawResponses && (
                <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-gray-400">View Triple-AI Raw Responses</summary>
                    <div className="mt-2 space-y-2 border-t border-gray-600 pt-2">
                        {msg.rawResponses.map(res => (
                            <div key={res.provider}>
                                <p className="font-bold text-gray-300">{res.provider}:</p>
                                <p className="text-gray-400 pl-2 border-l-2 border-gray-500">{res.text}</p>
                            </div>
                        ))}
                    </div>
                </details>
              )}
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
        {attachedFile && (
          <div className="px-3 py-2 bg-gray-700 rounded-md mb-2 flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-300">
              <PaperClipIcon className="w-4 h-4 mr-2" />
              <span className="truncate max-w-xs">{attachedFile.name}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-gray-400 hover:text-white"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex items-center bg-gray-800 rounded-lg">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-[#376bff] transition-colors"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your legal situation or attach a document..."
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
            disabled={isLoading || (!input.trim() && !attachedFile)}
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