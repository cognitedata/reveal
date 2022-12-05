import { MeasurementTypeParent } from 'domain/wells/measurements/internal/types';

import React, { useCallback, useState } from 'react';

import { BooleanMap, toBooleanMap } from 'utils/booleanMap';

import { Dropdown, Icon } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { MultiSelect } from 'components/Filters';
import { PressureUnit } from 'constants/units';

import { PRESSURE_UNITS } from '../../measurements/constants';
import { FilterSubmenu } from '../components/FilterSubmenu';
import { ChartColumn } from '../types';

import {
  DropDownIconStyler,
  FooterWrapper,
  MultiSelectIconWrapper,
  MultiSelectWrapper,
} from './elements';
import { FilterItem } from './FilterItem';

const MEASUREMENT_TYPES = [
  MeasurementTypeParent.FIT,
  MeasurementTypeParent.LOT,
];

export interface MeasurementsFilterItemProps {
  pressureUnit: PressureUnit;
  onChange: (selection: BooleanMap) => void;
  onFiterVisiblityChange: (column: ChartColumn, visibility: boolean) => void;
  onPressureUnitChange: (unit: PressureUnit) => void;
}

export const MeasurementsFilterItem: React.FC<
  WithDragHandleProps<MeasurementsFilterItemProps>
> = React.memo(
  ({
    pressureUnit,
    onChange,
    onFiterVisiblityChange,
    onPressureUnitChange,
    ...dragHandleProps
  }) => {
    const [selectedOptions, setSelectedOptions] = useState(MEASUREMENT_TYPES);

    const handleValueChange = useCallback(
      (values: string[]) => {
        setSelectedOptions(values as MeasurementTypeParent[]);
        onChange(toBooleanMap(values));
      },
      [setSelectedOptions, onChange]
    );

    const renderPressureUnitSelector = useCallback(() => {
      return (
        <FooterWrapper>
          <FilterSubmenu<PressureUnit>
            title="Pressure unit"
            selectedOption={pressureUnit}
            options={PRESSURE_UNITS}
            onChange={onPressureUnitChange}
          />
        </FooterWrapper>
      );
    }, [pressureUnit, onPressureUnitChange]);

    const DropdownContent = (
      <MultiSelectWrapper>
        <MultiSelect
          menuIsOpen
          showCheckbox
          enableSelectAll
          selectAllLabel="All"
          width={140}
          options={MEASUREMENT_TYPES}
          selectedOptions={selectedOptions}
          onValueChange={handleValueChange}
          footer={renderPressureUnitSelector}
        />
      </MultiSelectWrapper>
    );

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
  }
);
