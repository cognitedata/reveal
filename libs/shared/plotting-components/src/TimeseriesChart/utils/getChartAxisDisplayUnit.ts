import head from 'lodash/head';
import uniq from 'lodash/uniq';

import { TimeseriesChartMetadata } from '../domain/internal/types';

export const getChartAxisDisplayUnit = (
  metadata: TimeseriesChartMetadata[]
): string | undefined => {
  const units = uniq(metadata.map(({ unit }) => unit));

  if (units.length === 1) {
    return head(units);
  }

  return undefined;
};
