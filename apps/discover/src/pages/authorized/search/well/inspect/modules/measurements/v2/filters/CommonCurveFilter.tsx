import React from 'react';

import { OptionType, Select } from '@cognite/cogs.js';

import EmptyState from 'components/emptyState';

import { DropdownWrapper } from './elements';
import { mapCurvesToOptions, mapOptionsToCurves } from './utils';

interface Props {
  title: string;
  selected: string[];
  options: OptionType<string>[];
  onChange: (curves: string[]) => void;
}

export const CommonCurveFilter: React.FC<Props> = ({
  title,
  selected,
  options,
  onChange,
}) => {
  const selectedOptions = mapCurvesToOptions(selected);

  const total = mapOptionsToCurves(options).length;

  const renderEmpty = () => (
    <EmptyState emptySubtitle="Sorry, but we couldn’t find anything based on your search" />
  );

  return (
    <DropdownWrapper>
      <Select
        isMulti
        theme="grey"
        title={title}
        SelectAllLabel="All"
        placeholder="Search"
        value={selectedOptions}
        onChange={(values: OptionType<string>[]) => {
          onChange(mapOptionsToCurves(values));
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
