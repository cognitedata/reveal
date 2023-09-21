// This file is inspired by the file ThreeDTable.tsx in the data-exploration project, but modified to be used in the 3d-management project.
import { useMemo } from 'react';

import styled from 'styled-components';

import { TimeDisplay, Table, TableProps } from '@data-exploration/components';
import { Image360Display } from '@data-exploration/containers';
import { ColumnDef } from '@tanstack/react-table';

import { Body, BodySize } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';
import { Image360Data } from '@data-exploration-lib/domain-layer';

import { InternalThreeDModelData } from '../../types';

type ThreeDTableProps = Omit<TableProps<InternalThreeDModelData>, 'columns'>;
const CREATED_TIME_TEXT_SIZE: BodySize = 'small';
export const ThreeSixtyTable = ({ data, ...rest }: ThreeDTableProps) => {
  const modelData = data.map((model) => ({
    revisions: [],
    name: model.name,
    id: model.id,
    metadata: model.metadata,
    dataSetId: model.dataSetId,
    createdTime: model.createdTime,
    lastUpdatedTime: model.lastUpdatedTime,
    type: model.type,
    siteId: model.siteId,
  }));

  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<InternalThreeDModelData>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: t('NAME', 'Name'),
        cell: ({ row }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: `${row.depth * 2}rem`,
            }}
          >
            <Image360Display model={row.original as Image360Data} />
          </div>
        ),
        meta: {
          isExpandable: true,
        },
        enableSorting: true,
      },
      {
        header: t('CREATED_TIME', 'Created'),
        accessorKey: 'createdTime',
        cell: ({ getValue }) => (
          <Body size={CREATED_TIME_TEXT_SIZE}>
            <TimeDisplay value={getValue<number | Date>()} />
          </Body>
        ),
      },
    ],
    [t]
  );

  return (
    <Table<InternalThreeDModelData>
      columns={columns}
      data={modelData}
      enableExpanding
      {...rest}
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
