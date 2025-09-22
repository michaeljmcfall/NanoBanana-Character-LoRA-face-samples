import React from 'react';
import type { GenerationConfig, AngleX, AngleY, SubjectType, Expression } from '../types';
import { ANGLES_X, ANGLES_Y } from '../constants';

interface AngleSelectorProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
}

const AngleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
    // Fix for error: Cannot find namespace 'JSX'.
    const icons: Record<string, JSX.Element> = {
        'profile-left': <path d="M8 4 L8 20 L2 12 Z M22 11 L10 11 L10 13 L22 13 Z" />,
        'tq-left': <path d="M13 6 L13 18 L5 12 Z" />,
        'slight-left': <path d="M15 8 L15 16 L9 12 Z" />,
        'front': <path d="M10 6a4 4 0 00-4 4v4a4 4 0 004 4h4a4 4 0 004-4v-4a4 4 0 00-4-4h-4zm0 2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z" />,
        'slight-right': <path d="M9 8 L9 16 L15 12 Z" />,
        'tq-right': <path d="M11 6 L11 18 L19 12 Z" />,
        'profile-right': <path d="M16 4 L16 20 L22 12 Z M2 11 L14 11 L14 13 L2 13 Z" />,
        'up-high': <path d="M12 2 L4 10 L9 10 L9 16 L15 16 L15 10 L20 10 Z" />,
        'up': <path d="M12 6 L6 12 L10 12 L10 18 L14 18 L14 12 L18 12 Z" />,
        'level': <path d="M4 11h16v2H4v-2z" />,
        'down': <path d="M12 18 L18 12 L14 12 L14 6 L10 6 L10 12 L6 12 Z" />,
        'down-low': <path d="M12 22 L20 14 L15 14 L15 8 L9 8 L9 14 L4 14 Z" />,
    };
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>{icons[name]}</svg>
};

const VisualAid: React.FC<{ subjectType: SubjectType; expression: Expression }> = ({ subjectType, expression }) => {
    const depth = 12; // Total depth of the 3D object in pixels
    const halfDepth = depth / 2;

    const getExpressionFeatures = () => {
        const defaultPathProps = {
            stroke: "currentColor",
            strokeWidth: "0.6",
            fill: "none",
            strokeLinecap: "round" as const,
        };

        const defaultEyeProps = {
            fill: "currentColor",
        };

        switch (expression) {
            case 'Smiling':
                return <>
                    {/* Eyes */}
                    <circle cx="5" cy="7" r="0.6" {...defaultEyeProps} />
                    <circle cx="11" cy="7" r="0.6" {...defaultEyeProps} />
                    {/* Eyebrows */}
                    <path d="M 4 5 Q 5.25 4 6.5 5" {...defaultPathProps} />
                    <path d="M 9.5 5 Q 10.75 4 12 5" {...defaultPathProps} />
                    {/* Mouth */}
                    <path d="M 6 11 Q 8 13.5 10 11" {...defaultPathProps} />
                </>;
            case 'Laughing':
                return <>
                    {/* Eyes (squinted) */}
                    <path d="M 4 7 Q 5.25 6.5 6.5 7" {...defaultPathProps} />
                    <path d="M 9.5 7 Q 10.75 6.5 12 7" {...defaultPathProps} />
                    {/* Eyebrows */}
                    <path d="M 4 5 Q 5.25 4 6.5 5" {...defaultPathProps} />
                    <path d="M 9.5 5 Q 10.75 4 12 5" {...defaultPathProps} />
                    {/* Mouth (wide grin) */}
                    <path d="M 5 11 C 5 14, 11 14, 11 11" {...defaultPathProps} />
                </>;
            case 'Sad':
                return <>
                    {/* Eyes */}
                    <circle cx="5" cy="7" r="0.6" {...defaultEyeProps} />
                    <circle cx="11" cy="7" r="0.6" {...defaultEyeProps} />
                    {/* Eyebrows */}
                    <path d="M 4 5.5 L 6.5 4.5" {...defaultPathProps} />
                    <path d="M 9.5 4.5 L 12 5.5" {...defaultPathProps} />
                    {/* Mouth */}
                    <path d="M 6 13 H 10" {...defaultPathProps} />
                </>;
            case 'Angry':
                 return <>
                    {/* Eyes */}
                    <circle cx="5" cy="7" r="0.6" {...defaultEyeProps} />
                    <circle cx="11" cy="7" r="0.6" {...defaultEyeProps} />
                    {/* Eyebrows */}
                    <path d="M 4 4.5 L 6.5 5.5" {...defaultPathProps} />
                    <path d="M 9.5 5.5 L 12 4.5" {...defaultPathProps} />
                    {/* Mouth */}
                    <path d="M 6 13 Q 8 10.5 10 13" {...defaultPathProps} />
                </>;
            case 'Surprised':
                 return <>
                    {/* Eyes (wide) */}
                    <circle cx="5" cy="7" r="0.8" {...defaultEyeProps} />
                    <circle cx="11" cy="7" r="0.8" {...defaultEyeProps} />
                    {/* Eyebrows */}
                    <path d="M 4 4.5 Q 5.25 3 6.5 4.5" {...defaultPathProps} />
                    <path d="M 9.5 4.5 Q 10.75 3 12 4.5" {...defaultPathProps} />
                    {/* Mouth (O) */}
                    <circle cx="8" cy="12" r="1.5" stroke="currentColor" strokeWidth="0.6" fill="none" />
                </>;
            case 'Thoughtful':
                return <>
                    {/* Eyes */}
                    <circle cx="5" cy="7" r="0.6" {...defaultEyeProps} />
                    <circle cx="11" cy="7" r="0.6" {...defaultEyeProps} />
                    {/* Eyebrows (asymmetric) */}
                    <path d="M 4 5 H 6.5" {...defaultPathProps} />
                    <path d="M 9.5 4.5 Q 10.75 3.5 12 4.5" {...defaultPathProps} />
                    {/* Mouth */}
                    <path d="M 6 12 H 10" {...defaultPathProps} />
                </>;
            case 'Neutral':
            default:
                return <>
                    {/* Eyes */}
                    <circle cx="5" cy="7" r="0.6" {...defaultEyeProps} />
                    <circle cx="11" cy="7" r="0.6" {...defaultEyeProps} />
                    {/* Eyebrows */}
                    <path d="M 4 5 H 6.5" {...defaultPathProps} />
                    <path d="M 9.5 5 H 12" {...defaultPathProps} />
                    {/* Mouth */}
                    <path d="M 6 12 H 10" {...defaultPathProps} />
                </>;
        }
    };

    const isObject = subjectType === 'Object';
    const shapeClass = isObject ? 'rounded' : 'rounded-full';

    // Create the "rim" or "edge" of the object with a stack of solid layers
    const rimLayers = Array.from({ length: depth }).map((_, i) => {
        const zPos = (halfDepth - 0.5) - i; // Spread layers from just behind front to just before back
        const transform = `translateZ(${zPos}px)`;
        
        // Use a darker color for the rim to simulate shadow
        return (
            <div
                key={`rim-${i}`}
                className={`absolute w-full h-full ${shapeClass} bg-gray-800`}
                style={{ transform, zIndex: depth - i }}
            />
        );
    });

    const frontFace = (
        <div
            className={`absolute w-full h-full ${shapeClass} bg-gray-600 border border-gray-500 flex items-center justify-center`}
            style={{ transform: `translateZ(${halfDepth}px)`, zIndex: depth + 2 }}
        >
            {isObject ? (
                <div className="w-1/2 h-1/2 bg-gray-500 rounded-sm" />
            ) : (
                <svg viewBox="0 0 16 16" className="w-12 h-12 text-gray-400">
                    {getExpressionFeatures()}
                </svg>
            )}
        </div>
    );

    const backFace = (
        <div
            className={`absolute w-full h-full ${shapeClass} bg-gray-900`}
            style={{ transform: `translateZ(-${halfDepth}px)`, zIndex: 1 }}
        />
    );

    return <>{[backFace, ...rimLayers, frontFace]}</>;
};


