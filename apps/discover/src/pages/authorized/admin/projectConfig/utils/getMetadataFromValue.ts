import get from 'lodash/get';
import reduce from 'lodash/reduce';

import { ProjectConfig } from '@cognite/discover-api-types';

import { Metadata, MetadataValue } from '../types';

export const getMetadataFromValue = (
  value: ProjectConfig[keyof ProjectConfig],
  currentMetadata: MetadataValue
): Metadata => {
  return reduce<ProjectConfig[keyof ProjectConfig], Metadata>(
    value as [],
    (acc, datum, index) => {
      const accumulator = { ...acc };
      accumulator[index] = {
        label:
          get(datum, currentMetadata?.dataLabelIdentifier || '') ??
          `${currentMetadata.label} ${index + 1}`,
        children: currentMetadata.children,
      };
      return accumulator;
    },
    {}
  );
};
