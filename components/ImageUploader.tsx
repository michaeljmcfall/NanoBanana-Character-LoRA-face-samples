
import React, { useState, useCallback } from 'react';
import Icon from './Icon';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file);
          onImageUpload(base64);
        } catch (error) {
          console.error("Error converting file to base64", error);
        }
      } else {
        alert("Please select an image file.");
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onImageUpload]);

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-dashed border-gray-600">
      <label
        htmlFor="image-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer transition-colors ${isDragging ? 'bg-orange-900/50 border-orange-500' : 'hover:bg-gray-700/50'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <Icon name="upload" className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-orange-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, or WEBP (1024x1024 recommended)</p>
        </div>
        <input 
          id="image-upload" 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
