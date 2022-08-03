import React, { useState } from 'react';

import { Checkbox, Icon } from '@cognite/cogs.js';

import { WithDragHandleProps } from 'components/DragDropContainer';

import {
  FilterItemWrapper,
  FilterItemElement,
  FilterText,
  VertSeperator,
} from './elements';

export interface FilterItemProps {
  text: string;
  column: string;
  key: React.Key;
  onFiterVisiblityChange: (
    columnIdentifier: string,
    visibility: boolean
  ) => void;
  children?: React.ReactNode;
}

export const FilterItem: React.FC<WithDragHandleProps<FilterItemProps>> =
  React.memo(
    ({
      text,
      column,
      onFiterVisiblityChange,
      children,
      ...dragHandleProps
    }) => {
      const [checked, setChecked] = useState<boolean>(true);
      const handleChange = (selected: boolean) => {
        setChecked(selected);
        onFiterVisiblityChange(column, selected);
      };

      return (
        <FilterItemWrapper>
          <FilterItemElement>
            <Icon type="DragHandleHorizontal" {...dragHandleProps} />
          </FilterItemElement>
          <FilterItemElement>
            <Checkbox
              name={column}
              checked={checked}
              onChange={(selected: boolean) => handleChange(selected)}
            />
          </FilterItemElement>
          <FilterItemElement>
            <FilterText>{text}</FilterText>
          </FilterItemElement>
          {children && <VertSeperator />}
          {children}
        </FilterItemWrapper>
      );
    }
  );
