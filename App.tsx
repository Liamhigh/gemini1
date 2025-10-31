
import React, { useState } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import VerifierPanel from './components/VerifierPanel';
import StatusPanel from './components/StatusPanel';
import LandingPage from './components/LandingPage';
import SealedPackagesPanel from './components/SealedPackagesPanel';
import { EvidenceFile, SealedPackage } from './types';

const App: React.FC = () => {
  const [isAppEntered, setIsAppEntered] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [sealedPackages, setSealedPackages] = useState<SealedPackage[]>([]);

  if (!isAppEntered) {
    return <LandingPage onEnter={() => setIsAppEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 font-mono p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChatPanel />
          </div>
          <div className="space-y-8">
            <VerifierPanel 
              evidence={evidence} 
              onEvidenceChange={setEvidence} 
              onSeal={(pkg) => setSealedPackages(prev => [...prev, pkg])}
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
