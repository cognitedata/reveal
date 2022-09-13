import React from 'react';

import { Icon } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { Dropdown } from 'components/Dropdown';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { Option } from '../components/Option';
import { ChartColumn } from '../types';
import { DEPTH_MEASUREMENT_TYPES } from '../WellboreStickChart/constants';

import { DropDownIconStyler, MultiSelectIconWrapper } from './elements';
import { FilterItem } from './FilterItem';

export interface DepthFilterItemProps {
  depthMeasurementType: DepthMeasurementUnit;
  onChange: (depthMeasurementType: DepthMeasurementUnit) => void;
}

export const DepthFilterItem: React.FC<
  WithDragHandleProps<DepthFilterItemProps>
> = React.memo(({ depthMeasurementType, onChange, ...dragHandleProps }) => {
  const DropdownContent = useDeepMemo(() => {
    return (
      <Dropdown.Menu>
        {DEPTH_MEASUREMENT_TYPES.map((option) => (
          <Option
            key={option}
            option={option}
            isSelected={option === depthMeasurementType}
            onChange={onChange}
          />
        ))}
      </Dropdown.Menu>
    );
  }, [depthMeasurementType]);

  return (
    <FilterItem column={ChartColumn.DEPTH} {...dragHandleProps}>
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
