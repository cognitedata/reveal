import keyBy from 'lodash/keyBy';

import { SequenceSource, Wellbore } from '@cognite/sdk-wells-v3';

export const keyBySequence = <T extends { source: SequenceSource }>(
  items: T[]
): Record<Wellbore['matchingId'], T> =>
  keyBy(items, 'source.sequenceExternalId');
