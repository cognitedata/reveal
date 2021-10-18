import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

import { Sequence } from '@cognite/sdk';

export const getUniqCurves = (squences: Sequence[]): string[] => {
  return uniq(
    flatten(
      squences.map((sequence) =>
        sequence.columns.map((column) => column.name as string)
      )
    )
  ).sort();
};
