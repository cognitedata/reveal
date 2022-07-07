import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';

import React from 'react';

import { OptionType, Select } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';

import { DropdownWrapper } from './elements';
import { mapCurvesToOptions, extractSelectedCurvesFromOptions } from './utils';

export interface Props {
  title: string;
  selected: DepthMeasurementDataColumnInternal[];
  options: OptionType<DepthMeasurementDataColumnInternal>[];
  onChange: (curves: DepthMeasurementDataColumnInternal[]) => void;
  grouped?: boolean;
}

const renderEmpty = () => (
  <EmptyState emptySubtitle="Sorry, but we couldn’t find anything based on your search" />
);

export const CommonCurveFilter: React.FC<Props> = ({
  title,
  selected,
  options,
  grouped = false,
  onChange,
}) => {
  const selectedOptions = mapCurvesToOptions(selected);

  const total = grouped ? (options[0] || {}).options?.length : options.length;

  return (
    <DropdownWrapper>
      <Select<DepthMeasurementDataColumnInternal>
        isMulti
        title={title}
        selectAllLabel="All"
        placeholder="Search"
        value={selectedOptions}
        onChange={(
          options: OptionType<DepthMeasurementDataColumnInternal>[]
        ) => {
          onChange(
            extractSelectedCurvesFromOptions(options, selectedOptions)
              .map((option) => option.value)
              .filter(
                (value) => !!value
              ) as DepthMeasurementDataColumnInternal[]
          );
        }}
        options={options}
        enableSelectAll
        showCheckbox
        placeholderSelectElement={`${selected.length} / ${total}`}
        noOptionsMessage={renderEmpty}
      />
    </DropdownWrapper>
  );
};
