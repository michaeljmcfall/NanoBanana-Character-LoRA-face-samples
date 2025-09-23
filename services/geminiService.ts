
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerationConfig, OutputResolution, AngleX, AngleY, SubjectType } from '../types';

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

/**
 * Provides a detailed, unambiguous description for a given horizontal angle.
 * This establishes a clear frame of reference (the viewer's perspective) for the AI model.
 * @param angleX The selected horizontal angle.
 * @returns A detailed string description.
 */
function getAngleXDescription(angleX: AngleX): string {
  switch (angleX) {
    case 'Profile Left':
      return "Profile Left: A profile view of the subject's left side, with the subject looking towards the viewer's left.";
    case 'Three-Quarter Left':
      return "Three-Quarter Left: The subject is turned towards the viewer's left, showing more of their left side than their right.";
    case 'Slight Left':
      return "Slight Left: The subject is turned just slightly towards the viewer's left, away from the camera.";
    case 'Front View':
      return "Front View: A direct, front-facing view of the subject.";
    case 'Slight Right':
      return "Slight Right: The subject is turned just slightly towards the viewer's right, away from the camera.";
    case 'Three-Quarter Right':
      return "Three-Quarter Right: The subject is turned towards the viewer's right, showing more of their right side than their left.";
    case 'Profile Right':
      return "Profile Right: A profile view of the subject's right side, with the subject looking towards the viewer's right.";
    default:
      // This fallback should not be reached with the current types, but it's good practice.
      return angleX;
  }
}

/**
 * Provides a detailed, unambiguous description for a given vertical angle (head tilt).
 * This encourages the AI to generate more realistic anatomical changes for humanoid subjects.
 * @param angleY The selected vertical angle.
 * @param subjectType The type of subject being generated.
 * @returns A detailed string description.
 */
function getAngleYDescription(angleY: AngleY, subjectType: SubjectType): string {
  // For objects, maintain the simple, direct description.
  if (subjectType === 'Object') {
    return `${angleY}. This is the up-and-down tilt of the object.`;
  }

  // For humanoids, provide nuanced descriptions focusing on head movement and anatomy.
  switch (angleY) {
    case 'Tilted Up High':
      return "Tilted Up High: The subject's head is tilted far back, looking upwards. The chin is high, and the neck is stretched.";
    case 'Tilted Up':
      return "Tilted Up: The subject's head is tilted slightly back, looking slightly upwards. The chin is raised.";
    case 'Level View':
      return "Level View: The subject is looking straight ahead, with their head level.";
    case 'Tilted Down':
      return "Tilted Down: The subject's head is tilted slightly forward, with the chin lowered towards the chest.";
    case 'Tilted Down Low':
      return "Tilted Down Low: The subject's head is tilted far forward, looking down towards their chest. This may cause the skin under the chin to compress.";
    default:
      // Fallback for safety, though should not be reached with current types.
      return `${angleY}. This is the up-and-down tilt of the subject.`;
  }
}


function buildPrompt(config: GenerationConfig): string {
  const angleXDescription = getAngleXDescription(config.angleX);
  const angleYDescription = getAngleYDescription(config.angleY, config.subjectType);

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

  const commonModifiers = `
You can apply the following stylistic modifications if specified:
- **Hair:** ${hairInstruction}
- **Clothing:** ${clothingInstruction}
- **Background:** ${backgroundInstruction}
  `.trim();

  switch (config.subjectType) {
    case 'Cartoon / 3D CGI Character':
    case 'Humanoid Creature':
      return `
You are an expert character artist and 3D modeler. Your task is to generate a new image of the character in the provided reference photo. The new image must strictly adhere to the following criteria:

1.  **Horizontal Angle (Yaw):** ${angleXDescription}.
2.  **Vertical Angle (Head Tilt):** ${angleYDescription}
3.  **Expression:** ${config.expression}.
4.  **Subject Type:** ${config.subjectType}.
5.  **Morphology and Design Preservation:** This is the most critical rule. You MUST preserve the character's unique physical structure, design features, art style, color palette, and proportions from the reference image. The generated image must look like the exact same character, just from a different angle and with a different expression.

${commonModifiers}

The output image must be a high-quality, professional digital artwork with a resolution of ${width}x${height} pixels. Do not add any text or watermarks.
      `.trim();
    
    case 'Object':
        return `
You are an expert product and still life photographer. Your task is to generate a new image of the object in the provided reference photo. The new image must strictly adhere to the following criteria:

1.  **Horizontal Angle (Yaw):** ${angleXDescription}.
2.  **Vertical Angle (Head Tilt):** ${angleYDescription}
3.  **Subject Type:** ${config.subjectType}.
4.  **Design and Shape Preservation:** This is the most critical rule. You MUST preserve the object's unique structure, shape, texture, materials, colors, and any intricate details from the reference image. The generated image must look like the exact same object, just from a different angle.

You can apply the following stylistic modifications if specified:
- **Background:** ${backgroundInstruction}

The output image must be a high-quality, photorealistic product shot with a resolution of ${width}x${height} pixels. Do not add any text or watermarks.
      `.trim();

    case 'Male':
    case 'Female':
    case 'Non-binary':
    default:
      return `
You are an expert photorealistic image editor. Your task is to generate a new image of the person in the provided reference photo. The new image must strictly adhere to the following criteria:

1.  **Horizontal Angle (Yaw):** ${angleXDescription}.
2.  **Vertical Angle (Head Tilt):** ${angleYDescription}
3.  **Facial Expression:** ${config.expression}.
4.  **Subject Type:** ${config.subjectType}.
5.  **Identity Preservation:** This is the most critical rule. You MUST preserve the person's unique facial structure, features, skin texture, moles, scars, and any asymmetries from the reference image. The generated image must look like the exact same person, just from a different angle and with a different expression.

${commonModifiers}

The output image must be a high-quality, photorealistic portrait with a resolution of ${width}x${height} pixels. Do not add any text or watermarks.
      `.trim();
  }
}

export async function generateImageVariation(
  base64ImageData: string,
  mimeType: string,
  config: GenerationConfig
): Promise<{ newImageBase64: string; prompt: string }> {
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
      return { newImageBase64: part.inlineData.data, prompt };
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
): Promise<{ newImageBase64: string; prompt: string }> {
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
      return { newImageBase64: part.inlineData.data, prompt };
    }
  }

  const textPart = response.candidates[0].content.parts.find(p => p.text)?.text;
  if (textPart) {
      throw new Error(`Model returned text instead of an image during optimization: ${textPart}`);
  }

  throw new Error("Image optimization failed. The model did not return an image.");
}
