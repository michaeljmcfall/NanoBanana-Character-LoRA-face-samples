import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerationConfig, OutputResolution } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Generates a random RGB color, excluding pure black and pure white.
 * @returns An object with r, g, and b properties.
 */
const getRandomColor = (): { r: number; g: number; b: number } => {
  let r, g, b;
  do {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
  } while (
    (r === 0 && g === 0 && b === 0) || // Exclude pure black
    (r === 255 && g === 255 && b === 255) // Exclude pure white
  );
  return { r, g, b };
};


function buildPrompt(config: GenerationConfig): string {
  const hairInstruction = config.randomHair
    ? `Randomly select a probabilistically likely hair style and color for a ${config.subjectType} subject.`
    : config.hair || 'Maintain original style and color.';

  let backgroundInstruction: string;
  if (config.randomBackground) {
    const { r, g, b } = getRandomColor();
    // Instruct the model to use a specific random color for better variety.
    backgroundInstruction = `Solid color background with RGB value (${r}, ${g}, ${b}).`;
  } else {
    backgroundInstruction = config.background || 'Neutral studio gray background.';
  }

  const clothingInstruction = config.randomClothing
    ? `Randomly select a probabilistically likely clothing style for a ${config.subjectType} subject.`
    : config.clothing || 'Maintain original clothing style.';
    
  const [width, height] = config.outputResolution.split('x');

  return `
You are an expert photorealistic image editor. Your task is to generate a new image of the person in the provided reference photo. The new image must strictly adhere to the following criteria:

1.  **Angle:** ${config.angle}.
2.  **Facial Expression:** ${config.expression}.
3.  **Subject Type:** ${config.subjectType}.
4.  **Identity Preservation:** This is the most critical rule. You MUST preserve the person's unique facial structure, features, skin texture, moles, scars, and any asymmetries from the reference image. The generated image must look like the exact same person, just from a different angle and with a different expression.

You can apply the following stylistic modifications if specified:
- **Hair:** ${hairInstruction}
- **Clothing:** ${clothingInstruction}
- **Background:** ${backgroundInstruction}

The output image must be a high-quality, photorealistic portrait with a resolution of ${width}x${height} pixels. Do not add any text or watermarks.
  `.trim();
}

export async function generateImageVariation(
  base64ImageData: string,
  mimeType: string,
  config: GenerationConfig
): Promise<string> {
  const prompt = buildPrompt(config);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  // Check if text part contains an error message from the model
  const textPart = response.candidates[0].content.parts.find(p => p.text)?.text;
  if (textPart) {
      throw new Error(`Model returned text instead of an image: ${textPart}`);
  }

  throw new Error("Image generation failed. The model did not return an image.");
}


export async function optimizeReferenceImage(
  base64ImageData: string,
  mimeType: string,
  outputResolution: OutputResolution
): Promise<string> {
  const [width, height] = outputResolution.split('x');
  const prompt = `
You are a meticulous, expert photorealistic image editor. Your ONLY task is to prepare a reference headshot for a machine learning dataset. Precision and accuracy are paramount.

**ABSOLUTE RULE: YOU MUST NOT ALTER THE SUBJECT'S ORIGINAL FACIAL PIXELS.** The subject's facial width, height, proportions, and features must be preserved with 100% accuracy. DO NOT narrow, stretch, pinch, or otherwise distort the face. The final person must be identical to the original.

Follow this workflow strictly:

**Step 1: Analyze for Cropping.**
- Look at the provided image. Is any part of the subject's head or hair cut off by the image border?

**Step 2: Non-Destructive Outfill (if necessary).**
- If the head or hair is cropped, your first and only action on the subject is to perform a generative outfill (outpainting).
- **CRITICAL:** This process must ONLY ADD new pixels to recreate the missing parts of the head/hair. It must NOT change the existing pixels of the subject's face. Imagine you are extending the canvas and painting in only the missing information.

**Step 3: Frame the Composition.**
- Once the full head and hair are visible (either from the original or after outfilling), create a new 1:1 square canvas.
- Place the complete subject in the center of this canvas.
- Ensure there is comfortable headroom above the hair and balanced space on the left and right sides. Do not crop the subject. The entire head and hair must be visible and unmasked. Use a 1:1 uniform scale if you need to resize the subject to fit; never scale non-uniformly.

**Step 4: Replace Background.**
- Replace the entire background (everything that is not the subject) with a solid, flat, neutral gray color (#808080).

**Final Output:**
- The final image must be a perfectly centered, 1:1 square photorealistic headshot with a resolution of ${width}x${height} pixels, a complete, uncropped head and hair, and a neutral gray background.
- Output ONLY the final image. No text, no explanation.
  `.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  const textPart = response.candidates[0].content.parts.find(p => p.text)?.text;
  if (textPart) {
      throw new Error(`Model returned text instead of an image during optimization: ${textPart}`);
  }

  throw new Error("Image optimization failed. The model did not return an image.");
}