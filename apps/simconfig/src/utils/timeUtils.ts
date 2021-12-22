export type DurationType = 'd' | 'h' | 'm' | 'w';

export const DurationKeyMap: Record<DurationType, string> = {
  m: 'minutes',
  h: 'hours',
  d: 'days',
  w: 'weeks',
} as const;

export const DurationFormatMap: Record<DurationType, string> = {
  m: '',
  h: 'p',
  d: 'Pp',
  w: 'EEE, P',
};

export const isValidDuration = (duration: string): duration is DurationType =>
  duration in DurationKeyMap;
