import { UserPreferredUnit } from 'constants/units';
import { NDSEvent, NPTEvent } from 'modules/wellSearch/types';

import { SideModes } from './types';

export interface CasingType {
  id: number;
  name: string;
  outerDiameter: string;
  startDepth: number;
  endDepth: number;
  startDepthTVD: number;
  endDepthTVD: number;
  depthUnit: string;
}

export type CasingViewTypeProps = {
  casings: CasingType[];
  wellboreName: string;
  wellName: string;
  unit: UserPreferredUnit;
  nptEvents: NPTEvent[];
  ndsEvents: NDSEvent[];
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
  sideMode: SideModes;
};
