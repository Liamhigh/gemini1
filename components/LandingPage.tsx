import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface LandingPageProps {
  onEnter: () => void;
  onInstitutionsClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onInstitutionsClick }) => {
  const handleVerifyClick = () => {
    // Redirects to chat with mode=verify
    window.location.href = '/chat.html?mode=verify';
    onEnter();
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 font-mono flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Video Placeholder */}
      <div className="absolute top-0 left-0 w-full h-full bg-black z-0">
        <div className="w-full h-full flex items-center justify-center text-gray-700">
            [ Autoplaying hero video: assets/video/1761063851860.mp4 ]
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
      
      <div className="max-w-4xl w-full z-20">
        <LogoIcon className="h-24 w-24 mx-auto text-[#376bff]" />
        
        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 tracking-wider">
          Verum Omnis
        </h1>
        <h2 className="mt-2 text-lg sm:text-xl text-[#376bff] font-semibold">
          The world’s first legal AI — client-side forensics, court-ready outputs.
        </h2>

        <p className="mt-8 max-w-2xl mx-auto text-gray-400 sm:text-lg">
          For the first time, everyone has access to justice. This is a secure, private, client-side forensic environment. Your data is yours alone. No uploads. No logs.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onInstitutionsClick}
            className="bg-transparent border border-gray-600 text-gray-300 font-bold text-md px-6 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-300 w-full sm:w-auto"
          >
            For Institutions
          </button>
          <button
            onClick={onEnter}
            className="bg-[#376bff] text-white font-bold text-md px-6 py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
          >
            Open Legal AI
          </button>
           <a
            href="/chat.html?mode=verify"
            className="bg-transparent border border-gray-600 text-gray-300 font-bold text-md px-6 py-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-300 w-full sm:w-auto"
          >
            Verify a Document
          </a>
        </div>

        <div className="mt-16 text-xs text-gray-600">
          <p>Free for private people. Institutions pay on recovery.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;