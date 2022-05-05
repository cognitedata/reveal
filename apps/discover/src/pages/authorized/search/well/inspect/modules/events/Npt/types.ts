import { VIEW_MODES } from './constants';

export type ViewModes = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export interface NptCodeDefinitionType {
  [key: string]: string;
}

export interface NptCodeDetailsDefinitionType {
  [key: string]: string;
}
