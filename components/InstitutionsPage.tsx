import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface InstitutionsPageProps {
  onBack: () => void;
}

const InstitutionsPage: React.FC<InstitutionsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-200 font-mono flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-5xl w-full">
        <LogoIcon className="h-16 w-16 mx-auto text-[#376bff]" />
        
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-100 tracking-wider">
          Verum Omnis for Institutions
        </h1>
        <h2 className="mt-2 text-lg sm:text-xl text-[#376bff] font-semibold">
          Secure, Scalable, and Court-Ready AI Solutions
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-gray-500">[ Video Placeholder: bank promo.mp4 ]</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-gray-500">[ Video Placeholder: bank promo long (1).mp4 ]</p>
            </div>
        </div>

        <p className="mt-8 max-w-3xl mx-auto text-gray-400">
            Verum Omnis offers powerful, on-premise, and cloud-based AI solutions for legal firms, financial institutions, and government bodies. Our platform ensures data sovereignty while providing unparalleled forensic analysis and legal assistance capabilities. Contact our sales team for a trial and onboarding. Licensing is based on recovery or per-seat models.
        </p>

        <div className="mt-12 flex justify-center gap-4">
            <button
                onClick={onBack}
                className="bg-transparent border border-gray-600 text-gray-300 font-bold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
                Back to Home
            </button>
            <a
                href="/chat.html"
                className="bg-[#376bff] text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors"
            >
                Enter Legal AI
            </a>
        </div>
      </div>
    </div>
  );
};

export default InstitutionsPage;