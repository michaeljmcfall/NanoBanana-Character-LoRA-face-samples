
import React, { useState } from 'react';
import Icon from './Icon';

interface PromptDisplayProps {
  prompt: string;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-lg p-6 rounded-xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-400">Last Prompt Sent</h2>
        <button
          onClick={handleCopy}
          disabled={!prompt || copied}
          className="px-3 py-1.5 text-xs font-semibold text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center"
          aria-live="polite"
        >
          <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg p-3 h-48 overflow-y-auto font-mono text-sm">
        {prompt ? (
          <pre className="text-gray-300 whitespace-pre-wrap">
            <code>{prompt}</code>
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>The prompt will appear here after generation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptDisplay;