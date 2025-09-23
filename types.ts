
export type AngleX = 'Profile Left' | 'Three-Quarter Left' | 'Slight Left' | 'Front View' | 'Slight Right' | 'Three-Quarter Right' | 'Profile Right';

export type AngleY = 'Tilted Up High' | 'Tilted Up' | 'Level View' | 'Tilted Down' | 'Tilted Down Low';

export type Expression = 'Neutral' | 'Smiling' | 'Laughing' | 'Sad' | 'Angry' | 'Surprised' | 'Thoughtful';

export type SubjectType = 'Male' | 'Female' | 'Non-binary' | 'Cartoon / 3D CGI Character' | 'Humanoid Creature' | 'Object';

export type OutputResolution = '512x512' | '768x768' | '1024x1024';

export interface GenerationConfig {
  angleX: AngleX;
  angleY: AngleY;
  expression: Expression;
  subjectType: SubjectType;
  outputResolution: OutputResolution;
  lockGaze: boolean;
  hair: string;
  randomHair: boolean;
  background: string;
  randomBackground: boolean;
  clothing: string;
  randomClothing: boolean;
}

export interface GeneratedImage {
  id: string;
  src: string;
  config: GenerationConfig;
}

export interface OptimizedImage {
  id: string;
  src: string;
}

export interface ReferenceImageInfo {
  src: string;
  width: number;
  height: number;
}

export type LogType = 'info' | 'error' | 'success';

export interface LogEntry {
  timestamp: string;
  type: LogType;
  message: string;
}
