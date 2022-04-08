import { VIEW_MODES } from './constants';

export type ViewModes = typeof VIEW_MODES[keyof typeof VIEW_MODES];
