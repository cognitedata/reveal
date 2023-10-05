// This file is inspired by the file ThreeDTable.tsx in the data-exploration project, but modified to be used in the 3d-management project.
import { useMemo } from 'react';

import styled from 'styled-components';

import { TimeDisplay, Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { Body, BodySize } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { InternalThreeDModelData } from '../../types';

import { ThreeSixtyContextualizationProcess } from './ThreeSixtyContextualizationProcess';
import { ThreeSixtyContextualizationStatus } from './ThreeSixtyContextualizationStatus';
import { ThreeSixtyImageDisplay } from './ThreeSixtyImageDisplay';

type ThreeDTableProps = Omit<TableProps<InternalThreeDModelData>, 'columns'>;
interface ThreeSixtyTableProps extends ThreeDTableProps {
  showAssetTagDetectionButton: boolean;
  onRunAssetTagClick: (image360id: string) => void;
}
const CREATED_TIME_TEXT_SIZE: BodySize = 'small';

export const ThreeSixtyTable = ({
  showAssetTagDetectionButton,
  data,
  onRunAssetTagClick,
  ...rest
}: ThreeSixtyTableProps) => {
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
        accessorKey: 'name',
        header: t('NAME', 'Name'),
        cell: ({ row }) => <ThreeSixtyImageDisplay row={row} />,
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
        enableSorting: false,
      },
      {
        accessorKey: 'contextualization_status',
        header: 'Contextualization status',
        cell: ({ row }) => <ThreeSixtyContextualizationStatus row={row} />,
        enableSorting: false,
      },
      {
        accessorKey: 'contextualization_process',
        header: '',
        cell: ({ row }) => (
          <ThreeSixtyContextualizationProcess
            row={row}
            showAssetTagDetectionButton={showAssetTagDetectionButton}
            onRunAssetTagClick={onRunAssetTagClick}
          />
        ),
        enableSorting: false,
      },
    ],
    [onRunAssetTagClick, showAssetTagDetectionButton, t]
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
