export type IconName = string | undefined;

export type ButtonType = 'ghost' | 'ghost-destructive' | 'primary';

export type UniqueId = string;

export function generateUniqueId(): UniqueId {
  return crypto.randomUUID();
}
