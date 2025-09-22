
import React from 'react';
import type { GeneratedImage } from '../types';
import Spinner from './Spinner';
import Icon from './Icon';

interface ImageGalleryProps {
  images: GeneratedImage[];
  isLoading: boolean;
  isDownloading: boolean;
  selectedImageIds: Set<string>;
  onSelectAsReference: (imageSrc: string) => void;
  onDelete: (imageId: string) => void;
  onView: (imageSrc: string) => void;
  onToggleSelection: (imageId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onInvertSelection: () => void;
  onDownloadSelected: () => void;
}

const ImageCard: React.FC<{ 
  image: GeneratedImage, 
  isSelected: boolean,
  onSelect: () => void, 
  onDelete: () => void, 
  onView: () => void,
  onToggleSelection: () => void 
}> = ({ image, isSelected, onSelect, onDelete, onView, onToggleSelection }) => {
  
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent other click handlers on the card from firing
    action();
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="group relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden aspect-square cursor-pointer"
      onClick={onView}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onView() }}
      role="button"
      tabIndex={0}
      aria-label="View generated image in full size"
    >
      <img src={image.src} alt="Generated art" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      
      {/* Selection Checkbox */}
      <button
        onClick={(e) => handleButtonClick(e, onToggleSelection)}
        className="absolute top-2 left-2 z-20 p-1 rounded-md bg-black/60 hover:bg-black/80 transition-colors"
        aria-label="Select this image"
        aria-checked={isSelected}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-600' : 'border-white/50 bg-black/30'}`}>
          {isSelected && <Icon name="check" className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Main Overlay with Info and Actions */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 pointer-events-none">
        <div className="text-xs text-gray-300 overflow-y-auto max-h-full pointer-events-auto">
            <p><strong className="text-orange-400">H-Angle:</strong> {image.config.angleX}</p>
            <p><strong className="text-orange-400">V-Angle:</strong> {image.config.angleY}</p>
            <p><strong className="text-orange-400">Expression:</strong> {image.config.expression}</p>
            <p><strong className="text-orange-400">Subject:</strong> {image.config.subjectType}</p>
            {(image.config.randomHair || image.config.hair) && <p><strong className="text-orange-400">Hair:</strong> {image.config.randomHair ? 'Random' : image.config.hair}</p>}
            {(image.config.randomBackground || image.config.background) && <p><strong className="text-orange-400">Background:</strong> {image.config.randomBackground ? 'Random' : image.config.background}</p>}
            {(image.config.randomClothing || image.config.clothing) && <p><strong className="text-orange-400">Clothing:</strong> {image.config.randomClothing ? 'Random' : image.config.clothing}</p>}
        </div>
        <div className="flex items-center justify-end space-x-2 mt-2 pointer-events-auto">
            <button onClick={(e) => handleButtonClick(e, onSelect)} title="Use as Reference" className="p-2 rounded-full bg-gray-700 hover:bg-orange-600 text-white transition-colors">
                <Icon name="refresh" className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleButtonClick(e, downloadImage)} title="Download" className="p-2 rounded-full bg-gray-700 hover:bg-orange-600 text-white transition-colors">
                <Icon name="download" className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleButtonClick(e, onDelete)} title="Delete Image" className="p-2 rounded-full bg-gray-700 hover:bg-red-600 text-white transition-colors">
                <Icon name="trash" className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void, disabled?: boolean, children: React.ReactNode }> = ({ onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="px-3 py-1.5 text-xs font-semibold text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
    >
        {children}
    </button>
);


const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  isLoading, 
  isDownloading,
  selectedImageIds,
  onSelectAsReference, 
  onDelete, 
  onView,
  onToggleSelection,
  onSelectAll,
  onSelectNone,
  onInvertSelection,
  onDownloadSelected
}) => {
  const numSelected = selectedImageIds.size;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
          <h2 className="text-2xl font-bold text-orange-400">Generated Images</h2>
          {images.length > 0 && (
              <div className="flex items-center space-x-2">
                  <ToolbarButton onClick={onSelectAll}>Select All</ToolbarButton>
                  <ToolbarButton onClick={onSelectNone} disabled={numSelected === 0}>Select None</ToolbarButton>
                  <ToolbarButton onClick={onInvertSelection}>Invert</ToolbarButton>
                  <button
                      onClick={onDownloadSelected}
                      disabled={numSelected === 0 || isDownloading}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                      {isDownloading ? <Spinner /> : `Download Selected (${numSelected})`}
                  </button>
              </div>
          )}
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 min-h-[20rem]">
        {(isLoading && images.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Spinner large />
            <p className="mt-4">Generating your image...</p>
          </div>
        ) : images.length > 0 || isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading && (
              <div className="bg-gray-700 rounded-xl flex items-center justify-center aspect-square animate-pulse">
                <Spinner />
              </div>
            )}
            {images.map(image => (
              <ImageCard 
                key={image.id} 
                image={image} 
                isSelected={selectedImageIds.has(image.id)}
                onSelect={() => onSelectAsReference(image.src)}
                onDelete={() => onDelete(image.id)}
                onView={() => onView(image.src)}
                onToggleSelection={() => onToggleSelection(image.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Icon name="image" className="w-16 h-16 mb-4" />
            <p>Your generated images will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;