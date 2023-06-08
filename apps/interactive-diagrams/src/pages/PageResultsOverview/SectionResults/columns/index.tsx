import React from 'react';

import {
  Flex,
  LoadingSkeleton,
} from '@interactive-diagrams-app/components/Common';
import DiagramReviewStatus from '@interactive-diagrams-app/components/DiagramReviewStatus';
import { StatusType } from '@interactive-diagrams-app/components/Filters';
import InteractiveIcon from '@interactive-diagrams-app/components/InteractiveIcon';
import { ApiStatusCount } from '@interactive-diagrams-app/modules/types';
import { stringCompare } from '@interactive-diagrams-app/utils/utils';

import { Body } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import ColumnFileActions from './ColumnFileActions';
import ColumnLinkedTo from './ColumnLinkedTo';
import ColumnProgress from './ColumnProgress';
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
