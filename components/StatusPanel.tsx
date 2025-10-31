
import React, { useState } from 'react';
import { PulseIcon } from './icons/PulseIcon';

type HealthStatus = 'operational' | 'checking' | 'error';

const StatusPanel: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>('operational');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const handleHealthCheck = () => {
    setStatus('checking');
    setTimeout(() => {
      setStatus('operational');
      setLastCheck(new Date().toISOString());
    }, 1000);
  };

  const getStatusIndicator = () => {
    switch(status) {
      case 'operational': return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
      case 'checking': return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-spin"></div>;
      case 'error': return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'operational': return "All Systems Operational";
      case 'checking': return "Pinging services...";
      case 'error': return "Service Disruption";
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl shadow-lg shadow-blue-500/10 p-4">
      <h2 className="text-lg font-semibold text-gray-200">System Status</h2>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            {getStatusIndicator()}
            <span className="text-sm text-gray-300">{getStatusText()}</span>
        </div>
        <button 
          id="healthBtn"
          onClick={handleHealthCheck}
          disabled={status === 'checking'}
          className="flex items-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 px-3 py-1 text-xs rounded-md transition-colors"
        >
          <PulseIcon className="w-4 h-4 mr-2" />
          Health Check
        </button>
      </div>
       {lastCheck && <p className="text-xs text-gray-500 mt-3">Last check: {new Date(lastCheck).toLocaleTimeString()}</p>}
    </div>
  );
};

export default StatusPanel;
