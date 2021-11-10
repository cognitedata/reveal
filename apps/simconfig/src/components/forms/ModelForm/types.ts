import { OptionType } from '@cognite/cogs.js';
import {
  BoundaryConditionProperty,
  CreateModelRequestModel,
} from '@cognite/simconfig-api-sdk';

export interface ModelFormState
  extends Omit<CreateModelRequestModel, 'boundaryConditions' | 'file'> {
  file?: File;
  boundaryConditions: (OptionType<BoundaryConditionProperty> & {
    value: BoundaryConditionProperty;
  })[];
}
