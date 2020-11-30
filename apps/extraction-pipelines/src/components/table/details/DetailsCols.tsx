import { Cell, Column } from 'react-table';
import React from 'react';
import { Button, Detail } from '@cognite/cogs.js';
import EditableCell from 'components/inputs/EditableInput';
import styled from 'styled-components';
import { Integration } from '../../../model/Integration';
import { EditableHelpers } from './DetailsTable';
import { DetailFieldNames } from '../../../utils/integrationUtils';
import { TableHeadings } from '../IntegrationTableCol';

const StyledButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
  }
`;
export type DetailsInputType = 'text' | 'textarea';
export type IntegrationFieldName = keyof Integration | 'status' | 'latestRun';
export type IntegrationFieldValue = Integration[keyof Integration] | null;
export interface DetailsCol {
  label: DetailFieldNames | TableHeadings;
  accessor: IntegrationFieldName;
  value: IntegrationFieldValue;
  isEditable: boolean;
  inputType?: DetailsInputType;
}
export const detailsCols: Column<DetailsCol>[] = [
  {
    id: 'label',
    accessor: 'label',
    Cell: ({ row }: Cell<DetailsCol>) => {
      return <Detail strong>{row.values.label}</Detail>;
    },
  },
  {
    id: 'value',
    accessor: 'value',
    Cell: (props: Cell<DetailsCol> & EditableHelpers) => {
      const { row, column, updateData } = props;
      return (
        <>
          {row.isExpanded ? (
            <EditableCell<DetailsCol>
              value={row.values.value}
              row={row}
              column={column}
              updateData={updateData}
              inputType={row.original.inputType}
            />
          ) : (
            row.values.value
          )}
        </>
      );
    },
  },
  {
    id: 'edit',
    Cell: ({
      row,
      undoChange,
      saveChange,
    }: Cell<DetailsCol> & EditableHelpers) => {
      const onSave = () => {
        saveChange(row.index, row.original);
        row.toggleRowExpanded(false); // maybe wait with this until changes is api success
      };
      const onCancel = () => {
        undoChange(row.index);
        row.toggleRowExpanded(false);
      };
      if (row.original.isEditable && !row.isExpanded) {
        // eslint-disable-next-line
        // todo alias expand?
        return (
          <StyledButtonGroup>
            <Button
              type="primary"
              {...row.getToggleRowExpandedProps()}
              title="Toggle edit row"
            >
              Edit
            </Button>
          </StyledButtonGroup>
        );
      }
      if (row.original.isEditable && row.isExpanded) {
        return (
          <StyledButtonGroup>
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" onClick={onSave}>
              Save
            </Button>
          </StyledButtonGroup>
        );
      }
      return null;
    },
  },
];
