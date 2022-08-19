import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WellGroupsResponse } from '@cognite/discover-api-types';

import { FilterIDs } from 'modules/wellSearch/constants';
import { WellFilterMap } from 'modules/wellSearch/types';

import {
  RegionFieldBlock,
  RegionFieldBlockHierarchy,
  RegionFieldBlockResult,
} from '../types';
import { childAccessor, parentAccessor } from '../utils/filters';

export const hierarchy: RegionFieldBlockHierarchy = {
  [FilterIDs.REGION]: {
    parents: [],
    children: [FilterIDs.FIELD, FilterIDs.BLOCK],
    revalidate: [
      { reference: FilterIDs.FIELD, filterId: FilterIDs.BLOCK },
      { reference: FilterIDs.BLOCK, filterId: FilterIDs.FIELD },
    ],
  },
  [FilterIDs.FIELD]: {
    parents: [FilterIDs.REGION],
    children: [FilterIDs.BLOCK],
    revalidate: [
      { reference: FilterIDs.REGION, filterId: FilterIDs.BLOCK },
      { reference: FilterIDs.BLOCK, filterId: FilterIDs.REGION },
    ],
  },
  [FilterIDs.BLOCK]: {
    parents: [FilterIDs.REGION, FilterIDs.FIELD],
    children: [],
    revalidate: [
      { reference: FilterIDs.REGION, filterId: FilterIDs.FIELD },
      { reference: FilterIDs.FIELD, filterId: FilterIDs.REGION },
    ],
  },
};

export const useRegionsFieldsBlocksRelationship = (
  wellGroups: WellGroupsResponse | undefined,
  selectedOptions: WellFilterMap
) => {
  const getRelationships = React.useCallback(
    (filterId: RegionFieldBlock): RegionFieldBlockResult => {
      const selectedValues = selectedOptions[filterId];

      let results = {} as RegionFieldBlockResult;

      if (wellGroups === undefined || selectedValues === undefined) {
        return results;
      }

      const { parents, children } = hierarchy[filterId];

      const selectedParents = Object.keys(selectedOptions).filter(
        (key: string) => !isEmpty(selectedOptions[Number(key)])
      );

      parents.forEach((parent) => {
        const parentFilters = ((selectedValues as string[]) || []).map(
          (filter) => wellGroups[parentAccessor(filterId)][filter]
        ) as WellGroupsResponse[keyof WellGroupsResponse][];

        const result =
          isEmpty(parentFilters) && selectedParents.includes(String(parent))
            ? selectedOptions[parent]
            : [
                ...new Set(
                  parentFilters
                    .filter(Boolean)
                    .map((filter) => filter[childAccessor(parent)])
                ),
              ];

        results = { ...results, [parent]: result };
      });

      children.forEach((child) => {
        const oneOfRegionsFieldsBlocks = wellGroups[parentAccessor(child)];
        const filterKeys = Object.keys(oneOfRegionsFieldsBlocks) || [];

        const childFilters = filterKeys.filter((filter) => {
          const regionsFieldsOrBlocks = oneOfRegionsFieldsBlocks[filter];

          // TS is not able infer the child accessor key
          const value = (regionsFieldsOrBlocks as any)[childAccessor(filterId)];

          return (selectedValues || []).includes(value);
        });

        const result = [...new Set(childFilters)];

        results = { ...results, [child]: result };
      });

      return results;
    },
    [wellGroups, selectedOptions]
  );

  return React.useCallback(
    (filterId: RegionFieldBlock) => {
      const results = getRelationships(filterId);

      const { revalidate } = hierarchy[filterId];

      return revalidate.reduce((accumulator, { reference, filterId }) => {
        const filter = results[reference] || [];

        if (isEmpty(filter)) {
          const revalidateRelationships = getRelationships(filterId);

          return {
            ...accumulator,
            [reference]: revalidateRelationships[reference] || [],
          };
        }

        return { ...accumulator, [reference]: filter };
      }, {} as RegionFieldBlockResult);
    },
    [getRelationships]
  );
};
