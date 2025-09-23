
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
 * Provides a detailed, unambiguous description for a given horizontal angle from the viewer's perspective.
 * This prevents frame-of-reference errors by using the image frame as the coordinate system.
 * @param angleX The selected horizontal angle.
 * @param subjectType The type of subject being generated.
 * @returns A detailed string description.
 */
function getAngleXDescription(angleX: AngleX, subjectType: SubjectType): string {
  const isObject = subjectType === 'Object';
  const subjectTerm = isObject ? 'the object' : "the subject's face";

  switch (angleX) {
    case 'Profile Left':
      const profileLeftTitle = isObject ? 'Left View' : 'Profile Left';
      return `${profileLeftTitle} (-90°): ${subjectTerm} is oriented directly towards the left edge of the frame.`;
    
    case 'Three-Quarter Left':
      const tqLeftTitle = isObject ? 'Three-Quarter Left View' : 'Three-Quarter Left';
      return `${tqLeftTitle} (-45°): ${subjectTerm} is oriented partially towards the left side of the frame, at roughly a 45-degree angle away from the viewer.`;
    
    case 'Slight Left':
      const slightLeftTitle = isObject ? 'Slight Left View' : 'Slight Left';
      return `${slightLeftTitle} (-22.5°): ${subjectTerm} is oriented slightly towards the left side of the frame.`;
    
    case 'Front View':
      return isObject
        ? `Front View (0°): The object is facing forward, towards the viewer.`
        : `Front View (0°): The subject is looking directly forward, facing the viewer.`;
    
    case 'Slight Right':
      const slightRightTitle = isObject ? 'Slight Right View' : 'Slight Right';
      return `${slightRightTitle} (+22.5°): ${subjectTerm} is oriented slightly towards the right side of the frame.`;
    
    case 'Three-Quarter Right':
      const tqRightTitle = isObject ? 'Three-Quarter Right View' : 'Three-Quarter Right';
      return `${tqRightTitle} (+45°): ${subjectTerm} is oriented partially towards the right side of the frame, at roughly a 45-degree angle away from the viewer.`;
    
    case 'Profile Right':
      const profileRightTitle = isObject ? 'Right View' : 'Profile Right';
      return `${profileRightTitle} (+90°): ${subjectTerm} is oriented directly towards the right edge of the frame.`;
    
    default:
      // This fallback should not be reached with the current types, but it's good practice.
      return angleX;
  }
}

/**
 * Provides a detailed, unambiguous description for a given vertical angle (head tilt or camera pitch).
 * This encourages the AI to generate more realistic anatomical changes for humanoid subjects and correct camera angles for objects.
 * @param angleY The selected vertical angle.
 * @param subjectType The type of subject being generated.
 * @returns A detailed string description.
 */
function getAngleYDescription(angleY: AngleY, subjectType: SubjectType): string {
  // For objects, describe the camera's perspective relative to the object.
  if (subjectType === 'Object') {
    switch (angleY) {
        case 'Tilted Up High':
            return "High-Angle View: The camera is positioned high above the object, looking down at it at a steep angle.";
        case 'Tilted Up':
            return "Slight High-Angle View: The camera is positioned slightly above the object, looking down at it.";
        case 'Level View':
            return "Eye-Level View: The camera is level with the object.";
        case 'Tilted Down':
            return "Slight Low-Angle View: The camera is positioned slightly below the object, looking up at it.";
        case 'Tilted Down Low':
            return "Low-Angle View: The camera is positioned low, looking up at the object from a steep angle.";
        default:
            return `${angleY}. This is the up-and-down camera angle relative to the object.`;
    }
  }

  // For humanoids, provide nuanced descriptions focusing on head movement and anatomy.
  switch (angleY) {
    case 'Tilted Up High':
      return "Tilted Up High (+30°): The subject's head is tilted far back, looking upwards. The chin is high, and the neck is stretched.";
    case 'Tilted Up':
      return "Tilted Up (+15°): The subject's head is tilted slightly back, looking slightly upwards. The chin is raised.";
    case 'Level View':
      return "Level View (0°): The subject is looking straight ahead, with their head level.";
    case 'Tilted Down':
      return "Tilted Down (-15°): The subject's head is tilted slightly forward, with the chin lowered towards the chest.";
    case 'Tilted Down Low':
      return "Tilted Down Low (-30°): The subject's head is tilted far forward, looking down towards their chest. This may cause the skin under the chin to compress.";
    default:
      // Fallback for safety, though should not be reached with current types.
      return `${angleY}. This is the up-and-down tilt of the subject.`;
  }
}


