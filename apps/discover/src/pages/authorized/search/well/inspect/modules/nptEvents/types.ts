import { NptInternal } from 'domain/wells/npt/internal/types';

import { VIEW_MODES } from './constants';

export interface NptView extends NptInternal {
  wellName: string;
  wellboreName: string;
}

export type ViewModes = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export interface NptCodeDefinitionType {
  [key: string]: string;
}

export interface NptCodeDetailsDefinitionType {
  [key: string]: string;
}
