
import React from 'react';
import type { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const LOG_STYLES: Record<LogEntry['type'], string> = {
  info: 'text-gray-300',
  error: 'text-red-400',
  success: 'text-green-400',
};

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
      <h2 className="text-2xl font-bold text-orange-400">Log</h2>
      <div className="bg-gray-900 rounded-lg p-3 h-48 overflow-y-auto">
        {logs.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {logs.map((log, index) => {
              const colorClass = LOG_STYLES[log.type];
              return (
                <li key={index} className={`flex items-start ${colorClass}`}>
                  <span className="font-mono text-gray-500 mr-2 flex-shrink-0">[{log.timestamp}]</span>
                  <p className="flex-1 break-words">{log.message}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Logs will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogPanel;
