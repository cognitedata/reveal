import get from 'lodash/get';
import keyBy from 'lodash/keyBy';

import { WellEventLegend } from '@cognite/discover-api-types';

import { CodeDefinition } from './types';

export const mapLegendValuesToCodes = (
  codes: string[],
  legend: WellEventLegend[]
): CodeDefinition[] => {
  const legendKey = keyBy(legend, 'id');
  return codes.map((code) => {
    return {
      code,
      definition: get(legendKey[code], 'legend', ''),
    };
  });
};
