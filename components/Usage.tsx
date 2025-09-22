
import React from 'react';

const Usage: React.FC = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-3">
      <h2 className="text-lg font-bold text-orange-400">Usage</h2>
      <div className="text-sm text-gray-400 space-y-2">
        <p>
          This tool is designed to generate consistent image concepts for training LoRA (Low-Rank Adaptation) models in diffusion-based image generators. It specializes in creating varied headshots of a subject from multiple angles and with different expressions while preserving their core facial morphology.
        </p>
        <h3 className="text-base font-semibold text-gray-300 pt-2">Optional Modifiers</h3>
        <p>
            These settings are crucial for preventing your LoRA from "overfitting" or locking onto unintended concepts from your training images.
        </p>
        <p>
            Enabling the <strong className="font-semibold text-gray-300">"Random"</strong> switch for Hair, Clothing, or Background instructs the AI to introduce variety. For example, a random background will generate a range of solid, neutral colors. This teaches the LoRA that the background is not part of the core concept (the person's face), making your final LoRA more flexible and powerful.
        </p>
        <p>
            If you want to train a specific hairstyle or outfit as part of the concept, leave "Random" disabled and describe it in the text box.
        </p>
      </div>
    </div>
  );
};

export default Usage;