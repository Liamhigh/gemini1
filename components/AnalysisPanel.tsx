import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { runForensicAnalysis } from '../services/aiService';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface AnalysisPanelProps {
    messages: ChatMessage[];
}

type AnalysisStatus = 'idle' | 'running' | 'complete' | 'error';

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ messages }) => {
    const [status, setStatus] = useState<AnalysisStatus>('idle');
    const [report, setReport] = useState<string>('');

    const handleRunAnalysis = async () => {
        setStatus('running');
        setReport('');
        try {
            const result = await runForensicAnalysis(messages);
            setReport(result);
            setStatus('complete');
        } catch (error) {
            console.error("Forensic analysis failed:", error);
            setReport("An error occurred while generating the forensic report. Please try again.");
            setStatus('error');
        }
    };
    
    const renderContent = () => {
        switch (status) {
            case 'running':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-400"></div>
                        <p className="mt-4 text-lg text-gray-300">Running Forensic Analysis...</p>
                        <p className="text-sm text-gray-500">The Verum Omnis Forensic Brain is examining the transcript...</p>
                    </div>
                );
            case 'complete':
            case 'error':
                 return (
                    <div className="prose prose-invert prose-sm max-w-none p-4 bg-gray-800 rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans">{report}</pre>
                        <button
                            onClick={handleRunAnalysis}
                            className="mt-4 flex items-center justify-center w-full bg-[#376bff] text-white px-4 py-2 text-sm rounded-md hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-wait"
                        >
                            <ShieldCheckIcon className="w-4 h-4 mr-2"/>
                            Re-Run Analysis
                        </button>
                    </div>
                 )
            case 'idle':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <h3 className="text-xl font-bold text-gray-200">Verum Omnis Institutional Review</h3>
                        <p className="mt-2 text-sm text-gray-400 max-w-md">
                            Initiate a deep forensic analysis of the current chat transcript. The AI will apply the Institutional Review Template to identify critical legal subjects, detect dishonesty patterns, and provide actionable outputs.
                        </p>
                        <button
                            onClick={handleRunAnalysis}
                            disabled={messages.length <= 1}
                            className="mt-6 flex items-center bg-[#376bff] text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <ShieldCheckIcon className="w-5 h-5 mr-3"/>
                            Initiate AI Analysis
                        </button>
                        {messages.length <= 1 && <p className="text-xs text-gray-500 mt-2">A conversation is required to run analysis.</p>}
                    </div>
                );
        }
    }


    return (
        <div className="h-full flex flex-col flex-1 overflow-y-auto">
            {renderContent()}
        </div>
    );
};

export default AnalysisPanel;
