import styled from 'styled-components';

import { ICellRendererParams } from 'ag-grid-community';

import { Checkbox } from '@cognite/cogs.js';

import { DraftRowData } from '../../../../../../redux/reducers/global/dataManagementReducer';

export const CheckboxCellRenderer = (params: ICellRendererParams) => {
  const rowData = params.node.data as DraftRowData;
  const isDraftRow = rowData && rowData._draftStatus;
  const isRowSelected = isDraftRow
    ? params.node.data._isDraftSelected
    : params.node.isSelected();
  const name = isDraftRow
    ? `row_${rowData.externalId}`
    : `row_${params.node.id}`;

  const handleChange = (_: unknown, checkedStatus?: boolean | string) => {
    if (isDraftRow) {
      params.node.setDataValue('_isDraftSelected', checkedStatus);
    } else {
      params.node.setSelected(!!checkedStatus);
    }
  };

  return (
    <StyledCheckbox
      data-cy="draft-row-selection-checkbox"
      name={name}
      checked={isRowSelected}
      onChange={handleChange}
    />
  );
};

const StyledCheckbox = styled(Checkbox)`
  & > .checkbox-ui {
    margin: 0 2px 0 0 !important;
  }
`;
