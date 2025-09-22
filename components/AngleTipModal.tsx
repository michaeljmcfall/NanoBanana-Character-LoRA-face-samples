
import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';

interface AngleTipModalProps {
  onClose: () => void;
  onDontShowAgain: () => void;
}

const AngleTipModal: React.FC<AngleTipModalProps> = ({ onClose, onDontShowAgain }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      onDontShowAgain();
    } else {
      onClose();
    }
  }, [dontShowAgain, onClose, onDontShowAgain]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
    >
      <div
        className="relative max-w-lg w-full bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-600/20 flex items-center justify-center mr-4">
                <Icon name="gemini" className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
                <h2 id="tip-modal-title" className="text-xl font-bold text-orange-400 mb-2">Pro Tip: Generating Extreme Angles</h2>
                <p className="text-gray-300 mb-4">
                    When generating challenging angles like a full profile, the AI can sometimes struggle if the reference image is front-facing.
                </p>
                <p className="text-gray-300 mb-4">
                    For better results, try generating an intermediate <strong>3/4 view</strong> first. Then, hover over that new image and click the <strong>'Use as Reference'</strong> icon. This gives the AI a better starting point to create the full profile view.
                </p>
            </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-800 sm:text-sm"
            >
              Got it
            </button>
            <div className="mt-4 sm:mt-0">
                <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                    />
                    <span className="ml-2">Don't show this message again</span>
                </label>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default AngleTipModal;
