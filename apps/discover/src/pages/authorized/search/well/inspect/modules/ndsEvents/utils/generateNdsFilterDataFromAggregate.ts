import { NdsAggregate } from '@cognite/sdk-wells-v3';

import { FilterData } from '../types';

const ORPHAN_SUBTYPES = 'ORPHAN_SUBTYPES';

export const generateNdsFilterDataFromAggregate = (
  ndsAggregates: NdsAggregate[]
): FilterData[] => {
  const riskTypesMap = ndsAggregates
    .flatMap((aggregate) => aggregate.items)
    .reduce((previousValue, currentValue) => {
      if (currentValue.riskType) {
        return {
          ...previousValue,
          [currentValue.riskType]: currentValue.subtype
            ? [
                ...(previousValue[currentValue.riskType] || []),
                currentValue.subtype,
              ]
            : previousValue[currentValue.riskType],
        };
      }
      if (currentValue.subtype) {
        return {
          ...previousValue,
          [ORPHAN_SUBTYPES]: [
            ...(previousValue[ORPHAN_SUBTYPES] || []),
            currentValue.subtype,
          ],
        };
      }
      return previousValue;
    }, {} as { [key: string]: string[] });

  return Object.keys(riskTypesMap).map((riskType) => {
    return {
      label: riskType,
      value: riskType,
      options: Array.from(new Set(riskTypesMap[riskType] || [])).map(
        (subtype) => {
          return {
            label: subtype,
            value: subtype,
          };
        }
      ),
    };
  });
};
