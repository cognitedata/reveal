import { InternalThreeDModelData } from '@data-exploration-lib/domain-layer';
import { Table, TableProps } from '@data-exploration/components';
import React, { useMemo, useState } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { ThreedRevisions } from './ThreedRevisions';
import { ThreedModelLastUpdated } from './ThreedModelLastUpdated';
import { ThreedModelDisplay } from './ThreedModelDisplay';
import { Image360Display } from './Image360Display';

interface ThreeDTableProps
  extends Omit<TableProps<InternalThreeDModelData>, 'columns'> {
  FilterHeader: JSX.Element;
}

export const ThreeDTable = ({
  data,
  query,
  FilterHeader,
  ...rest
}: ThreeDTableProps) => {
  const modelData = data.map((model) => ({
    revisions: [],
    name: model.name,
    id: model.id,
    metadata: model.metadata,
    dataSetId: model.dataSetId,
    createdTime: model.createdTime,
    type: model.type,
    siteId: model.siteId,
  }));
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () =>
      [
        {
          id: 'name',
          accessorKey: 'name',
          header: 'Name',
          cell: ({ row }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: `${row.depth * 2}rem`,
              }}
            >
              {row.getCanExpand() && (
                <Icon
                  type={row.getIsExpanded() ? 'ChevronUp' : 'ChevronDown'}
                  {...{
                    onClick: (event: any) => {
                      event.preventDefault();
                      event.stopPropagation();
                      row.toggleExpanded();
                    },
                    style: {
                      cursor: 'pointer',
                      marginRight: '8px',
                      height: '16px',
                      flexShrink: 0,
                    },
                  }}
                />
              )}
              {row.original?.type === 'img360' ? (
                <Image360Display model={row.original} />
              ) : (
                <ThreeDModelDisplay model={row.original} />
              )}
            </div>
          ),
          meta: {
            isExpandable: true,
          },
          enableSorting: true,
        },
        {
          id: 'revisions',
          accessorKey: 'id',
          header: 'Revisions',
          cell: ({ getValue, row }) => (
            <ThreeDRevisions
              modelId={getValue<number>()}
              is360Image={row.original?.type === 'img360'}
            />
          ),
          enableSorting: false,
        },

        {
          id: 'updated',
          accessorKey: 'id',
          header: 'Updated',
          cell: ({ getValue, row }) => (
            <ThreeDModelLastUpdated
              modelId={getValue<number>()}
              is360Image={row.original?.type === 'img360'}
            />
          ),
          enableSorting: false,
        },
        { ...Table.Columns.created, enableSorting: true },
      ] as ColumnDef<InternalThreeDModelData>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  return (
    <Table<InternalThreeDModelData>
      columns={columns}
      data={modelData}
      enableExpanding
      tableHeaders={FilterHeader}
      {...rest}
      enableSorting
      sorting={sorting}
      onSort={setSorting}
      manualSorting={false}
    />
  );
};
export const ThreeDTableWrapper = styled.div`
  border-radius: 8px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--cogs-border--muted);
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  background-color: var(--cogs-surface--medium);
`;
