
import React from 'react';

const Disclaimer: React.FC = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-3">
      <h2 className="text-lg font-bold text-orange-400">Disclaimer</h2>
      <div className="text-sm text-gray-400 space-y-2">
        <p>
          By using this tool, you agree to do so ethically and responsibly. Do not use this tool to create harmful, misleading, or offensive content.
        </p>
        <p>
          You are responsible for the images you create and must respect the copyright and privacy rights of others. AI-generated images may not be unique and could resemble existing copyrighted material.
        </p>
        <p>
          The developers of this tool are not liable for any misuse or for any legal issues that may arise from the content you generate. Your use of this tool is also subject to the <a href="https://policies.google.com/terms/generative-ai" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Generative AI Terms of Service</a>.
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;