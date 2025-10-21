export type IconName = string | undefined;

export type IconColor = string | undefined;

export type ButtonType = 'ghost' | 'ghost-destructive' | 'primary';

export type UniqueId = string;

export enum CheckboxState {
  All,
  Some,
  None
}

export function generateUniqueId(): UniqueId {
  return crypto.randomUUID();
}
