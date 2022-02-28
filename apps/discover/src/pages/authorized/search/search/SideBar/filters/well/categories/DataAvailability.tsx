import React from 'react';

import { DataAvailabilityOptions } from 'services/well/well/filters/getDataAvailabilityFilter';

import { FilterIDs } from 'modules/wellSearch/constants';
import { DATA_AVAILABILITY } from 'modules/wellSearch/constantsSidebarFilters';
import { FilterTypes, WellFilterOptionValue } from 'modules/wellSearch/types';

import { CommonFilter } from '../CommonFilter';

import { CustomFilterBaseProps } from './types';

type Props = CustomFilterBaseProps;
export const DataAvailability: React.FC<Props> = ({
  onValueChange,
  selectedOptions,
}) => {
  const options: WellFilterOptionValue[] = [
    DataAvailabilityOptions.Trajectories,
    DataAvailabilityOptions.NDS,
    DataAvailabilityOptions.NPT,
    // DataAvailabilityOptions.Casings,
  ];

  return (
    <CommonFilter
      key={`filter-${FilterIDs.DATA_AVAILABILITY}`}
      filterConfig={{
        id: FilterIDs.DATA_AVAILABILITY,
        name: DATA_AVAILABILITY,
        type: FilterTypes.MULTISELECT,
      }}
      onValueChange={(id: number, selectedVals: WellFilterOptionValue[]) => {
        onValueChange(id, id, selectedVals, DATA_AVAILABILITY);
      }}
      options={options}
      selectedOptions={selectedOptions[FilterIDs.DATA_AVAILABILITY]}
      displayFilterTitle
    />
  );
};
