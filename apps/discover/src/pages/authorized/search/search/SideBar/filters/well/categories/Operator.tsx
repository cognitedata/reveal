import * as React from 'react';

import { FilterIDs } from 'modules/wellSearch/constants';
import { OPERATOR } from 'modules/wellSearch/constantsSidebarFilters';
import { useWellFilterOptions } from 'modules/wellSearch/hooks/useWellFilterOptionsQuery';
import {
  FilterConfig,
  FilterTypes,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { CommonFilter } from '../CommonFilter';

import { CustomFilterBaseProps } from './types';

interface Props extends CustomFilterBaseProps {
  allConfig: FilterConfig[];
}
export const Operator: React.FC<Props> = ({
  onValueChange,
  selectedOptions,
  allConfig,
}) => {
  const { data: filterOptions } = useWellFilterOptions();

  const operatorConfig = allConfig.find(
    (category) => category.name === OPERATOR
  );

  // eg: this is disabled in project config
  if (!operatorConfig) {
    return null;
  }

  if (!filterOptions) {
    return null;
  }

  return (
    <CommonFilter
      key={`filter-${FilterIDs.OPERATOR}`}
      filterConfig={{
        id: FilterIDs.OPERATOR,
        name: OPERATOR,
        type: FilterTypes.MULTISELECT,
      }}
      onValueChange={(id: number, selectedVals: WellFilterOptionValue[]) =>
        onValueChange(FilterIDs.OPERATOR, id, selectedVals, OPERATOR)
      }
      options={filterOptions[FilterIDs.OPERATOR]}
      selectedOptions={selectedOptions[FilterIDs.OPERATOR]}
      displayFilterTitle
    />
  );
};
