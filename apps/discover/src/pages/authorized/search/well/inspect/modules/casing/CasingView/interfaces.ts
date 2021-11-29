import { UserPrefferedUnit } from 'constants/units';
import { NPTEvent } from 'modules/wellSearch/types';

export interface CasingType {
  id: number;
  name: string;
  outerDiameter: string;
  startDepth: number;
  endDepth: number;
  depthUnit: string;
}

export type CasingViewType = {
  casings: CasingType[];
  wellboreName: string;
  wellName: string;
  unit: UserPrefferedUnit;
  events: NPTEvent[];
  isEventsLoading?: boolean;
};
