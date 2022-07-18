import React from 'react';

import isArray from 'lodash/isArray';
import map from 'lodash/map';

import { WellFilterOptionValue } from 'modules/wellSearch/types';

import { DateRangeFilter } from './DateRangeFilter';

export type Props = {
  onValueChange: (filterId: number, value: any) => void;
  selectedOptions: string | WellFilterOptionValue[];
  options: any[];
  filterId: number;
  filterName: string;
};

export const DateRangeElement: React.FC<Props> = React.memo(
  ({
    onValueChange,
    selectedOptions,
    options,
    filterName,
    filterId,
  }: Props) => {
    return (
      <DateRangeFilter
        title={filterName}
        minMaxRange={map(options, 'value')}
        range={
          isArray(selectedOptions)
            ? selectedOptions.map((option) => new Date(option))
            : [new Date(selectedOptions)]
        }
        onChange={(range) => {
          onValueChange(filterId, range);
        }}
      />
    );
  }
);
