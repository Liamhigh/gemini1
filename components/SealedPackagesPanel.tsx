
import React from 'react';
import { SealedPackage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface SealedPackagesPanelProps {
  packages: SealedPackage[];
}

const SealedPackagesPanel: React.FC<SealedPackagesPanelProps> = ({ packages }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl shadow-lg shadow-blue-500/10 p-4">
      <h2 className="text-lg font-semibold text-gray-200">Sealed Evidence Packages</h2>
      <div className="mt-4 space-y-3">
        {packages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((pkg) => (
          <div key={pkg.sha512} className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-400">
                <ShieldCheckIcon className="w-5 h-5 mr-2"/>
                <p className="text-sm font-semibold text-gray-200 truncate" title={pkg.name}>
                  {pkg.name}
                </p>
              </div>
              <a 
                href={pkg.blobUrl} 
                download={pkg.name}
                className="flex items-center text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors"
              >
                <DownloadIcon className="w-3 h-3 mr-1.5" />
                Download
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Sealed: {new Date(pkg.createdAt).toLocaleString()}
            </p>
            <p className="text-green-500 text-[10px] font-mono break-all mt-1">
              {pkg.sha512}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SealedPackagesPanel;
