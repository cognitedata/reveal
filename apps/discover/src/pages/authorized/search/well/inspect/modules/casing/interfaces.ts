import { Sequence } from '@cognite/sdk';

import { CasingType } from './CasingView/interfaces';

export type FormattedCasings = {
  key: number;
  name: string;
  casings: CasingType[];
};

export type CasingData = {
  id: number; // wellbore id
  wellboreName: string;
  wellName: string;
  topMD: number;
  bottomMD: number;
  odMin: number;
  odMax: number;
  idMin: number;
  mdUnit: string;
  odUnit: string;
  idUnit: string;
  casingNames: string;
  casings: Sequence[];
};
