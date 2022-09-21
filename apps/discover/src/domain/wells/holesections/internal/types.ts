import { Distance } from 'convert-units';

import { HoleSection, HoleSectionGroup } from '@cognite/sdk-wells';

export interface HoleSectionGroupInternal
  extends Omit<HoleSectionGroup, 'measuredDepthUnit' | 'sizeUnit'> {
  measuredDepthUnit: Distance;
  sizeUnit: Distance;
  sections: Array<HoleSectionInternal>;
}

export type HoleSectionInternal = HoleSection;
