import { DoglegSeverity } from '@cognite/sdk-wells-v3';

import { DoglegSeverityInternal } from '../types';
import { toDoglegSeverityUnitInternal } from '../utils/toDoglegSeverityUnitInternal';

export const normalizeDoglegSeverity = (
  doglegSeverity: DoglegSeverity
): DoglegSeverityInternal => {
  const { unit } = doglegSeverity;

  return {
    ...doglegSeverity,
    unit: toDoglegSeverityUnitInternal(unit),
  };
};
