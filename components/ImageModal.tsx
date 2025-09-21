
import React, { useEffect } from 'react';
import Icon from './Icon';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-lg p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="image-modal-title" className="sr-only">Full Resolution Image</h2>
        <img
          src={imageUrl}
          alt="Full resolution view"
          className="object-contain w-full h-full max-h-[calc(90vh-1rem)] rounded"
        />
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          aria-label="Close image viewer"
        >
          <Icon name="close" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
