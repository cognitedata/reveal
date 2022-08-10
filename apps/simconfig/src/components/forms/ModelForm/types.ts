import type { OptionType } from '@cognite/cogs.js';
// eslint-disable-next-line import/no-duplicates
import type * as SimconfigApi from '@cognite/simconfig-api-sdk/rtk';
// eslint-disable-next-line import/no-duplicates
import type { BoundaryConditionObject } from '@cognite/simconfig-api-sdk/rtk';

export interface ModelFormState
  extends Omit<SimconfigApi.CreateModelFile, 'boundaryConditions' | 'file'> {
  file?: File;
  boundaryConditions: (OptionType<SimconfigApi.BoundaryCondition> & {
    value: SimconfigApi.BoundaryCondition;
  })[];
  availableBoundaryConditions: BoundaryConditionObject[];
  labels: ({ label: string; value: string } & { labelName: string })[];
}
export interface BoundaryConditionResponse {
  items: BoundaryConditionObject[];
}
