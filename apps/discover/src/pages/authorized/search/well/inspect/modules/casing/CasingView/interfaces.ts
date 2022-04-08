import { UserPreferredUnit } from 'constants/units';
import { NPTEvent } from 'modules/wellSearch/types';

import { SideModes } from './types';

export interface CasingType {
  id: number;
  name: string;
  outerDiameter: string;
  startDepth: number;
  endDepth: number;
  depthUnit: string;
}

export type CasingViewTypeProps = {
  casings: CasingType[];
  wellboreName: string;
  wellName: string;
  unit: UserPreferredUnit;
  events: NPTEvent[];
  isEventsLoading?: boolean;
  sideMode: SideModes;
};
