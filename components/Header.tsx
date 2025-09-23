
import React from 'react';
import Icon from './Icon';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/40 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center">
         <Icon name="gemini" className="w-8 h-8 mr-3 flex-shrink-0" />
        <h1 className="text-xl font-bold text-white tracking-wider">
          AI Face Concept Generator for LoRAs
        </h1>
      </div>
    </header>
  );
};

export default Header;