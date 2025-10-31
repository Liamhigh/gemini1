
import React, { useState, useCallback } from 'react';
import { KNOWN_HASHES } from '../constants';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { UploadIcon } from './icons/UploadIcon';

type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'failed' | 'error';

interface VerificationResult {
  match: boolean;
  notes?: {
    match_type: string;
    document: string;
  };
}

const VerifierPanel: React.FC = () => {
  const [sha512, setSha512] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fileName, setFileName] = useState('');

  const verifyHash = useCallback((hash: string) => {
    const upperCaseHash = hash.toUpperCase();
    if (KNOWN_HASHES[upperCaseHash]) {
      setStatus('verified');
      setResult({
        match: true,
        notes: {
          match_type: KNOWN_HASHES[upperCaseHash].type,
          document: KNOWN_HASHES[upperCaseHash].name,
        },
      });
    } else {
      setStatus('failed');
      setResult({ match: false });
    }
  }, []);

  const handleManualVerification = () => {
    if (!sha512 || sha512.length !== 128) {
        setStatus('error');
        setResult(null);
        return;
    }
    setStatus('verifying');
    setTimeout(() => verifyHash(sha512), 500);
  };
  
  const arrayBufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('verifying');
    setFileName(file.name);
    setResult(null);

    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await window.crypto.subtle.digest('SHA-512', buffer);
        const hashHex = arrayBufferToHex(hashBuffer);
        setSha512(hashHex);
        verifyHash(hashHex);
    } catch (err) {
        console.error("Hashing failed:", err);
        setStatus('error');
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl shadow-lg shadow-blue-500/10 p-4">
      <h2 className="text-lg font-semibold text-gray-200">Document Verifier</h2>
      <p className="text-xs text-gray-500 mt-1">Validate evidence integrity via SHA-512 fingerprint.</p>
      
      <div className="mt-4 space-y-4">
        <div className="relative">
            <input 
                id="sha"
                type="text" 
                value={sha512}
                onChange={(e) => setSha512(e.target.value)}
                placeholder="Enter SHA-512 hash..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs font-mono text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#376bff]"
            />
            <button 
                id="verifyBtn"
                onClick={handleManualVerification}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#376bff] text-white px-3 py-1 text-xs rounded-md hover:bg-blue-500 transition-colors"
            >
                Verify
            </button>
        </div>
        <div className="flex items-center justify-center text-xs text-gray-500">
          <span className="flex-grow border-t border-gray-700"></span>
          <span className="px-2">OR</span>
          <span className="flex-grow border-t border-gray-700"></span>
        </div>
        <div>
            <label htmlFor="file-upload" className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#376bff] hover:bg-gray-800/50 transition-colors">
                <UploadIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-400">{fileName || "Upload a document"}</span>
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
      
      {status !== 'idle' && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          {status === 'verifying' && <p className="text-sm text-yellow-400 animate-pulse">Verifying hash...</p>}
          {status === 'error' && <p className="text-sm text-red-500">Error: Invalid SHA-512 hash or file read failed.</p>}
          {status === 'verified' && result?.match && (
            <div className="flex items-start text-green-400">
                <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold">INTEGRITY CONFIRMED</p>
                    <p className="text-xs text-gray-300 mt-1">Type: {result.notes?.match_type}</p>
                    <p className="text-xs text-gray-300">Document: {result.notes?.document}</p>
                </div>
            </div>
          )}
           {status === 'failed' && !result?.match && (
            <div className="flex items-start text-red-500">
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold">VERIFICATION FAILED</p>
                    <p className="text-xs text-gray-400 mt-1">The provided hash does not match any known official documents in the Verum Omnis registry.</p>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifierPanel;
