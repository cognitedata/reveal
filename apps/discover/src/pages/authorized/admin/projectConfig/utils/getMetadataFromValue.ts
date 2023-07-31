import reduce from 'lodash/reduce';

import { Metadata } from '../../../../../domain/projectConfig/types';
import { MetadataValue } from '../types';

import { getLabelFromIdentifier } from './getLabelFromIdentifier';

export const getMetadataFromValue = (
  value: unknown,
  currentMetadata: MetadataValue
): Metadata => {
  return reduce<unknown, Metadata>(
    value as [],
    (acc, datum, index) => {
      const accumulator = { ...acc };
      accumulator[index] = {
        label: getLabelFromIdentifier(
          datum,
          currentMetadata?.dataLabelIdentifier,
          `${currentMetadata.label} ${index + 1}`
        ),
        children: currentMetadata.children,
      };
      return accumulator;
    },
    {}
  );
};
