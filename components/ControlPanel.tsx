
import React from 'react';
import type { GenerationConfig, Expression, SubjectType, OutputResolution } from '../types';
import { EXPRESSIONS, SUBJECT_TYPES, OUTPUT_RESOLUTIONS } from '../constants';
import Spinner from './Spinner';
import AngleSelector from './AngleSelector';

interface ControlPanelProps {
  config: GenerationConfig;
  setConfig: React.Dispatch<React.SetStateAction<GenerationConfig>>;
  onGenerate: () => void;
  isLoading: boolean;
  hasReferenceImage: boolean;
  referenceImageResolution: string | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onGenerate, isLoading, hasReferenceImage, referenceImageResolution }) => {
  
  const handleSelectChange = <T,>(key: keyof GenerationConfig, value: T) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (key: 'randomHair' | 'randomBackground' | 'randomClothing') => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isObjectSubject = config.subjectType === 'Object';

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-orange-400">Generation Controls</h2>

      {/* Input Resolution */}
      <div>
        <label htmlFor="inputResolution" className="block text-sm font-medium text-gray-300 mb-2">Input Image Resolution</label>
        <input
          type="text"
          name="inputResolution"
          id="inputResolution"
          value={referenceImageResolution || 'N/A'}
          disabled
          className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-400 disabled:cursor-not-allowed"
        />
      </div>

      {/* Output Resolution */}
      <div>
        <label htmlFor="outputResolution" className="block text-sm font-medium text-gray-300 mb-2">Output Image Resolution</label>
        <select
          id="outputResolution"
          name="outputResolution"
          value={config.outputResolution}
          onChange={(e) => handleSelectChange('outputResolution', e.target.value as OutputResolution)}
          className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white"
        >
          {OUTPUT_RESOLUTIONS.map(res => <option key={res}>{res}</option>)}
        </select>
      </div>

      {/* Subject Type Selector */}
      <div>
        <label htmlFor="subjectType" className="block text-sm font-medium text-gray-300 mb-2">Subject Type</label>
        <select
          id="subjectType"
          name="subjectType"
          value={config.subjectType}
          onChange={(e) => handleSelectChange('subjectType', e.target.value as SubjectType)}
          className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white"
        >
          {SUBJECT_TYPES.map(type => <option key={type}>{type}</option>)}
        </select>
      </div>
      
      {/* Angle Selector */}
      <AngleSelector config={config} setConfig={setConfig} />

      {/* Expression Selector */}
      <div>
        <label htmlFor="expression" className="block text-sm font-medium text-gray-300 mb-2">
            Facial Expression
        </label>
        <select
          id="expression"
          name="expression"
          value={config.expression}
          onChange={(e) => handleSelectChange('expression', e.target.value as Expression)}
          disabled={isObjectSubject}
          className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {EXPRESSIONS.map(exp => <option key={exp}>{exp}</option>)}
        </select>
        {isObjectSubject && (
            <p className="text-xs text-gray-500 mt-1">Not applicable for 'Object' subject type.</p>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-300 pt-2 border-t border-gray-700">Optional Modifiers</h3>
      
      {/* Modifiers */}
      <div className="space-y-4">
        {!isObjectSubject && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="hair" className="block text-sm font-medium text-gray-300">Hair Style/Color</label>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-400 mr-2">Random</span>
                <button
                  type="button"
                  onClick={() => handleToggleChange('randomHair')}
                  className={`${config.randomHair ? 'bg-orange-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                  role="switch"
                  aria-checked={config.randomHair}
                >
                  <span
                    aria-hidden="true"
                    className={`${config.randomHair ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
            <input
              type="text"
              name="hair"
              id="hair"
              value={config.hair}
              onChange={handleInputChange}
              disabled={config.randomHair}
              placeholder={config.randomHair ? "Randomly generated" : "e.g., short, curly, blue"}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
            />
          </div>
        )}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="background" className="block text-sm font-medium text-gray-300">Background</label>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-400 mr-2">Random</span>
              <button
                type="button"
                onClick={() => handleToggleChange('randomBackground')}
                className={`${config.randomBackground ? 'bg-orange-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                role="switch"
                aria-checked={config.randomBackground}
              >
                <span
                  aria-hidden="true"
                  className={`${config.randomBackground ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
          <input
            type="text"
            name="background"
            id="background"
            value={config.background}
            onChange={handleInputChange}
            disabled={config.randomBackground}
            placeholder={config.randomBackground ? "Random solid color" : "e.g., city at night, forest"}
            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
          />
        </div>
        {!isObjectSubject && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="clothing" className="block text-sm font-medium text-gray-300">Clothing</label>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-400 mr-2">Random</span>
              <button
                type="button"
                onClick={() => handleToggleChange('randomClothing')}
                className={`${config.randomClothing ? 'bg-orange-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                role="switch"
                aria-checked={config.randomClothing}
              >
                <span
                  aria-hidden="true"
                  className={`${config.randomClothing ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
          <input
            type="text"
            name="clothing"
            id="clothing"
            value={config.clothing}
            onChange={handleInputChange}
            disabled={config.randomClothing}
            placeholder={config.randomClothing ? "Randomly generated" : "e.g., leather jacket, hoodie"}
            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white disabled:bg-gray-700 disabled:cursor-not-allowed"
          />
        </div>
        )}
      </div>
      
      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isLoading || !hasReferenceImage}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Spinner /> : 'Generate Image'}
      </button>

    </div>
  );
};

export default ControlPanel;
