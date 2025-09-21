export type Angle = 'Front View' | 'Three-Quarter Left' | 'Profile Left' | 'Three-Quarter Right' | 'Profile Right' | 'Slightly Above' | 'Slightly Below';

export type Expression = 'Neutral' | 'Smiling' | 'Laughing' | 'Sad' | 'Angry' | 'Surprised' | 'Thoughtful';

export type SubjectType = 'Male' | 'Female' | 'Non-binary' | 'Cartoon / 3D CGI Character' | 'Humanoid Creature' | 'Object';

export type OutputResolution = '512x512' | '768x768' | '1024x1024';

export interface GenerationConfig {
  angle: Angle;
  expression: Expression;
  subjectType: SubjectType;
  outputResolution: OutputResolution;
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