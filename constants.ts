import type { Angle, Expression, SubjectType, OutputResolution } from './types';

export const ANGLES: Angle[] = [
  'Front View',
  'Three-Quarter Left',
  'Profile Left',
  'Three-Quarter Right',
  'Profile Right',
  'Slightly Above',
  'Slightly Below',
];

export const EXPRESSIONS: Expression[] = [
  'Neutral',
  'Smiling',
  'Laughing',
  'Sad',
  'Angry',
  'Surprised',
  'Thoughtful',
];

export const SUBJECT_TYPES: SubjectType[] = [
  'Male',
  'Female',
  'Non-binary',
  'Cartoon / 3D CGI Character',
  'Humanoid Creature',
  'Object',
];

export const OUTPUT_RESOLUTIONS: OutputResolution[] = [
  '512x512',
  '768x768',
  '1024x1024',
];