const AngleSelector: React.FC<AngleSelectorProps> = ({ config, setConfig }) => {
    
  const handleSelect = (key: 'angleX' | 'angleY', value: AngleX | AngleY) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getRotation = () => {
    const xMap: Record<AngleX, number> = {
      'Profile Left': -90,
      'Three-Quarter Left': -60,
      'Slight Left': -30,
      'Front View': 0,
      'Slight Right': 30,
      'Three-Quarter Right': 60,
      'Profile Right': 90,
    };
    // Inverted for intuitive control: positive rotateX tilts "up" (away from viewer)
    const yMap: Record<AngleY, number> = {
        'Tilted Up High': 30,
        'Tilted Up': 15,
        'Level View': 0,
        'Tilted Down': -15,
        'Tilted Down Low': -30,
    };
    return {
        y: xMap[config.angleX] || 0,
        x: yMap[config.angleY] || 0,
    }
  }

  const rotation = getRotation();
  const depth = 12; // Must match depth in VisualAid

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">Angle</label>
      
      {/* Combined Orientation Display */}
      <div className="flex justify-center items-center h-24 bg-gray-900 rounded-lg p-2" style={{ perspective: '300px' }}>
         <div className="relative w-16 h-16 transition-transform duration-300" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`}}>
            <VisualAid subjectType={config.subjectType} expression={config.expression} />
            {/* The orange "facing" indicator */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-orange-500" style={{ transform: `translateZ(${depth / 2 + 5}px)` }}></div>
         </div>
      </div>

      {/* X-Axis Control */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">Horizontal Angle (Yaw)</label>
        <div className="grid grid-cols-7 gap-1">
          {ANGLES_X.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleSelect('angleX', value)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-xs ${config.angleX === value ? 'bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
              title={value}
            >
              <AngleIcon name={icon} className="w-5 h-5 mb-1" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Y-Axis Control */}
       <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">Vertical Angle (Pitch)</label>
        <div className="grid grid-cols-5 gap-1">
          {[...ANGLES_Y].reverse().map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleSelect('angleY', value)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-xs ${config.angleY === value ? 'bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
              title={value}
            >
              <AngleIcon name={icon} className="w-5 h-5 mb-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AngleSelector;