import * as React from 'react';

import map from 'lodash/map';

import { NumericRangeFilter } from 'components/Filters';
import { WellFilterOptionValue } from 'modules/wellSearch/types';

export type Props = {
  onValueChange: (filterId: number, value: any) => void;
  selectedOptions: string | WellFilterOptionValue[];
  options: any[];
  filterId: number;
  filterName: string;
  displayFilterTitle: boolean;
};

export const NumericRangeFilterElement: React.FC<Props> = React.memo(
  ({
    onValueChange,
    selectedOptions,
    options,
    filterName,
    filterId,
    displayFilterTitle,
  }: Props) => {
    return (
      <NumericRangeFilter
        min={map(options, 'value')[0]}
        max={map(options, 'value')[1]}
        selectedValues={selectedOptions as number[]}
        onValueChange={(vals: any) => onValueChange(filterId, vals)}
        config={{
          title: (displayFilterTitle && filterName) || '',
          editableTextFields: true,
        }}
      />
    );
  }
);
