import { WELL_PROPERTY_FILTER_IDS } from 'domain/wells/summaries/internal/constants';
import { useWellPropertiesFiltersQuery } from 'domain/wells/summaries/internal/queries/useWellPropertiesFiltersQuery';
import { WellPropertyFilterIDs } from 'domain/wells/summaries/internal/types';

import * as React from 'react';
import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { Skeleton } from '@cognite/cogs.js';

import { MULTISELECT_NO_RESULTS } from 'components/Filters/MultiSelect/constants';
import { EMPTY_ARRAY } from 'constants/empty';
import { FilterIDs } from 'modules/wellSearch/constants';
import {
  BLOCK,
  REGION,
  FIELD,
} from 'modules/wellSearch/constantsSidebarFilters';
import { useRevalidateWellPropertyFilters } from 'modules/wellSearch/hooks/useRevalidateWellPropertyFilters';
import { FilterConfig, FilterTypes } from 'modules/wellSearch/types';

import { CommonFilter } from '../CommonFilter';

import { CustomFilterBaseProps } from './types';
import { restFilters } from './utils';

const FILTER_ID_NAME_MAP: Record<WellPropertyFilterIDs, string> = {
  [FilterIDs.REGION]: REGION,
  [FilterIDs.FIELD]: FIELD,
  [FilterIDs.BLOCK]: BLOCK,
};

interface RegionFieldBlockProps extends CustomFilterBaseProps {
  regionFieldBlockConfig: FilterConfig[];
}

export const RegionFieldBlock: React.FC<RegionFieldBlockProps> = ({
  onValueChange,
  selectedOptions,
  regionFieldBlockConfig,
}) => {
  const { data: filterGroups, isLoading } = useWellPropertiesFiltersQuery();

  const filterConfigs = useMemo(() => {
    return WELL_PROPERTY_FILTER_IDS.reduce((config, id) => {
      return {
        ...config,
        [id]: regionFieldBlockConfig.find(
          ({ name }) => name === FILTER_ID_NAME_MAP[id]
        ),
      };
    }, {} as Record<WellPropertyFilterIDs, FilterConfig | undefined>);
  }, [regionFieldBlockConfig]);

  const updateFilterValue = (
    id: WellPropertyFilterIDs,
    selectedValues: string[]
  ) => {
    onValueChange(id, id, selectedValues, FILTER_ID_NAME_MAP[id]);
  };

  useRevalidateWellPropertyFilters(selectedOptions, updateFilterValue);

  if (isLoading) {
    return (
      <Skeleton.List lines={compact(Object.values(filterConfigs)).length} />
    );
  }

  if (!filterGroups) {
    return null;
  }

  return (
    <>
      {WELL_PROPERTY_FILTER_IDS.map((id) => {
        const filterConfig = filterConfigs[id];

        if (!filterConfig) {
          return null;
        }

        const label = pluralize(FILTER_ID_NAME_MAP[id].toLowerCase());

        const allOptions = Object.keys(filterGroups[id]);
        const selectedValues = (selectedOptions[id] || []) as string[];
        const isAnyOtherFilterApplied = WELL_PROPERTY_FILTER_IDS.some(
          (filterID) => id !== filterID && !isEmpty(selectedOptions[filterID])
        );

        return (
          <CommonFilter
            key={`filter-${id}`}
            filterConfig={{
              ...filterConfig,
              type: FilterTypes.MULTISELECT_GROUP,
            }}
            onValueChange={updateFilterValue}
            options={EMPTY_ARRAY}
            groupedOptions={[
              {
                label: `Related ${label} to your previous selections`,
                options:
                  isEmpty(selectedValues) && isAnyOtherFilterApplied
                    ? [MULTISELECT_NO_RESULTS]
                    : selectedValues,
              },
              {
                label: isEmpty(selectedValues)
                  ? `All ${label}`
                  : `Remaining ${label}`,
                options: restFilters(allOptions, selectedValues),
              },
            ]}
            selectedOptions={selectedValues}
          />
        );
      })}
    </>
  );
};
