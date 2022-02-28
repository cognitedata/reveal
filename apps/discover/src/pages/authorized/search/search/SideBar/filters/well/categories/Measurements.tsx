import React from 'react';

import { FilterIDs } from 'modules/wellSearch/constants';
import { MEASUREMENTS } from 'modules/wellSearch/constantsSidebarFilters';
import { FilterTypes, WellFilterOptionValue } from 'modules/wellSearch/types';

import { CommonFilter } from '../CommonFilter';

import { CustomFilterBaseProps } from './types';

interface Props extends CustomFilterBaseProps {
  options: WellFilterOptionValue[];
}
export const Measurements: React.FC<Props> = ({
  options,
  onValueChange,
  selectedOptions,
}) => {
  return (
    <CommonFilter
      key={`filter-${FilterIDs.MEASUREMENTS}`}
      filterConfig={{
        id: FilterIDs.MEASUREMENTS,
        name: MEASUREMENTS,
        type: FilterTypes.MULTISELECT,
      }}
      onValueChange={(id: number, selectedVals: WellFilterOptionValue[]) => {
        onValueChange(id, id, selectedVals, MEASUREMENTS);
      }}
      options={options}
      selectedOptions={selectedOptions[FilterIDs.MEASUREMENTS]}
      displayFilterTitle
    />
  );
};
