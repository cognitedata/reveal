import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

import React, { useCallback, useState } from 'react';

import { BooleanMap, toBooleanMap } from 'utils/booleanMap';

import { Dropdown, Icon } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelect } from 'components/Filters';
import { useDeepMemo } from 'hooks/useDeep';

import { ChartColumn } from '../types';

import {
  DropDownIconStyler,
  MultiSelectIconWrapper,
  MultiSelectWrapper,
} from './elements';
import { FilterItem } from './FilterItem';

const MEASUREMENT_TYPES = [
  MeasurementTypeParent.FIT,
  MeasurementTypeParent.LOT,
];

export interface MeasurementsFilterItemProps {
  onChange: (selection: BooleanMap) => void;
  onFiterVisiblityChange: (column: ChartColumn, visibility: boolean) => void;
}

export const MeasurementsFilterItem: React.FC<
  WithDragHandleProps<MeasurementsFilterItemProps>
> = React.memo(({ onChange, onFiterVisiblityChange, ...dragHandleProps }) => {
  const [selectedOptions, setSelectedOptions] = useState(MEASUREMENT_TYPES);

  const handleValueChange = useCallback(
    (values: string[]) => {
      setSelectedOptions(values as MeasurementTypeParent[]);
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
          selectAllLabel="All"
          width={100}
          options={MEASUREMENT_TYPES}
          selectedOptions={selectedOptions}
          onValueChange={handleValueChange}
        />
      </MultiSelectWrapper>
    );
  }, [selectedOptions, handleValueChange]);

  return (
    <FilterItem
      column={ChartColumn.MEASUREMENTS}
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
