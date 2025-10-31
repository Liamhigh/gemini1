import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import VerifierPanel from './components/VerifierPanel';
import StatusPanel from './components/StatusPanel';
import LandingPage from './components/LandingPage';
import InstitutionsPage from './components/InstitutionsPage';
import SealedPackagesPanel from './components/SealedPackagesPanel';
import AnalysisPanel from './components/AnalysisPanel';
import { EvidenceFile, SealedPackage, ChatMessage } from './types';
import { getTriageResponse } from './services/aiService';
import { ChatBubbleLeftRightIcon } from './components/icons/ChatBubbleLeftRightIcon';
import { DocumentChartBarIcon } from './components/icons/DocumentChartBarIcon';


type AppView = 'landing' | 'institutions' | 'main';
type MainViewTab = 'chat' | 'analysis';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [mainTab, setMainTab] = useState<MainViewTab>('chat');
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [sealedPackages, setSealedPackages] = useState<SealedPackage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([{
        id: 'initial',
        role: 'model',
        text: "Welcome to Verum Omnis Legal Triage. I am an AI assistant, not a lawyer, and this does not constitute legal advice. Please describe your situation or attach a document for analysis. This session is secure, stateless, and runs a Triple-AI consensus check for verification."
    }]);
  }, []);

  const handleSendMessage = async (input: string, file: File | null = null) => {
    if ((!input.trim() && !file) || isLoading) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input,
      attachment: file ? { name: file.name } : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { consensus, raw } = await getTriageResponse(input, file);
      const aiMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: consensus,
        rawResponses: raw
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'system', text: "Error: Could not get a response. Please check your connection or API key." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSealPackage = (pkg: SealedPackage) => {
    setSealedPackages(prev => [...prev, pkg]);
  };

  if (view === 'landing') {
    return <LandingPage 
      onEnter={() => setView('main')} 
      onInstitutionsClick={() => setView('institutions')} 
    />;
  }
  
  if (view === 'institutions') {
    return <InstitutionsPage onBack={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 font-mono p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl shadow-lg shadow-blue-500/10 h-[70vh] flex flex-col">
              <div className="flex border-b border-gray-700/50">
                  <button onClick={() => setMainTab('chat')} className={`flex-1 p-4 text-sm font-semibold flex items-center justify-center gap-2 ${mainTab === 'chat' ? 'bg-gray-800/60 text-white' : 'text-gray-400 hover:bg-gray-800/30'}`}>
                    <ChatBubbleLeftRightIcon className="w-5 h-5" /> AI Legal Triage
                  </button>
                  <button onClick={() => setMainTab('analysis')} className={`flex-1 p-4 text-sm font-semibold flex items-center justify-center gap-2 ${mainTab === 'analysis' ? 'bg-gray-800/60 text-white' : 'text-gray-400 hover:bg-gray-800/30'}`}>
                    <DocumentChartBarIcon className="w-5 h-5" /> Forensic Analysis
                  </button>
              </div>
              {mainTab === 'chat' && (
                <ChatPanel 
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  onSealPackage={handleSealPackage}
                />
              )}
              {mainTab === 'analysis' && (
                <AnalysisPanel 
                  messages={messages}
                />
              )}
            </div>
          </div>
          <div className="space-y-8">
            <VerifierPanel 
              evidence={evidence} 
              onEvidenceChange={setEvidence} 
              onSeal={handleSealPackage}
            />
            {sealedPackages.length > 0 && <SealedPackagesPanel packages={sealedPackages} />}
            <StatusPanel />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;