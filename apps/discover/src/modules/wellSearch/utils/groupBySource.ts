import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';

import { SequenceSource } from '@cognite/sdk-wells-v3';

const SOURCE_EXTERNAL_ID_ACCESSOR = 'source.sequenceExternalId';

export const groupBySource = <T extends { source: SequenceSource }>(
  items: T[]
) => groupBy(items, SOURCE_EXTERNAL_ID_ACCESSOR);

export const keyBySource = <T extends { source: SequenceSource }>(items: T[]) =>
  keyBy(items, SOURCE_EXTERNAL_ID_ACCESSOR);