function buildPrompt(config: GenerationConfig): string {
  // Phase 1: Define Persona and Core Objective based on Subject Type
  let intro: string;
  let preservationRule: string;

  switch (config.subjectType) {
    case 'Cartoon / 3D CGI Character':
    case 'Humanoid Creature':
      intro = 'You are an expert character artist and 3D modeler.';
      preservationRule = "You MUST preserve the character's unique physical structure, design features, art style, color palette, and proportions from the reference image. This is Morphology and Design Preservation.";
      break;
    
    case 'Object':
      intro = 'You are an expert product and still life photographer.';
      preservationRule = "You MUST preserve the object's unique structure, shape, texture, materials, colors, and any intricate details from the reference image. This is Design and Shape Preservation.";
      break;

    case 'Male':
    case 'Female':
    case 'Non-binary':
    default:
      intro = 'You are an expert photorealistic image editor.';
      preservationRule = "You MUST preserve the person's unique facial structure, features, skin texture, moles, scars, and any asymmetries from the reference image. This is Identity Preservation.";
      break;
  }

  // Phase 2: Define Primary Transformations (Macro-level changes)
  const angleXDescription = getAngleXDescription(config.angleX, config.subjectType);
  const angleYDescription = getAngleYDescription(config.angleY, config.subjectType);
  const [width, height] = config.outputResolution.split('x');

  const primaryTransformations = `
### PRIMARY TRANSFORMATIONS
You will apply the following main changes to the subject from the reference image:
1.  **New Angle (Yaw/Pitch):** The subject must be convincingly re-rendered from this new perspective:
    -   **Horizontal (Yaw):** ${angleXDescription}
    -   **Vertical (Pitch/Tilt):** ${angleYDescription}
2.  **Output Format:** The final image must be ${width}x${height} pixels.
  `.trim();

  // Phase 3: Define Secondary Modifications (Meso/Micro-level details)
  const isHumanoid = config.subjectType !== 'Object';
  const modificationPoints: string[] = [];

  if (isHumanoid) {
    modificationPoints.push(`- **Facial Expression:** Change the subject's expression to: **${config.expression}**.`);
    if (config.lockGaze) {
      modificationPoints.push(`- **Gaze Direction:** Lock the subject's gaze directly on the viewer/camera. See the 'Critical Nuances' section below for a rule on how to execute this.`);
    }
  }

  const hairInstruction = config.randomHair
    ? `Randomly select a probabilistically likely hair style and color for a ${config.subjectType} subject.`
    : config.hair || 'Maintain original style and color.';

  let backgroundInstruction: string;
  if (config.randomBackground) {
    const { r, g, b } = getRandomColor();
    backgroundInstruction = `Solid color background with RGB value (${r}, ${g}, ${b}).`;
  } else {
    backgroundInstruction = config.background || 'Neutral studio gray background.';
  }

  const clothingInstruction = config.randomClothing
    ? `Randomly select a probabilistically likely clothing style for a ${config.subjectType} subject.`
    : config.clothing || 'Maintain original clothing style.';

  if (isHumanoid) {
    modificationPoints.push(`- **Hair:** ${hairInstruction}`);
    modificationPoints.push(`- **Clothing:** ${clothingInstruction}`);
  }
  modificationPoints.push(`- **Background:** ${backgroundInstruction}`);
  
  const secondaryModifications = `
### SECONDARY MODIFICATIONS
Apply these modifications to the re-rendered subject:
${modificationPoints.join('\n')}
  `.trim();

  // Phase 4: Define Critical Nuances and Constraints
  const criticalNuances: string[] = [];
  if (isHumanoid && config.lockGaze) {
      criticalNuances.push(`- **GAZE NUANCE:** When executing the 'Gaze Direction' modification, you MUST adhere to this rule: This instruction applies ONLY to the rotation of the eyes within their sockets. You MUST preserve the original shape, size, color, spacing, and any asymmetries (like strabismus or a lazy eye) of the eyes from the reference image. Do not 'correct' or beautify the eyes; simply rotate them to look at the viewer while maintaining their unique, original characteristics.`);
  }

  const nuancesSection = criticalNuances.length > 0 
    ? `
### CRITICAL NUANCES & CONSTRAINTS
These rules override any other interpretation and must be followed precisely:
${criticalNuances.join('\n')}
    `.trim()
    : '';

  // Assemble the final prompt with a clear hierarchical structure
  return `
${intro} Your task is to generate a new image of the subject in the provided reference photo.

### CORE OBJECTIVE
**This is the most important rule:** ${preservationRule}. The new image must look like the exact same ${config.subjectType.toLowerCase()}, just viewed differently. All modifications listed below are secondary to this core objective.

---

${primaryTransformations}

---

${secondaryModifications}

${nuancesSection ? '---\n\n' + nuancesSection : ''}

---

**Final Output:** Generate only the high-quality, final image. Do not add any text or watermarks.
  `.trim();
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
