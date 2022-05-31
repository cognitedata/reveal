import type { OptionType } from '@cognite/cogs.js';
import type * as SimconfigApi from '@cognite/simconfig-api-sdk/rtk';

export interface ModelFormState
  extends Omit<SimconfigApi.CreateModelFile, 'boundaryConditions' | 'file'> {
  file?: File;
  boundaryConditions: (OptionType<SimconfigApi.BoundaryCondition> & {
    value: SimconfigApi.BoundaryCondition;
  })[];
  labels: ({ label: string; value: string } & { labelName: string })[];
}
