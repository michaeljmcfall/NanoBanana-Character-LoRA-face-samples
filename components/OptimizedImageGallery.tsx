
import React from 'react';
import type { OptimizedImage } from '../types';
import Icon from './Icon';

interface OptimizedImageGalleryProps {
  images: OptimizedImage[];
  onSelect: (image: OptimizedImage) => void;
  selectedImageId?: string | null;
}

const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = ({ images, onSelect, selectedImageId }) => {
  return (
    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 min-h-[15rem] flex items-center justify-center">
      {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 w-full">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => onSelect(image)}
              className={`relative rounded-lg overflow-hidden aspect-square focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500 ${selectedImageId === image.id ? 'ring-2 ring-orange-500' : 'ring-gray-700 ring-1'}`}
              aria-label={`Select optimized reference ${image.id}`}
            >
              <img src={image.src} alt={`Optimized reference ${image.id}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Icon name="view" className="w-8 h-8 text-white" />
              </div>
            </button>
          ))}
        </div>
      ) : (
          <div className="text-center text-gray-500 text-sm p-4">
              <Icon name="image" className="w-12 h-12 mx-auto mb-2"/>
              <p>Click "Optimize Reference Image" to generate standardized versions here.</p>
          </div>
      )}
    </div>
  );
};

export default OptimizedImageGallery;
