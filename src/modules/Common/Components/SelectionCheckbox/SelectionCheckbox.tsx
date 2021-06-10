import { useSelectionCheckbox } from '@cognite/data-exploration';
import React from 'react';
import styled from 'styled-components';
import { TableDataItem } from '../../types';

export const SelectionCheckbox = ({
  dataItem,
  selected,
  handleItemSelect,
}: {
  dataItem: TableDataItem;
  selected: boolean;
  handleItemSelect: (item: TableDataItem, selected: boolean) => void;
}) => {
  const selectionCheckbox = useSelectionCheckbox(
    'multiple',
    dataItem.id,
    selected,
    () => handleItemSelect(dataItem, !selected)
  );
  return <Selection>{selectionCheckbox}</Selection>;
};

const Selection = styled.div`
  position: absolute;
  top: 12px;
  left: 24px;
  .cogs-checkbox {
    .checkbox-ui {
      background: #ffffff;
      border: 2px solid #bfbfbf;
      box-sizing: border-box;
      border-radius: 4px;
    }
  }
`;
