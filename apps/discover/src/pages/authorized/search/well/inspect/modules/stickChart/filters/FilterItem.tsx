import React, { useState } from 'react';

import { Checkbox } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';

import { ChartColumn } from '../types';

import {
  FilterItemWrapper,
  VertSeperator,
  DragHandler,
  ColumnName,
} from './elements';

export interface FilterItemProps {
  column: ChartColumn;
  onFiterVisiblityChange?: (column: ChartColumn, visibility: boolean) => void;
  children?: React.ReactNode;
}

export const FilterItem: React.FC<WithDragHandleProps<FilterItemProps>> =
  React.memo(
    ({ column, onFiterVisiblityChange, children, ...dragHandleProps }) => {
      const [checked, setChecked] = useState<boolean>(true);

      const handleChange = (selected: boolean) => {
        setChecked(selected);
        onFiterVisiblityChange?.(column, selected);
      };

      return (
        <FilterItemWrapper>
          <DragHandler type="DragHandleHorizontal" {...dragHandleProps} />

          {onFiterVisiblityChange ? (
            <Checkbox name={column} checked={checked} onChange={handleChange}>
              <ColumnName>{column}</ColumnName>
            </Checkbox>
          ) : (
            <ColumnName>{column}</ColumnName>
          )}

          {Boolean(children) && <VertSeperator />}
          {children}
        </FilterItemWrapper>
      );
    }
  );
