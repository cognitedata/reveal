import { Distance } from 'convert-units';

import {
  DistanceUnitEnum,
  HoleSection,
  HoleSectionGroup,
} from '@cognite/sdk-wells';

export interface HoleSectionGroupInternal
  extends Omit<HoleSectionGroup, 'measuredDepthUnit' | 'sizeUnit'> {
  measuredDepthUnit: Distance;
  sizeUnit: Distance;
  sections: Array<HoleSectionInternal>;
}

export interface HoleSectionInternal extends HoleSection {
  holeSizeFormatted?: string;
  color: string;
}

export interface HoleSectionGroupWithTvd extends HoleSectionGroup {
  trueVerticalDepthUnit: DistanceUnitEnum;
  sections: Array<HoleSectionWithTvd>;
}

export interface HoleSectionWithTvd extends HoleSection {
  topTrueVerticalDepth?: number;
  baseTrueVerticalDepth?: number;
}

export interface HoleSectionGroupInternalWithTvd
  extends HoleSectionGroupInternal {
  trueVerticalDepthUnit: Distance;
  sections: Array<HoleSectionInternal>;
}

export interface HoleSectionInternalWithTvd extends HoleSectionInternal {
  topTrueVerticalDepth?: number;
  baseTrueVerticalDepth?: number;
}
