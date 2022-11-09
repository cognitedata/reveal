import { WELL_PROPERTY_FILTER_IDS } from 'domain/wells/summaries/internal/constants';
import { useWellPropertiesFiltersQuery } from 'domain/wells/summaries/internal/queries/useWellPropertiesFiltersQuery';
import { WellPropertyFilterGroup } from 'domain/wells/summaries/internal/types';

import { useState } from 'react';

import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { FilterIDs } from '../constants';
import { WellFilterMap } from '../types';
import {
  processHierarchy,
  getResultFromFilterMap,
  getResultDifference,
} from '../utils/wellPropertyFilters';

const EMPTY_RESULT: WellPropertyFilterGroup = Object.freeze({
  [FilterIDs.REGION]: EMPTY_ARRAY,
  [FilterIDs.FIELD]: EMPTY_ARRAY,
  [FilterIDs.BLOCK]: EMPTY_ARRAY,
});

const HIERARCHY = processHierarchy([
  FilterIDs.REGION,
  FilterIDs.FIELD,
  FilterIDs.BLOCK,
]);

export const useWellPropertyFiltersResult = (
  selectedOptions: WellFilterMap
): WellPropertyFilterGroup => {
  const { data: filterGroups } = useWellPropertiesFiltersQuery();

  const [currentResult, setCurrentResult] = useState(EMPTY_RESULT);

  const result = useDeepMemo(() => {
    if (!filterGroups) {
      return EMPTY_RESULT;
    }

    const updatedResult = getResultFromFilterMap(selectedOptions);

    if (isEqual(currentResult, updatedResult)) {
      return currentResult;
    }

    const addedOptions = getResultDifference(updatedResult, currentResult);
    const removedOptions = getResultDifference(currentResult, updatedResult);

    WELL_PROPERTY_FILTER_IDS.forEach((id) => {
      const { parents, children } = HIERARCHY[id];

      addedOptions[id].forEach((addedValue) => {
        parents.forEach((parentID) => {
          updatedResult[parentID] = uniq([
            ...updatedResult[parentID],
            ...filterGroups[id][addedValue][parentID],
          ]);
        });
      });

      removedOptions[id].forEach(() => {
        children.forEach((childID) => {
          updatedResult[childID] = updatedResult[childID].filter((value) => {
            const parentValues = filterGroups[childID][value][id];
            return parentValues.some((parentValue) =>
              updatedResult[id].includes(parentValue)
            );
          });
        });
      });
    });

    return updatedResult;
  }, [filterGroups, selectedOptions]);

  useDeepEffect(() => {
    setCurrentResult(result);
  }, [result]);

  return result;
};
