
import React from 'react';
import { VO_GUARD_VERSION, CONSTITUTION_HASH } from '../constants';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const Header: React.FC = () => {
  const shortHash = `${CONSTITUTION_HASH.substring(0, 8)}...${CONSTITUTION_HASH.substring(CONSTITUTION_HASH.length - 8)}`;

  return (
    <header className="border-b border-blue-500/20 pb-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 tracking-wider">
        Verum Omnis <span className="text-[#376bff]">Forensic AI</span>
      </h1>
      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-4 w-4 text-[#376bff] mr-2" />
          <span>Guardian: {VO_GUARD_VERSION}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500">Constitution Hash:</span>
          <span className="ml-2 font-mono text-green-400">{shortHash}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
