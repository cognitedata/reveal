import { WorkflowSchemaWithProcesses } from '@cognite/power-ops-api-types';
import { CommonTable } from 'components/CommonTable';
import { DropdownActionsCell } from 'components/CommonTable/cells/DropdownActionsCell';
import { SwitchCell } from 'components/CommonTable/cells/SwitchCell';
import { ComponentProps, useMemo } from 'react';

type Props = {
  selectedIndex?: number;
  data: WorkflowSchemaWithProcesses[];
  hasUnsavedChanges: boolean;
  onSave: (newWorkflowSchema: WorkflowSchemaWithProcesses) => void;
  onSelect: (index: number, hasUnsavedChanges: boolean) => void;
  onDuplicate: (workflowSchema: WorkflowSchemaWithProcesses) => void;
  onDelete: (workflowSchema: WorkflowSchemaWithProcesses) => void;
};

type SelectableWorkflowSchemaWithProcesses = WorkflowSchemaWithProcesses & {
  isSelected?: boolean;
};

export const WorkflowSchemaTable = ({
  selectedIndex,
  data,
  hasUnsavedChanges,
  onSave,
  onSelect,
  onDuplicate,
  onDelete,
}: Props) => {
  const enhancedData: SelectableWorkflowSchemaWithProcesses[] = data.map(
    (wf, i) => (i === selectedIndex ? { ...wf, isSelected: true } : wf)
  );
  const columns = useMemo<
    ComponentProps<typeof CommonTable<typeof enhancedData[number]>>['columns']
  >(
    () => [
      {
        Header: 'Active',
        accessor: 'enabled',
        Cell: SwitchCell({
          onChange: onSave,
          property: 'enabled',
        }),
      },
      {
        Header: 'Name',
        accessor: 'name',
        cellProps: (props, { cell }) => ({
          ...props,
          onClick: () => onSelect(cell.row.index, hasUnsavedChanges),
          style: { cursor: 'pointer' },
        }),
      },
      {
        Header: 'Type',
        accessor: 'workflowType',
        cellProps: (props, { cell }) => ({
          ...props,
          onClick: () => onSelect(cell.row.index, hasUnsavedChanges),
          style: { cursor: 'pointer' },
        }),
      },
      {
        Header: ' ',
        accessor: 'id',
        disableSortBy: true,
        Cell: DropdownActionsCell({
          placement: 'bottom-end',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          items: ({ isSelected, ...original }) => [
            {
              children: 'Duplicate',
              icon: 'Duplicate',
              onClick: () => onDuplicate(original),
              css: {},
            },
            {
              children: 'Delete',
              icon: 'Delete',
              style: { color: 'var(--cogs-text-icon--status-critical)' },
              onClick: () => onDelete(original),
              css: {},
            },
          ],
        }),
      },
    ],
    [hasUnsavedChanges, onSave, onSelect, onDuplicate, onDelete]
  );
  return (
    <CommonTable columns={columns} data={enhancedData} showPagination={false} />
  );
};
