
import type { Expression, SubjectType, OutputResolution, AngleX, AngleY } from './types';

// Fix for error: Cannot find namespace 'React'. Changed icon type to string.
export const ANGLES_X: { value: AngleX; label: string; icon: string }[] = [
  { value: 'Profile Left', label: 'Profile L', icon: 'profile-left' },
  { value: 'Three-Quarter Left', label: '3/4 L', icon: 'tq-left' },
  { value: 'Front View', label: 'Front', icon: 'front' },
  { value: 'Three-Quarter Right', label: '3/4 R', icon: 'tq-right' },
  { value: 'Profile Right', label: 'Profile R', icon: 'profile-right' },
];

// Fix for error: Cannot find namespace 'React'. Changed icon type to string.
export const ANGLES_Y: { value: AngleY; label: string; icon: string }[] = [
    { value: 'Tilted Up High', label: 'Up High', icon: 'up-high' },
    { value: 'Tilted Up', label: 'Up', icon: 'up' },
    { value: 'Level View', label: 'Level', icon: 'level' },
    { value: 'Tilted Down', label: 'Down', icon: 'down' },
    { value: 'Tilted Down Low', label: 'Down Low', icon: 'down-low' },
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
