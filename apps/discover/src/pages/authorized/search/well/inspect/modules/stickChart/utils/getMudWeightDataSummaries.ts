import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import max from 'lodash/max';
import min from 'lodash/min';

import { MudWeightData, MudWeightSummary } from '../types';

export const getMudWeightDataSummaries = (
  mudWeights: MudWeightData[]
): MudWeightSummary[] => {
  const groupedMudWeights = groupBy(mudWeights, 'type');

  return Object.keys(groupedMudWeights).map((type) => {
    const mudWeightsOfType = groupedMudWeights[type];

    return {
      id: map(mudWeightsOfType, 'id').join('-'),
      type,
      mudDensityRange: {
        min: min(map(mudWeightsOfType, 'minMudDensity')),
        max: max(map(mudWeightsOfType, 'maxMudDensity')),
        unit: mudWeightsOfType[0].densityUnit,
      },
    };
  });
};
