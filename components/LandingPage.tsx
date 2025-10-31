
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 font-mono flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-3xl w-full">
        <LogoIcon className="h-24 w-24 mx-auto text-[#376bff]" />
        
        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 tracking-wider">
          Verum Omnis
        </h1>
        <h2 className="mt-2 text-xl sm:text-2xl text-[#376bff] font-semibold">
          The World's First Forensic Legal AI
        </h2>

        <p className="mt-8 max-w-2xl mx-auto text-gray-400 sm:text-lg">
          For the first time, everyone has access to justice. This is a secure, private, client-side forensic environment. Your data is yours alone. No uploads. No logs. Purely offline analysis.
        </p>

        <div className="mt-12">
          <button
            onClick={onEnter}
            className="bg-[#376bff] text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Enter Secure Environment
          </button>
        </div>

        <div className="mt-16 text-xs text-gray-600">
          <p>100% Private &bull; Client-Side Analysis &bull; Verifiable Chain-of-Custody</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
