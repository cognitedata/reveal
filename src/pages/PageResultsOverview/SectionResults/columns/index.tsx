import React from 'react';
import { Body } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { ApiStatusCount } from 'modules/types';
import { stringCompare } from 'utils/utils';
import { Flex, LoadingSkeleton } from 'components/Common';
import { StatusType } from 'components/Filters';
import DiagramReviewStatus from 'components/DiagramReviewStatus';
import InteractiveIcon from 'components/InteractiveIcon';
import ColumnProgress from './ColumnProgress';
import ColumnFileActions from './ColumnFileActions';
import ColumnLinkedTo from './ColumnLinkedTo';
import ColumnSVGStatus from './ColumnSVGStatus';

export interface AdjustedFileInfo extends FileInfo {
  progress?: keyof ApiStatusCount | 'idle';
  status?: StatusType;
  links?: number;
  approval?: boolean;
  svg?: boolean;
}
export const getColumns: any = (
  _workflowId: number,
  showLoadingSkeleton: boolean
) => {
  return [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(a?.name, b?.name),
      render: (name: any) => (
        <Flex row align>
          <InteractiveIcon />
          <Body strong level={2}>
            {name}
          </Body>
        </Flex>
      ),
    },
    {
      title: 'Progress',
      key: 'status',
      width: 150,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(a?.status, b?.status),
      render: (_: any, file: FileInfo) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <ColumnProgress file={file} />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'Status',
      width: 150,
      render: (_: any, file: FileInfo) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <DiagramReviewStatus fileId={file.id} size="medium" />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'Linked to',
      key: 'annotations_new',
      width: 150,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        (a?.links ?? 0) - (b?.links ?? 0),
      render: (_: any, file: FileInfo) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <ColumnLinkedTo fileId={file.id} />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'SVG',
      key: 'svg',
      width: 120,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(String(a?.svg), String(b?.svg)),
      render: (_: any, file: FileInfo) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <ColumnSVGStatus fileId={file.id} />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      render: (file: any) => <ColumnFileActions file={file} />,
    },
  ];
};
