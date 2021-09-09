import React from 'react';
import { Body } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';
import { UploadJobState } from 'modules/contextualization/uploadJobs';
import { stringCompare } from 'modules/contextualization/utils';
import { Flex, LoadingSkeleton } from 'components/Common';
import { StatusType } from 'components/Filters';
import ReviewStatus from 'components/ReviewStatus';
import InteractiveIcon from 'components/InteractiveIcon';
import ColumnProgress from './ColumnProgress';
import ColumnFileActions from './ColumnFileActions';
import ColumnLinkedTo from './ColumnLinkedTo';

export interface AdjustedFileInfo extends FileInfo {
  uploadJob?: UploadJobState;
  progress?: keyof ApiStatusCount | 'idle';
  status?: StatusType;
  links?: number;
  approval?: boolean;
  svg?: boolean;
}
export const getColumns: any = (
  workflowId: number,
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
      render: (_: any, file: any) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <ColumnProgress file={file} workflowId={workflowId} />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'Status',
      width: 150,
      render: (_: any, file: FileInfo) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <ReviewStatus file={file} size="medium" />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'Linked to',
      key: 'annotations_new',
      width: 150,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        (a?.links ?? 0) - (b?.links ?? 0),
      render: (_: any, file: any) => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <ColumnLinkedTo fileId={file.id} workflowId={workflowId} />
        </LoadingSkeleton>
      ),
    },
    {
      title: 'SVG',
      key: 'svg',
      width: 120,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(String(a?.svg), String(b?.svg)),
      render: () => (
        <LoadingSkeleton loading={showLoadingSkeleton}>
          <span>N/A</span>
        </LoadingSkeleton>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (file: any) => <ColumnFileActions file={file} />,
    },
  ];
};
