import { Cell, Column } from 'react-table';
import React from 'react';
import { Button, Detail } from '@cognite/cogs.js';
import EditableCell from 'components/inputs/EditableInput';
import styled from 'styled-components';
import { Integration } from '../../../model/Integration';
import { EditableHelpers } from './DetailsTable';
import {
  calculateStatus,
  DetailFieldNames,
} from '../../../utils/integrationUtils';
import { TableHeadings } from '../IntegrationTableCol';
import DetailsValueView from './DetailsValueView';
import { MetaData } from '../../../model/MetaData';
import { uppercaseFirstWord } from '../../../utils/primitivesUtils';
import { Status } from '../../../model/Status';

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
export type IntegrationFieldValue =
  | Integration[keyof Integration]
  | moment.Moment
  | null;
export interface DetailsCol {
  label: DetailFieldNames | TableHeadings | string;
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
    Cell: ({ row, column, updateData }: Cell<DetailsCol> & EditableHelpers) => {
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
            <DetailsValueView
              fieldValue={row.original.value}
              fieldName={row.original.accessor}
            />
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

export const createMetadataCols = (metadata: MetaData): DetailsCol[] => {
  return Object.entries(metadata).map(([k, v]) => {
    return {
      label: uppercaseFirstWord(k),
      accessor: 'metadata',
      value: v,
      isEditable: false,
    };
  });
};
export const createDataSetCol = (integrationInfo: Integration): DetailsCol => {
  if (integrationInfo.dataSet) {
    return {
      label: TableHeadings.DATA_SET,
      accessor: 'dataSet',
      value: integrationInfo.dataSet,
      isEditable: false,
    };
  }
  return {
    label: TableHeadings.DATA_SET,
    accessor: 'dataSetId',
    value: integrationInfo.dataSetId,
    isEditable: false,
  };
};

export const createLatestRunCol = (int: Integration): DetailsCol => {
  const { status: latestStatus } = calculateStatus({
    lastSuccess: int.lastSuccess,
    lastFailure: int.lastFailure,
  });
  const latestRun =
    latestStatus === Status.FAIL ? int.lastFailure : int.lastSuccess;
  return {
    label: TableHeadings.LATEST_RUN,
    accessor: 'latestRun',
    value: latestRun,
    isEditable: false,
  };
};
