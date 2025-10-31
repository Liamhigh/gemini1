import React, { useState, useCallback } from 'react';
import { KNOWN_HASHES } from '../constants';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import { EvidenceFile, SealedPackage } from '../types';

type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'failed' | 'error';
type SealingStatus = 'idle' | 'sealing' | 'done';

interface VerificationResult {
  match: boolean;
  notes?: {
    match_type: string;
    document: string;
  };
}

interface VerifierPanelProps {
  evidence: EvidenceFile[];
  onEvidenceChange: (evidence: EvidenceFile[]) => void;
  onSeal: (pkg: SealedPackage) => void;
}

const VerifierPanel: React.FC<VerifierPanelProps> = ({ evidence, onEvidenceChange, onSeal }) => {
  const [sha512, setSha512] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [sealingStatus, setSealingStatus] = useState<SealingStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fileName, setFileName] = useState('');

  const arrayBufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('verifying');
    setFileName(file.name);
    setResult(null);

    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await window.crypto.subtle.digest('SHA-512', buffer);
        const hashHex = arrayBufferToHex(hashBuffer).toUpperCase();
        setSha512(hashHex);
        verifyHash(hashHex);
        const newEvidenceFile: EvidenceFile = { name: file.name, sha512: hashHex, file };
        onEvidenceChange([...evidence.filter(f => f.name !== file.name), newEvidenceFile]);
    } catch (err) {
        console.error("Hashing failed:", err);
        setStatus('error');
    }
  };

  const handleSealEvidence = async () => {
    if (evidence.length === 0) return;
    setSealingStatus('sealing');

    let manifest = `Verum Omnis Sealed Evidence Bundle\n`;
    manifest += `Created: ${new Date().toISOString()}\n\n`;
    manifest += `--- Included Evidence (${evidence.length} items) ---\n\n`;

    evidence.forEach(item => {
        manifest += `File: ${item.name}\n`;
        manifest += `SHA-512: ${item.sha512}\n\n`;
    });
    
    const blob = new Blob([manifest], { type: 'text/plain' });
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-512', buffer);
    const hashHex = arrayBufferToHex(hashBuffer).toUpperCase();

    const now = new Date();
    const newPackage: SealedPackage = {
      name: `VO_SEALED_${now.toISOString().replace(/[:.]/g, '-')}.txt`,
      sha512: hashHex,
      blobUrl: URL.createObjectURL(blob),
      createdAt: now.toISOString(),
    };

    onSeal(newPackage);
    setSealingStatus('done');
    setTimeout(() => setSealingStatus('idle'), 2000);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl shadow-lg shadow-blue-500/10 p-4">
      <h2 className="text-lg font-semibold text-gray-200">Forensic Firewall</h2>
      <p className="text-xs text-gray-500 mt-1">Verify evidence and build your case file securely offline.</p>
      
      <div className="mt-4 space-y-4">
        {/* Hash Verification */}
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
        
        {/* Evidence Upload */}
        <div>
            <label htmlFor="file-upload" className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#376bff] hover:bg-gray-800/50 transition-colors">
                <UploadIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-400">{fileName || "Upload evidence to locker"}</span>
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
      
      {evidence.length > 0 && (
        <div className="mt-4 border-t border-gray-700/50 pt-4">
          <h3 className="text-md font-semibold text-gray-300 mb-2">Evidence Locker</h3>
          <div className="space-y-2 bg-gray-800 rounded-lg p-2 max-h-32 overflow-y-auto">
            {evidence.map((item, index) => (
              <div key={index} className="text-xs font-mono bg-gray-900/50 p-2 rounded">
                <p className="text-gray-200 truncate" title={item.name}>{item.name}</p>
                <p className="text-green-400 break-all text-[10px]">{item.sha512}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
                onClick={handleSealEvidence}
                disabled={sealingStatus === 'sealing'}
                className="w-full flex items-center justify-center bg-[#376bff] text-white px-4 py-2 text-sm rounded-md hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-wait"
            >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2"/>
                {sealingStatus === 'sealing' ? 'Sealing...' : sealingStatus === 'done' ? 'Sealed!' : 'Seal Evidence Bundle'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierPanel;