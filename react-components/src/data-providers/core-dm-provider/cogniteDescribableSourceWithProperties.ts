import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_DESCRIBABLE_SOURCE } from './dataModels';

type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export const cogniteDescribableSourceWithProperties = [
  {
    source:
      COGNITE_DESCRIBABLE_SOURCE satisfies typeof COGNITE_DESCRIBABLE_SOURCE as typeof COGNITE_DESCRIBABLE_SOURCE,
    properties: ['name', 'description', 'tags', 'aliases']
  }
] as const;
cogniteDescribableSourceWithProperties satisfies DeepReadonly<SourceSelectorV3>;
