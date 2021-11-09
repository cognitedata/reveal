import { OptionType } from '@cognite/cogs.js';
import {
  ModelFileCreateSchema,
  BoundaryConditionKey,
} from '@cognite/simconfig-api-sdk';

export interface ModelFormState
  extends Omit<ModelFileCreateSchema, 'boundaryConditions' | 'file'> {
  file?: File;
  boundaryConditions: (OptionType<BoundaryConditionKey> & {
    value: BoundaryConditionKey;
  })[];
}
