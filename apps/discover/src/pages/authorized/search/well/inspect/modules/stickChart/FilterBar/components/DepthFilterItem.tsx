import React from 'react';

import { Icon, Switch } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { Dropdown } from 'components/Dropdown';
import { DepthMeasurementUnit } from 'constants/units';

import { Option } from '../../components/Option';
import { ChartColumn } from '../../types';
import {
  DEPTH_MEASUREMENT_TYPES,
  UNIFY_SCALES_SWITCH_TEXT,
} from '../../WellboreStickChart/constants';
import {
  DropDownIconStyler,
  MultiSelectIconWrapper,
  UnifyScalesLabel,
  UnifyScalesSwitchWrapper,
} from '../elements';

import { FilterItem } from './FilterItem';

export interface DepthFilterItemProps {
  depthMeasurementType: DepthMeasurementUnit;
  isUnifiedScale: boolean;
  onChangeDepthMeasurementType: (
    depthMeasurementType: DepthMeasurementUnit
  ) => void;
  onToggleUnifyScale: (isUnifiedScale: boolean) => void;
}

export const DepthFilterItem: React.FC<
  WithDragHandleProps<DepthFilterItemProps>
> = React.memo(
  ({
    depthMeasurementType,
    isUnifiedScale,
    onChangeDepthMeasurementType,
    onToggleUnifyScale,
    ...dragHandleProps
  }) => {
    const DropdownContent = (
      <Dropdown.Menu>
        {DEPTH_MEASUREMENT_TYPES.map((option) => (
          <Option
            key={option}
            option={option}
            isSelected={option === depthMeasurementType}
            onChange={onChangeDepthMeasurementType}
          />
        ))}

        <Dropdown.Menu.Divider />

        <UnifyScalesSwitchWrapper>
          <UnifyScalesLabel>{UNIFY_SCALES_SWITCH_TEXT}</UnifyScalesLabel>
          <Switch
            name={UNIFY_SCALES_SWITCH_TEXT}
            size="small"
            checked={isUnifiedScale}
            onChange={onToggleUnifyScale}
          />
        </UnifyScalesSwitchWrapper>
      </Dropdown.Menu>
    );

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
  }
);
