import { NptInternal } from 'domain/wells/npt/internal/types';

export interface NptView extends NptInternal {
  wellName: string;
  wellboreName: string;
}

export interface NptCodeDefinitionType {
  [key: string]: string;
}

export interface NptCodeDetailsDefinitionType {
  [key: string]: string;
}
