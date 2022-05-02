import React from 'react';

import { OptionType, Select } from '@cognite/cogs.js';
import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import EmptyState from 'components/EmptyState';

import { DropdownWrapper } from './elements';
import { mapCurvesToOptions, extractSelectedCurvesFromOptions } from './utils';

export interface Props {
  title: string;
  selected: DepthMeasurementColumn[];
  options: OptionType<DepthMeasurementColumn>[];
  onChange: (curves: DepthMeasurementColumn[]) => void;
  grouped?: boolean;
}

export const CommonCurveFilter: React.FC<Props> = ({
  title,
  selected,
  options,
  grouped = false,
  onChange,
}) => {
  const selectedOptions = mapCurvesToOptions(selected);

  const total = grouped ? (options[0] || {}).options?.length : options.length;

  const renderEmpty = () => (
    <EmptyState emptySubtitle="Sorry, but we couldn’t find anything based on your search" />
  );

  return (
    <DropdownWrapper>
      <Select<DepthMeasurementColumn>
        isMulti
        theme="grey"
        title={title}
        SelectAllLabel="All"
        placeholder="Search"
        value={selectedOptions}
        onChange={(options: OptionType<DepthMeasurementColumn>[]) => {
          onChange(
            extractSelectedCurvesFromOptions(options, selectedOptions)
              .map((option) => option.value)
              .filter((value) => !!value) as DepthMeasurementColumn[]
          );
        }}
        options={options}
        enableSelectAll
        showCustomCheckbox
        placeholderSelectElement={`${selected.length} / ${total}`}
        noOptionsMessage={renderEmpty}
      />
    </DropdownWrapper>
  );
};
