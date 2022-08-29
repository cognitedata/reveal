import React, { useCallback, useState } from 'react';

import { BooleanMap, toBooleanMap } from 'utils/booleanMap';

import { Dropdown, Icon } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelect } from 'components/Filters';
import { useDeepMemo } from 'hooks/useDeep';

import { ChartColumn, SummarySection } from '../types';

import {
  DropDownIconStyler,
  MultiSelectIconWrapper,
  MultiSelectWrapper,
} from './elements';
import { FilterItem } from './FilterItem';

export interface SummaryFilterItemProps {
  onChange: (selection: BooleanMap) => void;
  onFiterVisiblityChange: (column: ChartColumn, visibility: boolean) => void;
}

export const SummaryFilterItem: React.FC<
  WithDragHandleProps<SummaryFilterItemProps>
> = React.memo(({ onChange, onFiterVisiblityChange, ...dragHandleProps }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleValueChange = useCallback(
    (values: string[]) => {
      setSelectedOptions(values);
      onChange(toBooleanMap(values));
    },
    [setSelectedOptions, onChange]
  );

  const DropdownContent = useDeepMemo(() => {
    return (
      <MultiSelectWrapper>
        <MultiSelect
          menuIsOpen
          showCheckbox
          enableSelectAll
          selectAllLabel="Expand all"
          width={200}
          options={Object.values(SummarySection)}
          selectedOptions={selectedOptions}
          onValueChange={handleValueChange}
        />
      </MultiSelectWrapper>
    );
  }, [selectedOptions, handleValueChange]);

  return (
    <FilterItem
      column={ChartColumn.SUMMARY}
      onFiterVisiblityChange={onFiterVisiblityChange}
      {...dragHandleProps}
    >
      <DropDownIconStyler>
        <Dropdown appendTo={document.body} content={DropdownContent}>
          <MultiSelectIconWrapper>
            <Icon type="Configure" />
          </MultiSelectIconWrapper>
        </Dropdown>
      </DropDownIconStyler>
    </FilterItem>
  );
});
