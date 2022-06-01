import { Sequence, WellboreId } from 'modules/wellSearch/types';

import { CasingType } from './CasingView/interfaces';

export type FormattedCasings = {
  key: WellboreId; // wellbore id
  wellboreName: string;
  wellName: string;
  waterDepth: number;
  rkbLevel: number;
  casings: CasingType[];
};

export type CasingData = {
  id: WellboreId; // wellbore id
  wellboreName: string;
  wellName: string;
  topMD: number;
  bottomMD: number;
  topTVD?: number;
  bottomTVD?: number;
  odMin: number;
  odMax: number;
  idMin: number;
  mdUnit: string;
  tvdUnit?: string;
  odUnit: string;
  idUnit: string;
  waterDepth?: number;
  waterDepthUnit?: string;
  rkbLevel?: number;
  rkbLevelUnit?: string;
  casingNames: string;
  casings: Sequence[];
};

export type GroupedCasingData = {
  id: number;
  wellName: string;
  casings: CasingData[];
};
