import { Distance } from 'convert-units';

import { HoleSection, HoleSectionGroup } from '@cognite/sdk-wells';

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

export interface HoleSectionGroupInternalWithTvd
  extends HoleSectionGroupInternal {
  sections: Array<HoleSectionInternal>;
}

export interface HoleSectionInternalWithTvd extends HoleSectionInternal {
  topTrueVerticalDepth?: number;
  baseTrueVerticalDepth?: number;
}
