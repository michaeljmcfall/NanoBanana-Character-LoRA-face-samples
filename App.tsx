
import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import type { GenerationConfig, GeneratedImage, OptimizedImage, LogEntry, LogType, ReferenceImageInfo } from './types';
import { ANGLES_X, ANGLES_Y, EXPRESSIONS, SUBJECT_TYPES, OUTPUT_RESOLUTIONS } from './constants';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import ImageGallery from './components/ImageGallery';
import OptimizedImageGallery from './components/OptimizedImageGallery';
import Spinner from './components/Spinner';
import LogPanel from './components/LogPanel';
import PromptDisplay from './components/PromptDisplay';
import ImageModal from './components/ImageModal';
import Icon from './components/Icon';
import Disclaimer from './components/Disclaimer';
import { generateImageVariation, optimizeReferenceImage } from './services/geminiService';

const App: React.FC = () => {
  const [referenceImage, setReferenceImage] = useState<ReferenceImageInfo | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);
  const [selectedOptimizedImage, setSelectedOptimizedImage] = useState<OptimizedImage | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());


  const addLog = useCallback((type: LogType, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [{ timestamp, type, message }, ...prevLogs]);
  }, []);


  const [config, setConfig] = useState<GenerationConfig>({
    angleX: ANGLES_X[2].value, // Front View
    angleY: ANGLES_Y[2].value, // Level View
    expression: EXPRESSIONS[0],
    subjectType: SUBJECT_TYPES[0],
    outputResolution: OUTPUT_RESOLUTIONS[2], // Default to 1024x1024
    hair: '',
    randomHair: false,
    background: '',
    randomBackground: false,
    clothing: '',
    randomClothing: false,
  });

  const handleImageUpload = useCallback((base64Image: string) => {
    const img = new Image();
    img.onload = () => {
      setReferenceImage({
        src: base64Image,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setGeneratedImages([]);
      setOptimizedImages([]);
      setSelectedOptimizedImage(null);
      setSelectedImageIds(new Set());
      addLog('success', `Reference image uploaded (${img.naturalWidth}x${img.naturalHeight}).`);
    };
    img.src = base64Image;
  }, [addLog]);

  const handleGenerate = useCallback(async () => {
    const imageToGenerateFrom = selectedOptimizedImage?.src || referenceImage?.src;
    if (!imageToGenerateFrom) {
      addLog('error', 'Cannot generate: Please upload a reference image first.');
      return;
    }

    setIsLoading(true);
    addLog('info', `Generating ${config.outputResolution} image with angle: ${config.angleX}, ${config.angleY}...`);

    try {
      const { mimeType, data } = extractMimeAndData(imageToGenerateFrom);
      const { newImageBase64, prompt } = await generateImageVariation(data, mimeType, config);
      setLastPrompt(prompt);
      
      const newImage: GeneratedImage = {
        id: new Date().toISOString(),
        src: `data:image/png;base64,${newImageBase64}`,
        config: { ...config },
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      addLog('success', 'Image generated successfully.');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
      addLog('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [referenceImage, selectedOptimizedImage, config, addLog]);

  const handleOptimize = useCallback(async () => {
    if (!referenceImage) return;

    setIsOptimizing(true);
    addLog('info', `Optimizing reference image to ${config.outputResolution}...`);

    try {
        const { mimeType, data } = extractMimeAndData(referenceImage.src);
        const { newImageBase64, prompt } = await optimizeReferenceImage(data, mimeType, config.outputResolution);
        setLastPrompt(prompt);

        const newOptimizedImage: OptimizedImage = {
            id: new Date().toISOString(),
            src: `data:image/png;base64,${newImageBase64}`,
        };

        setOptimizedImages(prev => [newOptimizedImage, ...prev].slice(0, 9));
        addLog('success', 'Reference image optimized.');
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image optimization.';
        addLog('error', errorMessage);
    } finally {
        setIsOptimizing(false);
    }
  }, [referenceImage, config.outputResolution, addLog]);

  const handleSelectOptimized = (image: OptimizedImage) => {
    setSelectedOptimizedImage(prev => (prev?.id === image.id ? null : image));
  };

  const handleSetOptimizedAsReference = () => {
      if (selectedOptimizedImage) {
          const img = new Image();
          img.onload = () => {
            setReferenceImage({
              src: selectedOptimizedImage.src,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
            setSelectedOptimizedImage(null);
            addLog('info', `Set optimized version as new reference (${img.naturalWidth}x${img.naturalHeight}).`);
          }
          img.src = selectedOptimizedImage.src;
      }
  };

  const extractMimeAndData = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const mimePart = parts[0].match(/:(.*?);/);
    if (!mimePart || mimePart.length < 2) {
        throw new Error("Invalid data URL format");
    }
    const mimeType = mimePart[1];
    const data = parts[1];
    return { mimeType, data };
  };

  const selectImageAsReference = useCallback((imageSrc: string) => {
    const img = new Image();
    img.onload = () => {
      setReferenceImage({
        src: imageSrc,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setSelectedOptimizedImage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addLog('info', `Set generated image as new reference (${img.naturalWidth}x${img.naturalHeight}).`);
    };
    img.src = imageSrc;
  }, [addLog]);
  
  const handleDeleteGeneratedImage = useCallback((imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
    });
    addLog('info', 'Generated image removed.');
  }, [addLog]);
  
  const handleToggleSelection = useCallback((imageId: string) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedImageIds(new Set(generatedImages.map(img => img.id)));
  }, [generatedImages]);

  const handleSelectNone = useCallback(() => {
    setSelectedImageIds(new Set());
  }, []);

  const handleInvertSelection = useCallback(() => {
    const allIds = new Set(generatedImages.map(img => img.id));
    const newSelectedIds = new Set<string>();
    allIds.forEach(id => {
      if (!selectedImageIds.has(id)) {
        newSelectedIds.add(id);
      }
    });
    setSelectedImageIds(newSelectedIds);
  }, [generatedImages, selectedImageIds]);
  
  const handleDownloadSelected = useCallback(async () => {
    if (selectedImageIds.size === 0) {
      addLog('info', 'No images selected to download.');
      return;
    }

    setIsDownloading(true);
    addLog('info', `Preparing to download ${selectedImageIds.size} images...`);

    try {
      const zip = new JSZip();
      const selectedImages = generatedImages.filter(img => selectedImageIds.has(img.id));

      for (const image of selectedImages) {
        const response = await fetch(image.src);
        const blob = await response.blob();
        zip.file(`generated-image-${image.id}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `generated-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      addLog('success', `${selectedImageIds.size} images downloaded successfully.`);
    } catch (err) {
      console.error(err);
      // FIX: The error object `err` is of type `unknown` and cannot be directly
      // used as a string. Check if it's an instance of Error to safely
      // access the message property.
      let message = 'An unknown error occurred during download.';
      if (err instanceof Error) {
        message = err.message;
      }
      addLog('error', `Download failed: ${message}`);
    } finally {
      setIsDownloading(false);
    }
  }, [generatedImages, selectedImageIds, addLog]);

  const displayedReferenceImageSrc = selectedOptimizedImage?.src || referenceImage?.src;
  const referenceImageResolution = referenceImage ? `${referenceImage.width}x${referenceImage.height}` : null;


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <ControlPanel 
                config={config} 
                setConfig={setConfig} 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
                hasReferenceImage={!!referenceImage}
                referenceImageResolution={referenceImageResolution}
              />
              <LogPanel logs={logs} />
              <PromptDisplay prompt={lastPrompt} />
              <Disclaimer />
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-orange-400">Reference Image</h2>
                    {referenceImage ? (
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => displayedReferenceImageSrc && setModalImageUrl(displayedReferenceImageSrc)}
                          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && displayedReferenceImageSrc) setModalImageUrl(displayedReferenceImageSrc) }}
                          role="button"
                          tabIndex={0}
                          aria-label="View reference image in full size"
                        >
                          <img src={displayedReferenceImageSrc} alt="Reference" className="rounded-lg w-full aspect-square object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                            <Icon name="view" className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-400 -mt-2">
                            Source Resolution: {referenceImage.width}x{referenceImage.height}
                        </p>
                        {selectedOptimizedImage && (
                            <button
                                onClick={handleSetOptimizedAsReference}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Use Selected as Reference
                            </button>
                        )}
                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing || !referenceImage}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isOptimizing ? <Spinner /> : 'Optimize Reference Image'}
                        </button>
                    </div>
                    ) : (
                    <ImageUploader onImageUpload={handleImageUpload} />
                    )}
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-orange-400">Optimized References</h2>
                    <OptimizedImageGallery
                        images={optimizedImages}
                        onSelect={handleSelectOptimized}
                        selectedImageId={selectedOptimizedImage?.id}
                    />
                </div>
            </div>
            
            <ImageGallery 
                images={generatedImages}
                isLoading={isLoading}
                isDownloading={isDownloading}
                selectedImageIds={selectedImageIds}
                onSelectAsReference={selectImageAsReference}
                onDelete={handleDeleteGeneratedImage}
                onView={setModalImageUrl}
                onToggleSelection={handleToggleSelection}
                onSelectAll={handleSelectAll}
                onSelectNone={handleSelectNone}
                onInvertSelection={handleInvertSelection}
                onDownloadSelected={handleDownloadSelected}
            />
          </div>
        </div>
      </main>
       {modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      )}
    </div>
  );
};

export default App;