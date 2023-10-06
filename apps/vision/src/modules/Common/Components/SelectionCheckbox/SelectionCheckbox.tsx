import React from 'react';

import styled from 'styled-components';

import { Checkbox } from '@cognite/cogs.js';

import { TableDataItem } from '../../types';

const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

export const SelectionCheckbox = ({
  dataItem,
  selected,
  handleItemSelect,
}: {
  dataItem: TableDataItem;
  selected: boolean;
  handleItemSelect: (item: TableDataItem, selected: boolean) => void;
}) => (
  <CheckboxContainer
    role="button"
    tabIndex={0}
    onClick={handleClick}
    onKeyDown={handleClick}
  >
    <Checkbox
      name="ckbGridItem"
      checked={selected}
      onChange={(_event, next) => handleItemSelect(dataItem, next as boolean)}
    />
  </CheckboxContainer>
);

const CheckboxContainer = styled.div`
  position: absolute;
  top: 14px;
  left: 9px;
  .cogs-checkbox {
    .checkbox-ui {
      background: #ffffff;
      border: 2px solid #bfbfbf;
      box-sizing: border-box;
      border-radius: 4px;
    }
  }
`;
