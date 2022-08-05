import React, { useState } from 'react';

import { Checkbox } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';

import { ChartColumn } from '../types';

import {
  FilterItemWrapper,
  FilterItemElement,
  FilterText,
  VertSeperator,
  DragHandler,
} from './elements';

export interface FilterItemProps {
  column: ChartColumn;
  onFiterVisiblityChange: (
    columnIdentifier: ChartColumn,
    visibility: boolean
  ) => void;
  children?: React.ReactNode;
}

export const FilterItem: React.FC<WithDragHandleProps<FilterItemProps>> =
  React.memo(
    ({ column, onFiterVisiblityChange, children, ...dragHandleProps }) => {
      const [checked, setChecked] = useState<boolean>(true);
      const handleChange = (selected: boolean) => {
        setChecked(selected);
        onFiterVisiblityChange(column, selected);
      };

      return (
        <FilterItemWrapper>
          <FilterItemElement>
            <DragHandler
              type="DragHandleHorizontal"
              size={25}
              {...dragHandleProps}
            />
          </FilterItemElement>
          <FilterItemElement>
            <Checkbox
              name={column}
              checked={checked}
              onChange={(selected: boolean) => handleChange(selected)}
            />
          </FilterItemElement>
          <FilterItemElement>
            <FilterText>{column}</FilterText>
          </FilterItemElement>
          {children && <VertSeperator />}
          {children}
        </FilterItemWrapper>
      );
    }
  );
