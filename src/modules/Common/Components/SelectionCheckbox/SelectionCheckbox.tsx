import React from 'react';
import { Checkbox } from '@cognite/cogs.js';
import { TableDataItem } from 'src/modules/Common/types';
import styled from 'styled-components';

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
      onChange={(nextState) => handleItemSelect(dataItem, nextState)}
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
