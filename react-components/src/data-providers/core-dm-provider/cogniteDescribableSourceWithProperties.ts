import { SourceSelectorV3 } from '@cognite/sdk/dist/src';
import { COGNITE_DESCRIBABLE_SOURCE } from './dataModels';

export const cogniteDescribableSourceWithProperties = [
  {
    source: COGNITE_DESCRIBABLE_SOURCE,
    properties: ['name', 'description', 'tags', 'aliases']
  }
] as const satisfies SourceSelectorV3;
