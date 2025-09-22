
import React from 'react';
import type { GenerationConfig, AngleX, AngleY, SubjectType, Expression } from '../types';
import { ANGLES_X, ANGLES_Y } from '../constants';

interface AngleSelectorProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
}

const AngleIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
    // Fix for error: Cannot find namespace 'JSX'.
    const icons = {
        'profile-left': <path d="M8 4v16h2V4H8zm6 2a4 4 0 00-4 4v4a4 4 0 004 4h2v-2h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2V6h-2z" />,
        'tq-left': <path d="M10 6a4 4 0 00-4 4v4a4 4 0 004 4h2v-2h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2V6h-2zM6 4h2v16H6V4z" />,
        'front': <path d="M10 6a4 4 0 00-4 4v4a4 4 0 004 4h4a4 4 0 004-4v-4a4 4 0 00-4-4h-4zm0 2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z" />,
        'tq-right': <path d="M14 6a4 4 0 014 4v4a4 4 0 01-4 4h-2v-2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2V6h2zm4 14h2V4h-2v16z" />,
        'profile-right': <path d="M16 4v16h-2V4h2zM10 6a4 4 0 014 4v4a4 4 0 01-4 4H8v-2h2a2 2 0 002-2v-4a2 2 0 00-2-2H8V6h2z" />,
        'up-high': <path d="M12 4l-4 4h8l-4-4zm0 16a8 8 0 008-8h-2a6 6 0 01-6 6v2z" />,
        'up': <path d="M12 8l-4 4h8l-4-4zm0 10a6 6 0 006-6h-2a4 4 0 01-4 4v2z" />,
        'level': <path d="M4 11h16v2H4v-2z" />,
        'down': <path d="M12 16l4-4H8l4 4zm0-10a6 6 0 00-6 6h2a4 4 0 014-4v-2z" />,
        'down-low': <path d="M12 20l4-4H8l4 4zM12 4a8 8 0 00-8 8h2a6 6 0 016-6v-2z" />,
    };
    return <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>{icons[name]}</svg>
};

const VisualAid: React.FC<{ subjectType: SubjectType; expression: Expression }> = ({ subjectType, expression }) => {
    if (subjectType === 'Object') {
        return (
            <div className="absolute w-full h-full bg-gray-700/50 border border-gray-600 rounded-md flex items-center justify-center text-gray-400" style={{ transform: 'translateZ(8px)'}}>
                <div className="w-1/2 h-1/2 bg-gray-600 rounded"></div>
            </div>
        );
    }

    const getExpressionPath = () => {
        switch (expression) {
            case 'Smiling': return 'M 6 11 Q 8 13 10 11';
            case 'Laughing': return 'M 5 11 C 5 14 11 14 11 11';
            case 'Sad': return 'M 6 13 Q 8 11 10 13';
            case 'Angry': return 'M 6 13 L 10 11';
            case 'Surprised': return 'M 8 11 A 1.5 1.5 0 0 1 8 11 Z'; // A circle
            case 'Thoughtful': return 'M 6 12 L 10 12';
            case 'Neutral':
            default:
                return 'M 6 12 H 10';
        }
    };

    return (
        <div className="absolute w-full h-full bg-gray-700/50 border border-gray-600 rounded-full flex items-center justify-center text-gray-400" style={{ transform: 'translateZ(8px)'}}>
            <svg viewBox="0 0 16 16" className="w-12 h-12 text-gray-500">
                {/* Eyes */}
                <circle cx="5" cy="7" r="0.5" fill="currentColor" />
                <circle cx="11" cy="7" r="0.5" fill="currentColor" />
                {/* Mouth */}
                <path d={getExpressionPath()} stroke="currentColor" strokeWidth="0.5" fill="none" strokeLinecap="round" />
            </svg>
        </div>
    );
};


const AngleSelector: React.FC<AngleSelectorProps> = ({ config, setConfig }) => {
    
  const handleSelect = (key: 'angleX' | 'angleY', value: AngleX | AngleY) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getRotation = () => {
    const xMap: Record<AngleX, number> = {
      'Profile Left': -90,
      'Three-Quarter Left': -45,
      'Front View': 0,
      'Three-Quarter Right': 45,
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

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">Angle</label>
      
      {/* Combined Orientation Display */}
      <div className="flex justify-center items-center h-24 bg-gray-900 rounded-lg p-2" style={{ perspective: '300px' }}>
         <div className="relative w-16 h-16 transition-transform duration-300" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`}}>
            <VisualAid subjectType={config.subjectType} expression={config.expression} />
            {/* A simple line to indicate "front" */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-orange-500" style={{ transform: 'translateZ(17px)' }}></div>
         </div>
      </div>

      {/* X-Axis Control */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">Horizontal Angle (Yaw)</label>
        <div className="grid grid-cols-5 gap-1">
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
